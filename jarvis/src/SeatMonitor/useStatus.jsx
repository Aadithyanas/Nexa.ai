import { useState } from "react";

export const useStatus = () => {
  const [status, setStatus] = useState({
    isCameraOn: false,
    loadingStatus: "Initializing...",
    warningMessage: "",
    fps: 0,
    detectionCount: 0,
    faceCount: 0,
    bodyDetected: false,
    lastDetectionTime: null,
    recognizedFace: null,
    isAdithyan: false,
    unauthorized: false,
    confidenceScore: 0,
    verificationStatus: "Waiting for face...",
    verificationColor: "text-yellow-400",
  });

  const updateStatus = (updates) => {
    setStatus(prev => ({ ...prev, ...updates }));
  };

  return { status, updateStatus };
};