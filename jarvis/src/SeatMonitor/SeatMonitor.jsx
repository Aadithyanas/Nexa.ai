import { useRef, useEffect } from "react";
import { useModels } from "./useModels";
import { useCamera } from "./useCamera";
import { useFaceDetection } from "./useFaceDetection";
import { useAlerts } from "./useAlerts";
import { useSpeech } from "./useSpeech";
import { useStatus } from "./useStatus";
import { VideoDisplay, StatusOverlay } from "./styles";

const SeatMonitor = ({ miniMode = false, cameraActive = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionInterval = useRef(null);
  const verificationSession = useRef(null);
  const knownFaceDescriptors = useRef([]);

  const { loadModels, loadReferenceFace } = useModels();
  const { startCamera, stopCamera } = useCamera(videoRef);
  const { detectFaces } = useFaceDetection(videoRef, miniMode);
  const { sendWhatsAppAlert } = useAlerts();
  const { speak } = useSpeech(miniMode);
  const { status, updateStatus } = useStatus();

  // Initialize system
  useEffect(() => {
    const init = async () => {
      const loaded = await loadModels();
      if (loaded) {
        knownFaceDescriptors.current = await loadReferenceFace();
        if (cameraActive) await startCamera(miniMode);
      }
    };
    
    init();
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
      if (detectionInterval.current) cancelAnimationFrame(detectionInterval.current);
    };
  }, [loadModels, loadReferenceFace, startCamera, stopCamera, cameraActive, miniMode]);

  // Handle camera active state
  useEffect(() => {
    if (cameraActive && !status.isCameraOn) {
      startCamera(miniMode);
    } else if (!cameraActive && status.isCameraOn) {
      stopCamera();
    }
  }, [cameraActive, status.isCameraOn, startCamera, stopCamera, miniMode]);

  // Start detection when camera is ready
  useEffect(() => {
    if (!status.isCameraOn || !videoRef.current) return;

    const handleDetection = ({ isAdithyan, matchResult, detections = [], bodyDetected }) => {
      if (detections.length === 1) {
        if (isAdithyan) {
          updateStatus({
            isAdithyan: true,
            unauthorized: false,
            recognizedFace: "adithyan",
            bodyDetected,
            warningMessage: "",
            confidenceScore: matchResult.confidence,
            verificationStatus: `Verified: Adithyan (${matchResult.confidence}% match)`,
            verificationColor: "text-green-500",
          });
          speak("Welcome back Adithyan!");
        } else {
          const now = Date.now();
          if (!verificationSession.current || now - verificationSession.current > 15000) {
            verificationSession.current = now;
            speak("Warning! This seat is assigned to Adithyan.", true);
            sendWhatsAppAlert();
          }

          updateStatus({
            isAdithyan: false,
            unauthorized: true,
            bodyDetected,
            recognizedFace: null,
            warningMessage: "This seat is assigned to Adithyan",
            confidenceScore: matchResult.confidence,
            verificationStatus: `Unauthorized (${100 - matchResult.confidence}% different)`,
            verificationColor: "text-red-500",
          });
        }
      } else {
        updateStatus({
          isAdithyan: false,
          unauthorized: false,
          recognizedFace: null,
          bodyDetected,
          faceCount: detections.length,
          warningMessage: detections.length ? `Multiple faces (${detections.length})` : "No face detected",
          verificationStatus: detections.length ? `Multiple faces (${detections.length})` : "Waiting for face...",
          verificationColor: "text-yellow-400",
        });
      }
    };

    const detectionLoop = async () => {
      const { fps } = await detectFaces(knownFaceDescriptors.current, handleDetection);
      updateStatus({ fps });
      detectionInterval.current = requestAnimationFrame(detectionLoop);
    };

    if (!canvasRef.current) {
      canvasRef.current = faceapi.createCanvasFromMedia(videoRef.current);
      Object.assign(canvasRef.current.style, {
        position: "absolute",
        top: 0,
        left: 0,
      });
      videoRef.current.parentNode.appendChild(canvasRef.current);
    }

    detectionInterval.current = requestAnimationFrame(detectionLoop);
    return () => cancelAnimationFrame(detectionInterval.current);
  }, [status.isCameraOn, detectFaces, speak, sendWhatsAppAlert, updateStatus]);

  return (
    <div className="seat-monitor-mini w-full h-full">
      <VideoDisplay 
        videoRef={videoRef}
        canvasRef={canvasRef}
        loadingStatus={status.loadingStatus}
        cameraActive={cameraActive}
      />
      <StatusOverlay 
        status={status}
        isCameraOn={status.isCameraOn}
      />
    </div>
  );
};

export default SeatMonitor;