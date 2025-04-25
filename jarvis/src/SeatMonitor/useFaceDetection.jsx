import * as faceapi from "face-api.js";
import { useCallback, useRef } from "react";

export const useFaceDetection = (videoRef, miniMode) => {
  const detectionHistory = useRef([]);
  const frameCount = useRef(0);
  const fpsHistory = useRef([]);
  const lastBodyDetection = useRef(null);

  const matchFace = useCallback((descriptor, knownDescriptors) => {
    if (!knownDescriptors.length) return { isMatch: false, confidence: 0 };
    
    let bestDistance = Infinity;
    for (const known of knownDescriptors) {
      const distance = faceapi.euclideanDistance(descriptor, known.descriptor);
      if (distance < bestDistance) bestDistance = distance;
    }

    const isMatch = bestDistance < 0.6;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - bestDistance / 0.6) * 100)));
    return { isMatch, confidence };
  }, []);

  const detectBody = useCallback(async () => {
    if (!videoRef.current || frameCount.current % 30 !== 0) 
      return lastBodyDetection.current?.detected || false;

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
      );

      lastBodyDetection.current = {
        detected: detections.length > 0,
        timestamp: Date.now()
      };
      return lastBodyDetection.current.detected;
    } catch (error) {
      console.error("Body detection error:", error);
      return false;
    }
  }, [videoRef]);

  const detectFaces = useCallback(async (knownDescriptors, onDetection) => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
      return { fps: 0 };
    }

    const startTime = performance.now();
    const skipFrames = miniMode ? 3 : 2;
    let result = { fps: 0 };

    try {
      if (frameCount.current % skipFrames === 0) {
        const options = new faceapi.TinyFaceDetectorOptions({
          scoreThreshold: 0.5,
          inputSize: miniMode ? 160 : 320,
        });

        let detections = await faceapi
          .detectAllFaces(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length === 0 && frameCount.current % 10 === 0) {
          detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();
        }

        const bodyDetected = await detectBody();
        result = { detections, bodyDetected };

        if (detections.length === 1) {
          const matchResult = matchFace(detections[0].descriptor, knownDescriptors);
          detectionHistory.current = [...detectionHistory.current.slice(-4), matchResult.isMatch];
          const trueMatches = detectionHistory.current.filter(Boolean).length;
          const isAdithyan = trueMatches >= 3;

          onDetection({
            isAdithyan,
            matchResult,
            detections,
            bodyDetected
          });
        } else {
          onDetection({
            isAdithyan: false,
            detections,
            bodyDetected
          });
        }
      }
    } catch (error) {
      console.error("Detection error:", error);
    }

    const endTime = performance.now();
    fpsHistory.current = [...fpsHistory.current.slice(-9), 1000 / (endTime - startTime)];
    result.fps = Math.round(fpsHistory.current.reduce((sum, fps) => sum + fps, 0) / fpsHistory.current.length);
    frameCount.current++;
    
    return result;
  }, [videoRef, miniMode, detectBody, matchFace]);

  return { detectFaces };
};