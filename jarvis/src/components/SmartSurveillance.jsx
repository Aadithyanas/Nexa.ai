import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { GoogleGenerativeAI } from '@google/generative-ai';

function SmartSurveillance() {
  // Refs and state
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [faces, setFaces] = useState([]);
  const [sceneDescription, setSceneDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [models, setModels] = useState({
    coco: null,
    face: null
  });

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI('AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0');
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Initialize TensorFlow
        await tf.ready();

        // Load COCO-SSD
        const cocoModel = await cocoSsd.load();
        
        // Load face-api.js models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

        setModels({
          coco: cocoModel,
          face: true
        });
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to load models: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    loadModels();
  }, []);

  // Run detection periodically
  useEffect(() => {
    if (isLoading || !models.coco) return;

    const interval = setInterval(() => {
      runDetection();
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, models]);

  // Main detection function
  const runDetection = async () => {
    if (!webcamRef.current?.video || !models.coco) return;

    try {
      // Ensure video is ready
      if (webcamRef.current.video.readyState < 2) {
        await new Promise((resolve) => {
          webcamRef.current.video.onloadeddata = resolve;
        });
      }

      // Run object detection
      const objDetections = await models.coco.detect(webcamRef.current.video);
      setDetections(objDetections);

      // Run face detection
      const facesDetected = await faceapi.detectAllFaces(
        webcamRef.current.video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();
      setFaces(facesDetected);

      // Draw detections
      drawDetections(facesDetected, objDetections);

      // Analyze scene
      await analyzeScene(objDetections, facesDetected);
    } catch (err) {
      console.error('Detection error:', err);
      setError(`Detection error: ${err.message}`);
    }
  };

  // Draw bounding boxes
  const drawDetections = (faces, objects) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw faces
    faces.forEach(face => {
      const box = face.detection.box;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.fillStyle = '#00FF00';
      ctx.font = '12px Arial';
      ctx.fillText('Face', box.x, box.y > 10 ? box.y - 5 : 10);
    });

    // Draw objects
    objects.forEach(obj => {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.bbox[0], obj.bbox[1], obj.bbox[2], obj.bbox[3]);
      ctx.fillStyle = '#FF0000';
      ctx.font = '12px Arial';
      ctx.fillText(
        `${obj.class} ${(obj.score * 100).toFixed(1)}%`,
        obj.bbox[0],
        obj.bbox[1] > 10 ? obj.bbox[1] - 5 : 10
      );
    });
  };

  // Analyze scene with Gemini
  const analyzeScene = async (objects, faces) => {
    const peopleCount = faces.length;
    const items = [];
    
    if (peopleCount > 0) {
      items.push(`${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}`);
    }
    
    const objectCounts = {};
    objects.forEach(obj => {
      objectCounts[obj.class] = (objectCounts[obj.class] || 0) + 1;
    });
    
    for (const [obj, count] of Object.entries(objectCounts)) {
      items.push(`${count} ${obj}${count > 1 ? 's' : ''}`);
    }
    
    if (items.length === 0) {
      setSceneDescription('No significant objects or people detected.');
      return;
    }
    
    try {
      const prompt = `Describe this surveillance scene: ${items.join(', ')}`;
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setSceneDescription(text);
    } catch (err) {
      console.error('Gemini error:', err);
      setSceneDescription(`Detected: ${items.join(', ')}`);
    }
  };

  // Video constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Smart Surveillance System</h1>
      
      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={() => setError(null)} style={styles.closeButton}>
            ×
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading AI models...</p>
        </div>
      ) : (
        <>
          <div style={styles.cameraContainer}>
            <Webcam
              ref={webcamRef}
              style={styles.webcam}
              videoConstraints={videoConstraints}
              muted
            />
            <canvas
              ref={canvasRef}
              style={styles.canvas}
            />
          </div>
          
          <div style={styles.infoPanel}>
            <div style={styles.descriptionBox}>
              <h3>Scene Analysis:</h3>
              <p>{sceneDescription || 'Analyzing...'}</p>
            </div>
            
            <div style={styles.detectionsContainer}>
              <div style={styles.detectionSection}>
                <h4>People: {faces.length}</h4>
                <div style={styles.detectionGrid}>
                  {faces.map((face, i) => (
                    <div key={i} style={styles.detectionItem}>
                      <span>Face {i+1}</span>
                      <span>{(face.detection.score * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={styles.detectionSection}>
                <h4>Objects: {detections.length}</h4>
                <div style={styles.detectionGrid}>
                  {detections.map((det, i) => (
                    <div key={i} style={styles.detectionItem}>
                      <span>{det.class}</span>
                      <span>{(det.score * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Styles (same as previous example)
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '2.2rem'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    borderLeft: '4px solid #c62828',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#c62828',
    fontSize: '1.5rem',
    cursor: 'pointer'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px'
  },
  spinner: {
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  cameraContainer: {
    position: 'relative',
    marginBottom: '30px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  webcam: {
    width: '100%',
    display: 'block'
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  infoPanel: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
  },
  descriptionBox: {
    backgroundColor: '#e8f4f8',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    borderLeft: '4px solid #3498db'
  },
  detectionsContainer: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap'
  },
  detectionSection: {
    flex: '1',
    minWidth: '250px'
  },
  detectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  detectionItem: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

export default SmartSurveillance;