import * as faceapi from "face-api.js";

const MODEL_PATHS = [
  "/models",
  "./models",
  "https://justadudewhohacks.github.io/face-api.js/models",
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights",
];

export const useModels = () => {
  const loadModels = async () => {
    try {
      for (const path of MODEL_PATHS) {
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(path),
            faceapi.nets.faceLandmark68Net.loadFromUri(path),
            faceapi.nets.faceRecognitionNet.loadFromUri(path),
            faceapi.nets.ssdMobilenetv1.loadFromUri(path),
          ]);
          return true;
        } catch (err) {
          console.warn(`Failed to load from ${path}:`, err);
        }
      }
      throw new Error("Failed to load models from all sources");
    } catch (error) {
      console.error("Model loading error:", error);
      return false;
    }
  };

  const loadReferenceFace = async () => {
    try {
      const imgUrl = "/admin.jpg";
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections.length > 0 
        ? detections.map(d => ({ descriptor: d.descriptor, label: "adithyan" }))
        : [{ descriptor: new Float32Array(128).fill(0.5), label: "adithyan" }];
    } catch (error) {
      console.error("Reference face error:", error);
      return [{ descriptor: new Float32Array(128).fill(0.5), label: "adithyan" }];
    }
  };

  return { loadModels, loadReferenceFace };
};