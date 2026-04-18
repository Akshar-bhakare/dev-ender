'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FaceCaptureProps {
  onCaptureComplete: (faceData: FormData) => void;
  isProcessing: boolean;
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({ onCaptureComplete, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureFrames = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    setCaptureProgress(0);
    const formData = new FormData();
    const framesToCapture = 3;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    for (let i = 0; i < framesToCapture; i++) {
      // Small delay between frames
      await new Promise(resolve => setTimeout(resolve, 500));
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.8)
      );

      if (blob) {
        formData.append('files', blob, `frame_${i}.jpg`);
      }
      
      setCaptureProgress(((i + 1) / framesToCapture) * 100);
    }

    setIsCapturing(false);
    onCaptureComplete(formData);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Face Verification</h2>
        <p className="text-slate-500 text-sm">Position your face in the center of the frame and look directly at the camera.</p>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 border-2 border-slate-200">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <p className="text-white text-sm font-medium">{error}</p>
            <button 
              onClick={startCamera}
              className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {isCapturing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-white/20 border-t-white animate-spin" />
              </div>
            )}
            
            {/* Guidelines Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
                <div className="w-full h-full border-2 border-dashed border-white/50 rounded-full scale-90" />
            </div>
          </>
        )}
        <canvas ref={canvasRef} width={640} height={480} className="hidden" />
      </div>

      {isCapturing || isProcessing ? (
        <div className="w-full space-y-3">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${isProcessing ? 100 : captureProgress}%` }}
            />
          </div>
          <p className="text-center text-sm font-medium text-slate-600 animate-pulse">
            {isProcessing ? "Verifying with AI..." : `Capturing frames... ${Math.round(captureProgress)}%`}
          </p>
        </div>
      ) : (
        <button
          onClick={captureFrames}
          disabled={!!error}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          <Camera className="w-5 h-5" />
          <span>Start Scan</span>
        </button>
      )}

      {!isCapturing && !isProcessing && (
        <button 
          onClick={startCamera}
          className="text-slate-400 hover:text-slate-600 text-xs font-medium flex items-center space-x-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restart Camera</span>
        </button>
      )}
    </div>
  );
};
