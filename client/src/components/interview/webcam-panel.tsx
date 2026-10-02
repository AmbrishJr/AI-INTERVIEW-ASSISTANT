import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { AlertTriangle, CheckCircle, Loader2, Mic, MicOff, Play, ScanFace, Square, Users, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FaceAnalysis, FaceIssue } from "@/hooks/use-face-detection";

interface WebcamPanelProps {
  isActive: boolean;
  onStart: () => void;
  onEnd: () => void;
  camOn: boolean;
  micOn: boolean;
  onToggleCam: () => void;
  onToggleMic: () => void;
  face: FaceAnalysis;
  /** Receives the live <video> element (or null) so it can be analysed. */
  onVideoElement: (video: HTMLVideoElement | null) => void;
}

const ISSUE_LABELS: Record<FaceIssue, string> = {
  "looking-away": "Looking away",
  "too-far": "Move closer",
  "too-close": "Too close",
  "off-center": "Off-center",
};

export default function WebcamPanel({
  isActive,
  onStart,
  onEnd,
  camOn,
  micOn,
  onToggleCam,
  onToggleMic,
  face,
  onVideoElement,
}: WebcamPanelProps) {
  const webcamRef = useRef<Webcam>(null);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  // Bumping the key remounts <Webcam>, which re-requests camera permission.
  const [camKey, setCamKey] = useState(0);

  const restartCamera = () => {
    setCamError(null);
    setCamReady(false);
    onVideoElement(null);
    setCamKey((k) => k + 1);
  };

  const toggleCamera = () => {
    if (camOn) onVideoElement(null);
    else restartCamera();
    onToggleCam();
  };

  const showFaceAlert = camOn && camReady && (face.status === "no-face" || face.status === "multiple-faces");

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-black border shadow-2xl min-h-[400px] transition-colors",
        showFaceAlert ? "border-red-500/70" : "border-white/10",
      )}
    >
      {camOn ? (
        <Webcam
          key={camKey}
          ref={webcamRef}
          className="w-full h-full object-cover opacity-90"
          audio={false}
          mirrored
          videoConstraints={{ facingMode: "user" }}
          onUserMedia={() => {
            setCamReady(true);
            setCamError(null);
            onVideoElement(webcamRef.current?.video ?? null);
          }}
          onUserMediaError={(err) => {
            const e = err as { name?: string; message?: string };
            setCamError(e?.name || e?.message || "Camera access was blocked");
            setCamReady(false);
            onVideoElement(null);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 min-h-[400px]">
          <VideoOff className="w-16 h-16 text-zinc-700" />
        </div>
      )}

      {camOn && !camReady && !camError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting camera…
          </div>
        </div>
      )}

      {camOn && camError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6">
          <div className="max-w-md w-full rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur p-4 text-center">
            <div className="text-sm font-medium text-white mb-1">Camera not available</div>
            <div className="text-xs text-white/70 mb-3">{camError}</div>
            <div className="text-xs text-white/60 mb-4">
              Allow camera permission for this site (browser address bar) and try again.
            </div>
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5" onClick={restartCamera}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {isActive && camOn && face.status === "ok" && <ScanOverlay />}

      {camOn && camReady && <FaceStatusBadge face={face} />}

      {showFaceAlert && <FaceAlert multiple={face.status === "multiple-faces"} />}

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-4">
        <Button
          variant={micOn ? "secondary" : "destructive"}
          size="icon"
          className="rounded-full w-12 h-12"
          onClick={onToggleMic}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          aria-pressed={!micOn}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={isActive ? "destructive" : "default"}
          size="lg"
          className={cn(
            "rounded-full px-8 font-semibold shadow-[0_0_20px_rgba(0,240,255,0.3)]",
            isActive
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
          )}
          onClick={isActive ? onEnd : onStart}
        >
          {isActive ? (
            <>
              <Square className="w-4 h-4 mr-2 fill-current" /> End Session
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2 fill-current" /> Start Session
            </>
          )}
        </Button>

        <Button
          variant={camOn ? "secondary" : "destructive"}
          size="icon"
          className="rounded-full w-12 h-12"
          onClick={toggleCamera}
          aria-label={camOn ? "Turn camera off" : "Turn camera on"}
          aria-pressed={!camOn}
        >
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}

function FaceStatusBadge({ face }: { face: FaceAnalysis }) {
  const { label, className, Icon } = (() => {
    switch (face.status) {
      case "loading":
        return { label: "Starting face detection…", className: "bg-black/60 text-white/80", Icon: Loader2 };
      case "unavailable":
        return { label: "Face detection unavailable", className: "bg-yellow-500/20 text-yellow-200", Icon: AlertTriangle };
      case "no-face":
        return { label: "No face detected", className: "bg-red-500/30 text-red-100", Icon: AlertTriangle };
      case "multiple-faces":
        return { label: "Multiple faces", className: "bg-red-500/30 text-red-100", Icon: Users };
      case "ok":
        return face.issues.length
          ? { label: face.issues.map((i) => ISSUE_LABELS[i]).join(" · "), className: "bg-yellow-500/25 text-yellow-100", Icon: ScanFace }
          : { label: "Face detected", className: "bg-green-500/25 text-green-100", Icon: CheckCircle };
      default:
        return { label: "", className: "", Icon: ScanFace };
    }
  })();

  if (!label) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur", className)}
    >
      <Icon className={cn("w-3.5 h-3.5", face.status === "loading" && "animate-spin")} />
      {label}
    </div>
  );
}

function FaceAlert({ multiple }: { multiple: boolean }) {
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-6 pointer-events-none">
      <div role="alert" className="max-w-sm rounded-xl border border-red-500/40 bg-red-950/80 backdrop-blur px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-100">
          <AlertTriangle className="w-4 h-4" />
          {multiple ? "More than one face detected" : "Face not detected"}
        </div>
        <p className="mt-1 text-xs text-red-200/80">
          {multiple
            ? "Make sure only you are visible in the camera."
            : "Make sure your face is fully visible, well lit and centered in the frame."}
        </p>
      </div>
    </div>
  );
}

function ScanOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-full h-[2px] bg-primary/50 absolute top-0 animate-[scan_3s_linear_infinite] shadow-[0_0_10px_var(--color-primary)]" />
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/50" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/50" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/50" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/50" />
    </div>
  );
}
