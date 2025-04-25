import { useCallback } from "react";

const VIDEO_CONFIGS = [
  { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
  { width: 640, height: 480 },
  { width: 320, height: 240 },
  true
];

export const useCamera = (videoRef) => {
  const startCamera = useCallback(async (miniMode = false) => {
    try {
      let stream = null;
      for (let i = 0; i < VIDEO_CONFIGS.length; i++) {
        try {
          const config = miniMode 
            ? { ...VIDEO_CONFIGS[i], width: { ideal: 640 }, height: { ideal: 360 } }
            : VIDEO_CONFIGS[i];
          
          stream = await navigator.mediaDevices.getUserMedia({ video: config });
          break;
        } catch (err) {
          if (i === VIDEO_CONFIGS.length - 1) throw err;
        }
      }

      if (!stream) throw new Error("Camera access failed");

      videoRef.current.srcObject = stream;
      await new Promise(resolve => {
        videoRef.current.onloadeddata = resolve;
      });
      await videoRef.current.play();
      return true;
    } catch (error) {
      console.error("Camera error:", error);
      return false;
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  return { startCamera, stopCamera };
};