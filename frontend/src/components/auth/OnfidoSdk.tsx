"use client";

import { useEffect, useRef, useState } from "react";
import { Onfido } from "onfido-sdk-ui";

interface OnfidoSdkProps {
  token: string;
  onComplete: (data: any) => void;
  onError: (error: any) => void;
}

export const OnfidoSdk = ({ token, onComplete, onError }: OnfidoSdkProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [onfidoInstance, setOnfidoInstance] = useState<any>(null);

  useEffect(() => {
    if (!token || !containerRef.current || onfidoInstance) return;

    try {
      // Initialize Onfido SDK
      // Note: In v14+, styles are bundled and injected automatically
      const instance = Onfido.init({
        token,
        containerId: "onfido-mount",
        onComplete: (data) => {
          console.log("[Onfido] Capture complete:", data);
          onComplete(data);
        },
        onError: (err) => {
          console.error("[Onfido] SDK Error:", err);
          onError(err);
        },
        steps: [
          {
            type: "document",
            options: {
              forceCrossDevice: true,
              useWebcam: true,
              documentTypes: {
                passport: true,
                driving_licence: true,
                national_identity_card: true,
              },
            },
          },
          "face",
          "complete",
        ],
      });

      setOnfidoInstance(instance);
    } catch (err) {
      console.error("[Onfido] Initialization failed:", err);
      onError(err);
    }

    return () => {
      if (onfidoInstance && typeof onfidoInstance.tearDown === "function") {
        onfidoInstance.tearDown();
      }
    };
  }, [token, onComplete, onError]);

  return (
    <div className="w-full min-h-[500px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div id="onfido-mount" ref={containerRef} className="w-full h-full" />
    </div>
  );
};
