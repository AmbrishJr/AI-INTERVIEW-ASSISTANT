import { useEffect, useRef, useState } from "react";
import type { Detection, FaceDetector } from "@mediapipe/tasks-vision";
// Bundled locally (no CDN) so detection works offline and versions always match.
import wasmLoaderPath from "@mediapipe/tasks-vision/vision_wasm_internal.js?url";
import wasmBinaryPath from "@mediapipe/tasks-vision/vision_wasm_internal.wasm?url";

const MODEL_PATH = "/models/blaze_face_short_range.tflite";
const DETECT_INTERVAL_MS = 200;
const MIN_CONFIDENCE = 0.6;

/** How many consecutive frames a new status must hold before we report it (avoids flicker). */
const FRAMES_TO_CONFIRM: Record<FaceStatus, number> = {
  off: 1,
  loading: 1,
  unavailable: 1,
  "no-face": 5, // ~1s
  "multiple-faces": 5,
  ok: 2,
};

export type FaceStatus = "off" | "loading" | "unavailable" | "no-face" | "multiple-faces" | "ok";
export type FaceIssue = "looking-away" | "too-far" | "too-close" | "off-center";

export interface FaceAnalysis {
  status: FaceStatus;
  /** Framing/attention problems; only populated when status is "ok". */
  issues: FaceIssue[];
}

let detectorPromise: Promise<FaceDetector> | null = null;

/** Loads the MediaPipe face detector once and shares it across mounts. Prefers GPU, falls back to CPU. */
function loadDetector(): Promise<FaceDetector> {
  detectorPromise ??= import("@mediapipe/tasks-vision")
    .then(({ FaceDetector }) => {
      const create = (delegate: "GPU" | "CPU") =>
        FaceDetector.createFromOptions(
          { wasmLoaderPath, wasmBinaryPath },
          {
            baseOptions: { modelAssetPath: MODEL_PATH, delegate },
            runningMode: "VIDEO",
            minDetectionConfidence: MIN_CONFIDENCE,
          },
        );
      return create("GPU").catch(() => create("CPU"));
    })
    .catch((err) => {
      detectorPromise = null; // allow a retry on next mount
      throw err;
    });
  return detectorPromise;
}

/**
 * Classifies a frame's detections. BlazeFace keypoints are:
 * 0 right eye, 1 left eye, 2 nose tip, 3 mouth, 4 right ear, 5 left ear (normalized 0-1).
 */
function analyzeFrame(detections: Detection[], frameWidth: number, frameHeight: number): FaceAnalysis {
  // Ignore tiny detections (faces on posters/background people far away).
  const faces = detections.filter((d) => (d.boundingBox?.width ?? 0) >= frameWidth * 0.08);
  if (faces.length === 0) return { status: "no-face", issues: [] };
  if (faces.length > 1) return { status: "multiple-faces", issues: [] };

  const issues: FaceIssue[] = [];
  const box = faces[0].boundingBox!;
  const widthRatio = box.width / frameWidth;
  const centerX = (box.originX + box.width / 2) / frameWidth;
  const centerY = (box.originY + box.height / 2) / frameHeight;

  if (widthRatio < 0.15) issues.push("too-far");
  else if (widthRatio > 0.65) issues.push("too-close");
  if (centerX < 0.2 || centerX > 0.8 || centerY < 0.15 || centerY > 0.85) issues.push("off-center");

  const [rightEye, leftEye, nose, mouth] = faces[0].keypoints;
  if (rightEye && leftEye && nose && mouth) {
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    // Head turned sideways: nose drifts toward one eye relative to the eye spacing.
    const yaw = eyeDistance > 0 ? Math.abs(nose.x - eyeMidX) / eyeDistance : 0;
    // Head tilted up/down: nose position between eye line and mouth.
    const pitchSpan = mouth.y - eyeMidY;
    const pitch = pitchSpan > 0 ? (nose.y - eyeMidY) / pitchSpan : 0.5;
    if (yaw > 0.35 || pitch < 0.2 || pitch > 0.85) issues.push("looking-away");
  }

  return { status: "ok", issues };
}

const sameAnalysis = (a: FaceAnalysis, b: FaceAnalysis) =>
  a.status === b.status && a.issues.join() === b.issues.join();

/** Runs on-device face detection against a live <video> element. */
export function useFaceDetection(video: HTMLVideoElement | null, enabled: boolean): FaceAnalysis {
  const [analysis, setAnalysis] = useState<FaceAnalysis>({ status: "off", issues: [] });
  const published = useRef(analysis);
  const pending = useRef<{ analysis: FaceAnalysis; frames: number } | null>(null);

  useEffect(() => {
    const publish = (next: FaceAnalysis) => {
      pending.current = null;
      published.current = next;
      setAnalysis(next);
    };

    if (!enabled || !video) {
      publish({ status: "off", issues: [] });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    publish({ status: "loading", issues: [] });

    // Only publish a new result once it has held for a few consecutive frames.
    const commit = (next: FaceAnalysis) => {
      if (sameAnalysis(published.current, next)) {
        pending.current = null;
        return;
      }
      const candidate = pending.current;
      const frames = candidate && sameAnalysis(candidate.analysis, next) ? candidate.frames + 1 : 1;
      if (frames >= FRAMES_TO_CONFIRM[next.status]) publish(next);
      else pending.current = { analysis: next, frames };
    };

    loadDetector()
      .then((detector) => {
        if (cancelled) return;
        timer = setInterval(() => {
          if (video.readyState < 2 || !video.videoWidth) return;
          try {
            const { detections } = detector.detectForVideo(video, performance.now());
            commit(analyzeFrame(detections, video.videoWidth, video.videoHeight));
          } catch {
            // A dropped frame is harmless; the next tick retries.
          }
        }, DETECT_INTERVAL_MS);
      })
      .catch((err) => {
        console.error("Face detection failed to load:", err);
        if (!cancelled) publish({ status: "unavailable", issues: [] });
      });

    return () => {
      cancelled = true;
      clearInterval(timer);
      pending.current = null;
    };
  }, [video, enabled]);

  return analysis;
}
