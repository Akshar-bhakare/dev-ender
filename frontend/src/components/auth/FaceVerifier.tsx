"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

type FaceStatus = "loading" | "no_face" | "too_far" | "too_close" | "look_straight" | "ready";

interface FaceVerifierProps {
  onCapture: (imageSrc: string) => void;
  loading: boolean;
}

const STATUS_CONFIG: Record<FaceStatus, { color: string; border: string; glow: string; message: string }> = {
  loading:       { color: "text-slate-400", border: "border-slate-400",  glow: "",                          message: "Starting camera..." },
  no_face:       { color: "text-red-400",   border: "border-red-400",    glow: "shadow-[0_0_20px_#f87171]", message: "No face detected — look at the camera" },
  too_far:       { color: "text-yellow-400",border: "border-yellow-400", glow: "shadow-[0_0_20px_#facc15]", message: "Move closer to the camera" },
  too_close:     { color: "text-yellow-400",border: "border-yellow-400", glow: "shadow-[0_0_20px_#facc15]", message: "Move a bit further away" },
  look_straight: { color: "text-blue-400",  border: "border-blue-400",   glow: "shadow-[0_0_20px_#60a5fa]", message: "Look straight at the camera" },
  ready:         { color: "text-green-400", border: "border-green-400",  glow: "shadow-[0_0_25px_#4ade80]", message: "Perfect! Hold still..." },
};

export const FaceVerifier = ({ onCapture, loading }: FaceVerifierProps) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readyCountRef = useRef(0);

  const [status, setStatus] = useState<FaceStatus>("loading");
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captured, setCaptured] = useState(false);

  // Load face-api models from public folder
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const faceapi = await import("@vladmandic/face-api");
      const MODEL_URL = "/face-api-models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ]);
      if (!cancelled) {
        setModelsLoaded(true);
        setStatus("no_face");
      }
    };
    load().catch(() => setStatus("no_face"));
    return () => { cancelled = true; };
  }, []);

  const detect = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded || captured) return;
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    const faceapi = await import("@vladmandic/face-api");
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true);

    if (!detection) {
      setStatus("no_face");
      setFaceBox(null);
      readyCountRef.current = 0;
      return;
    }

    const { box } = detection.detection;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Normalize box to percentage for overlay positioning
    setFaceBox({ x: box.x / vw, y: box.y / vh, w: box.width / vw, h: box.height / vh });

    const faceArea = (box.width * box.height) / (vw * vh);
    const centerX = (box.x + box.width / 2) / vw;
    const centerY = (box.y + box.height / 2) / vh;
    const iscentered = centerX > 0.25 && centerX < 0.75 && centerY > 0.2 && centerY < 0.8;

    // Check landmarks for straight-on pose (nose tip should be near center of face)
    const landmarks = detection.landmarks;
    const nose = landmarks.getNose();
    const noseTip = nose[3];
    const leftEye = landmarks.getLeftEye()[0];
    const rightEye = landmarks.getRightEye()[3];
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2 };
    const poseOffset = Math.abs(noseTip.x - eyeCenter.x) / box.width;

    if (faceArea < 0.04) {
      setStatus("too_far");
      readyCountRef.current = 0;
    } else if (faceArea > 0.45) {
      setStatus("too_close");
      readyCountRef.current = 0;
    } else if (!iscentered || poseOffset > 0.15) {
      setStatus("look_straight");
      readyCountRef.current = 0;
    } else {
      readyCountRef.current += 1;
      setStatus("ready");

      // Auto-capture after 1.5s of stable "ready" state (≈15 frames at 100ms)
      if (readyCountRef.current >= 15) {
        setCaptured(true);
        const img = webcamRef.current.getScreenshot();
        if (img) onCapture(img);
      }
    }
  }, [modelsLoaded, captured, onCapture]);

  useEffect(() => {
    if (!modelsLoaded) return;
    intervalRef.current = setInterval(detect, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [modelsLoaded, detect]);

  const cfg = STATUS_CONFIG[status];

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
          className="w-full h-full object-cover"
        />

        {/* Face bounding box tracker */}
        {faceBox && (
          <div
            className={`absolute border-2 rounded-lg transition-all duration-100 pointer-events-none ${cfg.border} ${cfg.glow}`}
            style={{
              left: `${faceBox.x * 100}%`,
              top: `${faceBox.y * 100}%`,
              width: `${faceBox.w * 100}%`,
              height: `${faceBox.h * 100}%`,
            }}
          />
        )}

        {/* Oval guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-40 h-52 rounded-full border-2 border-dashed transition-colors duration-300 ${cfg.border} opacity-40`} />
        </div>

        {/* Corner brackets */}
        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-6 h-6 pointer-events-none`}>
            <div className={`w-full h-full border-t-2 border-l-2 ${i === 1 || i === 3 ? "border-l-0 border-r-2" : ""} ${i >= 2 ? "border-t-0 border-b-2" : ""} ${cfg.border} transition-colors duration-300`} />
          </div>
        ))}

        {/* Status badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-xs font-medium ${cfg.color} transition-colors duration-300`}>
            <span className={`w-2 h-2 rounded-full ${status === "ready" ? "bg-green-400 animate-pulse" : status === "no_face" ? "bg-red-400" : "bg-yellow-400"}`} />
            {cfg.message}
          </div>
        </div>

        {/* Ready progress bar */}
        {status === "ready" && !captured && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-green-400 transition-all duration-100"
              style={{ width: `${Math.min((readyCountRef.current / 15) * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Captured overlay */}
        {captured && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="bg-white rounded-full p-4 shadow-xl">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-sm font-medium animate-pulse">Analyzing face...</div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Keep your face within the oval • Good lighting • Remove glasses if needed
      </p>
    </div>
  );
};
