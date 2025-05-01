"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import * as faceapi from "face-api.js"

// Improved WhatsApp alert utility with better rate limiting and error handling
const createWhatsAppSender = () => {
  const lastAlertTime = { current: 0 }
  const pendingRequest = { current: null }
  const RATE_LIMIT_MS = 300000 // 5 minutes

  // Define the server URL - adjust this to where your Express server is running
  const SERVER_URL = "http://localhost:3001" // Change this if your server runs on a different port

  return async (message = "🚨 ALERT: Unauthorized person detected in Adithyan's seat!") => {
    const now = Date.now()

    // Check rate limiting
    if (now - lastAlertTime.current < RATE_LIMIT_MS) {
      console.log(
        `WhatsApp alert skipped: rate limited (${Math.ceil((RATE_LIMIT_MS - (now - lastAlertTime.current)) / 1000)}s remaining)`,
      )
      return false
    }

    // Avoid duplicate requests
    if (pendingRequest.current) {
      return pendingRequest.current
    }

    try {
      // Use the full URL to the Express server
      pendingRequest.current = fetch(`${SERVER_URL}/api/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          to: "918590361932", // Fixed recipient
        }),
      })

      const response = await pendingRequest.current

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      lastAlertTime.current = now
      console.log("WhatsApp alert sent successfully:", data)
      return true
    } catch (error) {
      console.error("Failed to send WhatsApp alert:", error)
      return false
    } finally {
      pendingRequest.current = null
    }
  }
}

const SeatMonitor = ({ miniMode = false, cameraActive = true }) => {
  // Refs for system components
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const detectionInterval = useRef(null)
  const frameCount = useRef(0)
  const modelsLoaded = useRef(false)
  const knownFaceDescriptors = useRef([])
  const consecutiveDetections = useRef(0)
  const consecutiveMatches = useRef(0)
  const lastSpokenMessage = useRef("")
  const detectionHistory = useRef([])
  const verificationSession = useRef(null)
  const lastBodyDetection = useRef(null)
  const fpsHistory = useRef([])
  const modelLoadAttempted = useRef(false)
  const lastAlertTime = useRef(0)

  // Create WhatsApp sender utility
  const whatsAppSender = useRef(createWhatsAppSender())

  // State
  const [systemStatus, setSystemStatus] = useState({
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
  })

  // Function to send WhatsApp alert
  const sendWhatsAppAlert = async () => {
    try {
      const result = await whatsAppSender.current()
      if (result) {
        console.log("WhatsApp alert sent successfully")
      }
    } catch (error) {
      console.error("Failed to send WhatsApp alert:", error)
    }
  }

  // Simple speech synthesis with cooldown and better voice selection
  const speak = (text, force = false) => {
    // Skip speech in mini mode
    if (miniMode) return

    const now = Date.now()
    // Don't repeat the same message within 10 seconds unless forced
    if (
      !force &&
      lastSpokenMessage.current &&
      lastSpokenMessage.current.text === text &&
      now - lastSpokenMessage.current.timestamp < 10000
    )
      return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.volume = 0.8

    // Try to get a better voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find((voice) => voice.lang === "en-US" && !voice.localService)

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    window.speechSynthesis.speak(utterance)

    lastSpokenMessage.current = {
      text,
      timestamp: now,
    }
  }

  // Load models with better error handling and fallbacks
  const loadModels = useCallback(async () => {
    if (modelLoadAttempted.current) return
    modelLoadAttempted.current = true

    try {
      setSystemStatus((prev) => ({
        ...prev,
        loadingStatus: "Loading models...",
        verificationStatus: "Loading face recognition models...",
        verificationColor: "text-blue-400",
      }))

      // Define multiple possible model paths to try
      const modelPaths = [
        "/models",
        "./models",
        "https://justadudewhohacks.github.io/face-api.js/models",
        "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights",
      ]

      let loaded = false
      let loadError = null

      // Try each path until one works
      for (const path of modelPaths) {
        try {
          console.log(`Attempting to load models from ${path}...`)

          // Load all required models
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(path),
            faceapi.nets.faceLandmark68Net.loadFromUri(path),
            faceapi.nets.faceRecognitionNet.loadFromUri(path),
            faceapi.nets.ssdMobilenetv1.loadFromUri(path),
          ])

          loaded = true
          console.log(`Successfully loaded models from ${path}`)
          break
        } catch (err) {
          console.warn(`Failed to load from ${path}:`, err)
          loadError = err
        }
      }

      if (!loaded) {
        throw new Error(`Failed to load models from all sources. Last error: ${loadError?.message}`)
      }

      modelsLoaded.current = true
      console.log("All face-api.js models loaded successfully")

      setSystemStatus((prev) => ({
        ...prev,
        verificationStatus: "Loading reference face...",
        verificationColor: "text-blue-400",
      }))

      // Load reference image with better error handling
      try {
        // Use a placeholder image URL if admin.jpg is not available
        const imgUrl = "/admin.jpg"
        console.log(`Loading reference face from ${imgUrl}...`)

        // Create an Image object to load the reference face
        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = imgUrl
        })

        // Detect face in the reference image
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
          .withFaceLandmarks()
          .withFaceDescriptors()

        if (detections.length > 0) {
          knownFaceDescriptors.current = detections.map((d) => ({
            descriptor: d.descriptor,
            label: "adithyan",
          }))
          console.log("Reference face loaded successfully")
          speak("Reference face loaded successfully")

          setSystemStatus((prev) => ({
            ...prev,
            verificationStatus: "Reference face loaded",
            verificationColor: "text-green-400",
          }))
        } else {
          console.warn("No face detected in reference image")
          speak("Warning: No face detected in reference image")

          // Create a dummy descriptor for testing if no face is detected
          knownFaceDescriptors.current = [
            {
              descriptor: new Float32Array(128).fill(0.5),
              label: "adithyan",
            },
          ]

          setSystemStatus((prev) => ({
            ...prev,
            verificationStatus: "Using fallback reference face",
            verificationColor: "text-yellow-400",
          }))
        }
      } catch (imgError) {
        console.error("Failed to load reference image:", imgError)
        speak("Warning: Failed to load reference image")

        // Create a dummy descriptor for testing
        knownFaceDescriptors.current = [
          {
            descriptor: new Float32Array(128).fill(0.5),
            label: "adithyan",
          },
        ]

        setSystemStatus((prev) => ({
          ...prev,
          verificationStatus: "Using fallback reference face",
          verificationColor: "text-yellow-400",
        }))
      }

      setSystemStatus((prev) => ({
        ...prev,
        loadingStatus: "Models ready!",
        verificationStatus: "System ready - waiting for face",
        verificationColor: "text-blue-400",
      }))
      speak("System initialized and ready")

      return true
    } catch (error) {
      console.error("Model loading error:", error)
      setSystemStatus((prev) => ({
        ...prev,
        loadingStatus: "Failed to load models. Refreshing may help.",
        verificationStatus: "Face recognition failed to initialize",
        verificationColor: "text-red-500",
      }))
      speak("Error loading models. Please refresh the page")
      return false
    }
  }, [miniMode])

  // Start camera with better error handling and device selection
  const startCamera = useCallback(async () => {
    try {
      setSystemStatus((prev) => ({
        ...prev,
        loadingStatus: "Starting camera...",
        verificationStatus: "Activating camera...",
        verificationColor: "text-blue-400",
      }))

      // Try to get list of devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      console.log(`Found ${videoDevices.length} video input devices`)

      // Try different camera configurations if initial one fails
      let stream = null
      let attempts = 0
      const maxAttempts = 3

      // Try configurations from best to worst quality
      const videoConfigs = [
        // HD quality
        {
          width: { ideal: miniMode ? 640 : 1280 },
          height: { ideal: miniMode ? 360 : 720 },
          facingMode: "user",
        },
        // Standard quality
        { width: 640, height: 480 },
        // Basic quality
        { width: 320, height: 240 },
        // Any camera
        true,
      ]

      while (!stream && attempts < maxAttempts) {
        try {
          const config = videoConfigs[Math.min(attempts, videoConfigs.length - 1)]
          console.log(`Attempt ${attempts + 1}: Trying camera config:`, config)

          stream = await navigator.mediaDevices.getUserMedia({ video: config })
          console.log("Camera stream obtained successfully")
        } catch (err) {
          console.warn(`Camera access attempt ${attempts + 1} failed:`, err)
          attempts++
        }
      }

      if (!stream) {
        throw new Error("Failed to access camera after multiple attempts")
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadeddata = resolve
        })

        await videoRef.current.play()
        console.log("Video playback started")

        setSystemStatus((prev) => ({
          ...prev,
          isCameraOn: true,
          loadingStatus: "",
          verificationStatus: "Camera active - searching for face",
          verificationColor: "text-blue-400",
        }))

        speak("Camera activated")
        return true
      }
      return false
    } catch (error) {
      console.error("Camera error:", error)
      setSystemStatus((prev) => ({
        ...prev,
        loadingStatus: "Camera access denied or not available.",
        verificationStatus: "Camera access failed",
        verificationColor: "text-red-500",
      }))
      speak("Error: Camera access denied or not available")
      return false
    }
  }, [miniMode])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null

      setSystemStatus((prev) => ({
        ...prev,
        isCameraOn: false,
        verificationStatus: "Camera off",
        verificationColor: "text-gray-400",
      }))

      speak("Camera deactivated")
    }

    if (detectionInterval.current) {
      cancelAnimationFrame(detectionInterval.current)
      detectionInterval.current = null
    }
  }, [])

  // Improved face matching with confidence scoring
  const matchFace = useCallback((descriptor) => {
    if (knownFaceDescriptors.current.length === 0) return { isMatch: false, confidence: 0, label: null }

    // Find best match
    let bestDistance = Number.POSITIVE_INFINITY
    let bestLabel = null

    for (const known of knownFaceDescriptors.current) {
      const distance = faceapi.euclideanDistance(descriptor, known.descriptor)
      if (distance < bestDistance) {
        bestDistance = distance
        bestLabel = known.label
      }
    }

    // Lower distance = better match (threshold of 0.6 is more forgiving than 0.5)
    const isMatch = bestDistance < 0.6

    // Convert distance to confidence percentage (0-100%)
    // 0 distance = 100% confidence, 0.6+ distance = 0% confidence
    const confidence = Math.max(0, Math.min(100, Math.round((1 - bestDistance / 0.6) * 100)))

    return { isMatch, confidence, label: isMatch ? bestLabel : null }
  }, [])

  // Optimized body detection function
  const detectBody = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded.current) return false

    try {
      // Using SSD MobileNet for full body detection
      // Only run body detection every 30 frames to save resources
      if (frameCount.current % 30 === 0 || !lastBodyDetection.current) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
        )

        // Store body detection result and timestamp
        lastBodyDetection.current = {
          detected: detections.length > 0,
          timestamp: Date.now(),
        }
      }

      // If detection is older than 3 seconds, consider it stale
      if (Date.now() - lastBodyDetection.current.timestamp > 3000) {
        return false
      }

      return lastBodyDetection.current.detected
    } catch (error) {
      console.error("Body detection error:", error)
      return false
    }
  }, [])

  // Enhanced face detection with improved stability and performance
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded.current || videoRef.current.paused || videoRef.current.ended) {
      detectionInterval.current = requestAnimationFrame(detectFaces)
      return
    }

    const startTime = performance.now()

    try {
      // Fast detection options - use lower threshold for better detection
      const options = new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.5, // Lower threshold to detect faces more easily
        inputSize: miniMode ? 160 : 320, // Even smaller for mini mode
      })

      // Skip more frames in mini mode for better performance
      const skipFrames = miniMode ? 3 : 2

      if (frameCount.current % skipFrames === 0) {
        // Log detection attempt periodically
        if (frameCount.current % 30 === 0) {
          console.log("Attempting face detection...")
        }

        // First try with TinyFaceDetector
        let detections = await faceapi
          .detectAllFaces(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptors()

        // If no faces detected, try with SSD MobileNet which might be more reliable
        if (detections.length === 0 && frameCount.current % 10 === 0) {
          console.log("No faces detected with TinyFaceDetector, trying SSD MobileNet...")
          detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors()
        }

        // Body detection
        const bodyDetected = await detectBody()

        // Draw results
        if (canvasRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          }

          faceapi.matchDimensions(canvasRef.current, displaySize)
          const resizedDetections = faceapi.resizeResults(detections, displaySize)

          const ctx = canvasRef.current.getContext("2d")
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

          // Draw status indicators
          const squareSize = 20
          const padding = 10

          // Draw body indicator if detected (green square in top left)
          if (bodyDetected) {
            ctx.fillStyle = "#4CAF50"
            ctx.fillRect(padding, padding, squareSize, squareSize)
            ctx.strokeStyle = "#FFFFFF"
            ctx.lineWidth = 1
            ctx.strokeRect(padding, padding, squareSize, squareSize)
          }

          // Process detection results
          if (detections.length === 1) {
            // Add to history for stability
            const matchResult = matchFace(detections[0].descriptor)
            detectionHistory.current.push(matchResult.isMatch)
            if (detectionHistory.current.length > 5) {
              detectionHistory.current.shift() // Keep last 5 results
            }

            // Count true matches in history
            const trueMatches = detectionHistory.current.filter((m) => m).length

            // Decision based on majority of recent detections
            const isAdithyan = trueMatches >= 3 // Majority rule

            if (isAdithyan) {
              consecutiveMatches.current++
              consecutiveDetections.current++

              // Draw green box for Adithyan
              const box = resizedDetections[0].detection.box

              ctx.strokeStyle = "#00FF00"
              ctx.lineWidth = 3
              ctx.strokeRect(box.x, box.y, box.width, box.height)

              // Add name label with background
              const labelText = "Adithyan"
              const labelPadding = 4
              const fontSize = 16
              ctx.font = `${fontSize}px Arial`
              const textWidth = ctx.measureText(labelText).width

              ctx.fillStyle = "#00FF00"
              ctx.fillRect(
                box.x,
                box.y - fontSize - labelPadding * 2,
                textWidth + labelPadding * 2,
                fontSize + labelPadding * 2,
              )

              ctx.fillStyle = "#000000"
              ctx.fillText(labelText, box.x + labelPadding, box.y - labelPadding)

              if (!miniMode) {
                const confidenceText = `${matchResult.confidence}%`
                ctx.font = `${fontSize - 2}px Arial`
                const confWidth = ctx.measureText(confidenceText).width

                ctx.fillStyle = "rgba(0, 255, 0, 0.7)"
                ctx.fillRect(
                  box.x + box.width - confWidth - labelPadding * 2,
                  box.y + box.height,
                  confWidth + labelPadding * 2,
                  fontSize + labelPadding,
                )

                ctx.fillStyle = "#000000"
                ctx.fillText(
                  confidenceText,
                  box.x + box.width - confWidth - labelPadding,
                  box.y + box.height + fontSize,
                )
              }

              // Update status after 3 consistent detections
              if (consecutiveMatches.current >= 3) {
                const now = Date.now()
                if (!verificationSession.current || now - verificationSession.current > 30000) {
                  verificationSession.current = now

                  setSystemStatus((prev) => ({
                    ...prev,
                    isAdithyan: true,
                    unauthorized: false,
                    recognizedFace: "adithyan",
                    bodyDetected,
                    warningMessage: "",
                    confidenceScore: matchResult.confidence,
                    verificationStatus: `Verified: Adithyan (${matchResult.confidence}% match)`,
                    verificationColor: "text-green-500",
                  }))

                  speak("Welcome back Adithyan!")
                } else {
                  setSystemStatus((prev) => ({
                    ...prev,
                    isAdithyan: true,
                    unauthorized: false,
                    recognizedFace: "adithyan",
                    bodyDetected,
                    warningMessage: "",
                    confidenceScore: matchResult.confidence,
                    verificationStatus: `Verified: Adithyan (${matchResult.confidence}% match)`,
                    verificationColor: "text-green-500",
                  }))
                }
              }
            } else {
              consecutiveMatches.current = 0
              consecutiveDetections.current++

              // Draw red box for unauthorized
              const box = resizedDetections[0].detection.box

              ctx.strokeStyle = "#FF0000"
              ctx.lineWidth = 3
              ctx.strokeRect(box.x, box.y, box.width, box.height)

              // Add unauthorized label with background
              const labelText = "Unauthorized"
              const labelPadding = 4
              const fontSize = 16
              ctx.font = `${fontSize}px Arial`
              const textWidth = ctx.measureText(labelText).width

              ctx.fillStyle = "#FF0000"
              ctx.fillRect(
                box.x,
                box.y - fontSize - labelPadding * 2,
                textWidth + labelPadding * 2,
                fontSize + labelPadding * 2,
              )

              ctx.fillStyle = "#FFFFFF"
              ctx.fillText(labelText, box.x + labelPadding, box.y - labelPadding)

              if (!miniMode) {
                const diffText = `${100 - matchResult.confidence}% diff`
                ctx.font = `${fontSize - 2}px Arial`
                const diffWidth = ctx.measureText(diffText).width

                ctx.fillStyle = "rgba(255, 0, 0, 0.7)"
                ctx.fillRect(
                  box.x + box.width - diffWidth - labelPadding * 2,
                  box.y + box.height,
                  diffWidth + labelPadding * 2,
                  fontSize + labelPadding,
                )

                ctx.fillStyle = "#FFFFFF"
                ctx.fillText(diffText, box.x + box.width - diffWidth - labelPadding, box.y + box.height + fontSize)
              }

              // Update status after several consistent detections
              if (consecutiveDetections.current >= 5) {
                const now = Date.now()
                const shouldAnnounce = !verificationSession.current || now - verificationSession.current > 15000

                if (shouldAnnounce) {
                  verificationSession.current = now
                  speak("Warning! This seat is assigned to Adithyan.", true)

                  // Send WhatsApp alert using our improved function
                  sendWhatsAppAlert()
                }

                setSystemStatus((prev) => ({
                  ...prev,
                  isAdithyan: false,
                  unauthorized: true,
                  bodyDetected,
                  recognizedFace: null,
                  warningMessage: "This seat is assigned to Adithyan",
                  confidenceScore: matchResult.confidence,
                  verificationStatus: `Unauthorized user detected (${100 - matchResult.confidence}% different)`,
                  verificationColor: "text-red-500",
                }))
              }
            }
          } else {
            // Reset counters when no or multiple faces
            consecutiveDetections.current = 0
            consecutiveMatches.current = 0
            detectionHistory.current = []

            let statusMessage = "Waiting for face..."
            if (detections.length === 0) {
              statusMessage = bodyDetected ? "Body detected, no face visible" : "No face detected"
            } else if (detections.length > 1) {
              statusMessage = `Multiple faces detected (${detections.length})`
            }

            setSystemStatus((prev) => ({
              ...prev,
              isAdithyan: false,
              unauthorized: false,
              recognizedFace: null,
              bodyDetected,
              faceCount: detections.length,
              warningMessage: statusMessage,
              verificationStatus: statusMessage,
              verificationColor: "text-yellow-400",
            }))
          }

          // Update basic stats
          setSystemStatus((prev) => ({
            ...prev,
            bodyDetected,
            faceCount: detections.length,
            detectionCount: prev.detectionCount + 1,
            lastDetectionTime: new Date().toLocaleTimeString(),
          }))
        }
      }

      // Calculate FPS
      const endTime = performance.now()
      const frameTime = endTime - startTime

      fpsHistory.current.push(1000 / frameTime)
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift()
      }

      const avgFps = Math.round(fpsHistory.current.reduce((sum, fps) => sum + fps, 0) / fpsHistory.current.length)

      if (frameCount.current % 10 === 0) {
        setSystemStatus((prev) => ({ ...prev, fps: avgFps || 0 }))
      }
    } catch (error) {
      console.error("Face detection error:", error)
    }

    frameCount.current++
    detectionInterval.current = requestAnimationFrame(detectFaces)
  }, [matchFace, detectBody, miniMode])

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      const modelsLoaded = await loadModels()
      if (modelsLoaded && cameraActive) {
        await startCamera()
      }
    }

    init()

    return () => {
      if (detectionInterval.current) {
        cancelAnimationFrame(detectionInterval.current)
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        if (tracks) {
          tracks.forEach((track) => track.stop())
        }
      }
      window.speechSynthesis.cancel()
    }
  }, [loadModels, startCamera, cameraActive])

  // Handle camera active state changes
  useEffect(() => {
    if (cameraActive) {
      if (modelsLoaded.current && !systemStatus.isCameraOn) {
        startCamera()
      }
    } else {
      stopCamera()
    }
  }, [cameraActive, startCamera, stopCamera, systemStatus.isCameraOn])

  // Start detection when camera is ready
  useEffect(() => {
    if (systemStatus.isCameraOn && videoRef.current) {
      if (!canvasRef.current) {
        canvasRef.current = faceapi.createCanvasFromMedia(videoRef.current)
        canvasRef.current.style.position = "absolute"
        canvasRef.current.style.top = "0"
        canvasRef.current.style.left = "0"
        videoRef.current.parentNode.appendChild(canvasRef.current)
      }

      console.log("Starting face detection loop")
      detectionInterval.current = requestAnimationFrame(detectFaces)
    }
  }, [systemStatus.isCameraOn, detectFaces])

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (detectionInterval.current) {
          cancelAnimationFrame(detectionInterval.current)
          detectionInterval.current = null
        }
      } else {
        if (!detectionInterval.current && systemStatus.isCameraOn) {
          detectionInterval.current = requestAnimationFrame(detectFaces)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [detectFaces, systemStatus.isCameraOn])

  // Restart camera if it freezes
  useEffect(() => {
    let lastFrameCount = frameCount.current
    let checkInterval

    const checkCamera = () => {
      if (systemStatus.isCameraOn && lastFrameCount === frameCount.current) {
        console.warn("Camera appears to be frozen, attempting to restart")

        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks()
          tracks.forEach((track) => track.stop())
        }

        startCamera()
      }

      lastFrameCount = frameCount.current
    }

    checkInterval = setInterval(checkCamera, 5000)

    return () => clearInterval(checkInterval)
  }, [startCamera, systemStatus.isCameraOn])

  return (
    <div className="seat-monitor-mini w-full h-full">
      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
        {systemStatus.loadingStatus && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col justify-center items-center z-10 backdrop-blur-sm">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs text-gray-300">{systemStatus.loadingStatus}</p>
          </div>
        )}

        {!cameraActive && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col justify-center items-center z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-gray-400">Camera is currently disabled</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!systemStatus.isCameraOn ? "hidden" : ""}`}
        />

        {systemStatus.isCameraOn && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Status:</span>{" "}
                <span className={systemStatus.verificationColor}>{systemStatus.verificationStatus}</span>
              </div>
              <div className="flex space-x-2">
                <span>
                  <span className="font-semibold">FPS:</span> {systemStatus.fps}
                </span>
                <span>
                  <span className="font-semibold">Faces:</span> {systemStatus.faceCount}
                </span>
                {systemStatus.bodyDetected && (
                  <span className="text-green-400">
                    <span className="font-semibold">Body:</span> Detected
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SeatMonitor