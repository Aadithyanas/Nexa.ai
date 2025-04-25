import React from 'react';

import { useContext, useState, useEffect } from "react"
import { Zap } from "lucide-react"
import { datacontext } from "../context/VoiceContext"

function Robot() {
  const { status } = useContext(datacontext)
  const [robotMood, setRobotMood] = useState("neutral") // neutral, happy, thinking
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isAwake, setIsAwake] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Update the monitor speech synthesis effect to properly set isSpeaking
  useEffect(() => {
    // Function to check if speech synthesis is speaking
    const checkSpeaking = () => {
      const isSpeechSynthesisSpeaking = window.speechSynthesis.speaking
      if (isSpeechSynthesisSpeaking !== isSpeaking) {
        setIsSpeaking(isSpeechSynthesisSpeaking)
        if (isSpeechSynthesisSpeaking) {
          setRobotMood("happy")
        } else {
          setRobotMood("neutral")
        }
      }
    }

    // Set up event listeners
    const speechStartHandler = () => {
      setIsSpeaking(true)
      setRobotMood("happy")
    }

    const speechEndHandler = () => {
      setIsSpeaking(false)
      setRobotMood("neutral")
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener("start", speechStartHandler)
      window.speechSynthesis.addEventListener("end", speechEndHandler)

      // Also check periodically in case events are missed
      const interval = setInterval(checkSpeaking, 100)
      return () => {
        window.speechSynthesis.removeEventListener("start", speechStartHandler)
        window.speechSynthesis.removeEventListener("end", speechEndHandler)
        clearInterval(interval)
      }
    }
  }, [isSpeaking])

  // Change robot mood based on status
  useEffect(() => {
    if (status === "Thinking...") {
      setRobotMood("thinking")
    } else if (status === "Awake") {
      setRobotMood("happy")
      setIsAwake(true)
    } else if (status === "Passive") {
      setRobotMood("neutral")
      setIsAwake(false)
    } else if (status === "Listening") {
      setRobotMood("listening")
      setIsListening(true)
    } else {
      setIsListening(false)
    }
  }, [status])

  return (
    <div
      className="robot-container"
      style={{
        position: "absolute",
        right: "2rem",
        top: "6rem",
        width: "120px",
        height: "120px",
        zIndex: 10,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          perspective: "1000px",
        }}
      >
        <div
          className={`robot-face ${robotMood}`}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(14, 165, 233, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "15px",
            border: "2px solid rgba(14, 165, 233, 0.3)",
            transition: "all 0.3s ease",
            transform: isSpeaking ? "scale(1.05)" : "scale(1)",
          }}
        >
          {/* Robot ears - only visible when listening */}
          {isListening && (
            <>
              <div
                className="robot-ear"
                style={{
                  position: "absolute",
                  left: "-15px",
                  top: "40%",
                  width: "10px",
                  height: "20px",
                  borderRadius: "10px 0 0 10px",
                  background: "#38bdf8",
                  boxShadow: "0 0 10px #38bdf8",
                }}
              ></div>
              <div
                className="robot-ear"
                style={{
                  position: "absolute",
                  right: "-15px",
                  top: "40%",
                  width: "10px",
                  height: "20px",
                  borderRadius: "0 10px 10px 0",
                  background: "#38bdf8",
                  boxShadow: "0 0 10px #38bdf8",
                }}
              ></div>
            </>
          )}

          {/* Robot eyes */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 10px",
            }}
          >
            <div
              className={`robot-eye ${isAwake ? "active" : ""}`}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#38bdf8",
                boxShadow: "0 0 10px #38bdf8",
                position: "relative",
              }}
            ></div>
            <div
              className={`robot-eye ${isAwake ? "active" : ""}`}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#38bdf8",
                boxShadow: "0 0 10px #38bdf8",
                position: "relative",
              }}
            ></div>
          </div>

          {/* Robot brain */}
          <div
            className={`robot-brain ${robotMood === "thinking" ? "thinking" : ""}`}
            style={{
              width: "40px",
              height: "10px",
              background: "rgba(14, 165, 233, 0.3)",
              borderRadius: "5px",
              margin: "5px auto",
              boxShadow: robotMood === "thinking" ? "0 0 15px #38bdf8" : "none",
            }}
          ></div>

          {/* Robot mouth */}
          <div
            className={`robot-mouth ${isSpeaking ? "speaking" : ""}`}
            style={{
              width: "40px",
              height: "15px",
              background: "#38bdf8",
              margin: "0 auto",
              borderRadius: robotMood === "happy" ? "0 0 10px 10px" : "5px",
              boxShadow: "0 0 10px #38bdf8",
              transformOrigin: "center",
              position: "relative",
              overflow: "hidden",
            }}
          ></div>
        </div>

        {/* Robot energy particles */}
        {(isSpeaking || status === "Thinking...") && (
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "40px",
              height: "40px",
            }}
          >
            <Zap
              style={{
                width: "100%",
                height: "100%",
                color: "#38bdf8",
                filter: "drop-shadow(0 0 5px #38bdf8)",
                animation: "pulse 1s infinite",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Robot
