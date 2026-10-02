import { useEffect, useRef, useState } from "react";

/** One finished utterance as recognised by the browser. */
export interface SpeechSegment {
  id: number;
  text: string;
  words: number;
  /** Words per minute for this utterance, or null if too short to judge. */
  wpm: number | null;
  fillers: string[];
}

export interface SpeechAnalysis {
  /** Speech recognition exists in this browser (Chrome/Edge/Safari). */
  supported: boolean;
  error: string | null;
  /** The microphone itself couldn't be opened (so silence can't be measured). */
  micError: boolean;
  /** Voice is clearly present but recognition returns no words (unsupported/offline service). */
  transcriptStalled: boolean;
  /** Voice activity from the microphone volume, independent of recognition. */
  isSpeaking: boolean;
  /** 0-1 microphone level, for a meter. */
  level: number;
  /** Words recognised so far that aren't final yet. */
  interim: string;
  lastSegment: SpeechSegment | null;
  totals: { words: number; fillers: number };
  /** performance.now() of the last detected voice activity (a ref, so it doesn't re-render). */
  lastSpokeAtRef: { readonly current: number | null };
}

// Disfluencies only: words like "like" or "so" have too many legitimate uses to flag.
const FILLER_PATTERN = /\b(um+|uh+|erm+|uhm+|hmm+|you know|i mean|basically|literally)\b/gi;
const MIN_WORDS_FOR_PACE = 6;
const MIN_SECONDS_FOR_PACE = 2;
const VAD_INTERVAL_MS = 100;
/** Keep "speaking" true briefly after the voice drops, so short pauses between words don't flicker. */
const VAD_HANGOVER_MS = 600;
/** Speaking this long with zero recognised words means speech-to-text isn't working. */
const STALL_SPEAKING_MS = 15_000;

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone permission was denied. Allow it in the address bar to get speech feedback.",
  "service-not-allowed": "Speech recognition is blocked in this browser.",
  "audio-capture": "No microphone was found.",
  network: "Speech recognition needs an internet connection.",
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const getRecognitionCtor = () =>
  typeof window === "undefined" ? undefined : window.SpeechRecognition ?? window.webkitSpeechRecognition;

/**
 * Listens to the microphone while `enabled`: detects real voice activity from the
 * audio level and transcribes speech with the browser's speech recognition.
 */
export function useSpeechAnalysis(enabled: boolean, onFinalText?: (text: string) => void): SpeechAnalysis {
  const supported = Boolean(getRecognitionCtor());
  const [error, setError] = useState<string | null>(null);
  const [micError, setMicError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [level, setLevel] = useState(0);
  const [interim, setInterim] = useState("");
  const [lastSegment, setLastSegment] = useState<SpeechSegment | null>(null);
  const [totals, setTotals] = useState({ words: 0, fillers: 0 });
  const lastSpokeAtRef = useRef<number | null>(null);
  const [transcriptStalled, setTranscriptStalled] = useState(false);
  /** Voiced milliseconds since recognition last produced any words. */
  const voicedSinceResultMs = useRef(0);

  const onFinalTextRef = useRef(onFinalText);
  onFinalTextRef.current = onFinalText;

  // --- Voice activity detection from raw microphone volume ---
  useEffect(() => {
    if (!enabled) {
      setIsSpeaking(false);
      setLevel(0);
      return;
    }
    setMicError(false);
    setTranscriptStalled(false);
    voicedSinceResultMs.current = 0;

    let cancelled = false;
    let stream: MediaStream | undefined;
    let audioCtx: AudioContext | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;

    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then(async (s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        audioCtx = new AudioContext();
        await audioCtx.resume();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        audioCtx.createMediaStreamSource(s).connect(analyser);
        const samples = new Float32Array(analyser.fftSize);

        // Adaptive noise floor: speech must be clearly louder than the room's background.
        let noiseFloor = 0.01;
        let lastVoiceAt = 0;
        let speaking = false;
        let shownLevel = 0;

        timer = setInterval(() => {
          analyser.getFloatTimeDomainData(samples);
          let sum = 0;
          for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
          const rms = Math.sqrt(sum / samples.length);

          const threshold = Math.max(noiseFloor * 3, 0.02);
          const now = performance.now();
          if (rms > threshold) {
            lastVoiceAt = now;
          } else {
            noiseFloor = noiseFloor * 0.95 + rms * 0.05;
          }

          const nowSpeaking = now - lastVoiceAt < VAD_HANGOVER_MS;
          if (nowSpeaking !== speaking) {
            speaking = nowSpeaking;
            setIsSpeaking(nowSpeaking);
          }
          if (nowSpeaking) {
            lastSpokeAtRef.current = lastVoiceAt;
            voicedSinceResultMs.current += VAD_INTERVAL_MS;
            if (voicedSinceResultMs.current >= STALL_SPEAKING_MS) setTranscriptStalled(true);
          }

          const nextLevel = Math.min(1, rms / 0.15);
          if (Math.abs(nextLevel - shownLevel) > 0.05) {
            shownLevel = nextLevel;
            setLevel(nextLevel);
          }
        }, VAD_INTERVAL_MS);
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        setMicError(true);
        setError(ERROR_MESSAGES[err.name === "NotAllowedError" ? "not-allowed" : "audio-capture"]);
      });

    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
      audioCtx?.close();
      setIsSpeaking(false);
      setLevel(0);
    };
  }, [enabled]);

  // --- Speech-to-text for words, pace and filler words ---
  useEffect(() => {
    const Recognition = getRecognitionCtor();
    if (!enabled || !Recognition) {
      setInterim("");
      return;
    }

    let stopped = false;
    let segmentId = 0;
    let segmentStartedAt: number | null = null;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (event) => {
      voicedSinceResultMs.current = 0;
      setTranscriptStalled(false);
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (!text) continue;
        segmentStartedAt ??= performance.now();

        if (!result.isFinal) {
          interimText += `${text} `;
          continue;
        }

        const words = countWords(text);
        const seconds = (performance.now() - segmentStartedAt) / 1000;
        const fillers = (text.match(FILLER_PATTERN) ?? []).map((f) => f.toLowerCase());
        segmentStartedAt = null;

        setLastSegment({
          id: ++segmentId,
          text,
          words,
          wpm: words >= MIN_WORDS_FOR_PACE && seconds >= MIN_SECONDS_FOR_PACE ? Math.round(words / (seconds / 60)) : null,
          fillers,
        });
        setTotals((t) => ({ words: t.words + words, fillers: t.fillers + fillers.length }));
        onFinalTextRef.current?.(text);
      }
      setInterim(interimText.trim());
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are normal during silence or restarts.
      if (event.error === "no-speech" || event.error === "aborted") return;
      setError(ERROR_MESSAGES[event.error] ?? `Speech recognition error: ${event.error}`);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") stopped = true;
    };

    // Browsers end continuous recognition after a while; keep it running while enabled.
    recognition.onend = () => {
      if (stopped) return;
      try {
        recognition.start();
      } catch {
        // Already restarting.
      }
    };

    setError(null);
    recognition.start();

    return () => {
      stopped = true;
      recognition.onend = null;
      recognition.abort();
      setInterim("");
    };
  }, [enabled]);

  return {
    supported,
    error: error ?? (supported ? null : "Live transcript needs Chrome, Edge or Safari. Voice activity is still measured."),
    micError,
    transcriptStalled,
    isSpeaking,
    level,
    interim,
    lastSegment,
    totals,
    lastSpokeAtRef,
  };
}
