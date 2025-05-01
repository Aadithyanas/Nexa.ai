import React from 'react';
import { useContext, useState, useEffect } from "react"
import { Zap } from "lucide-react"
import { datacontext } from "../context/VoiceContext"

function Robot() {
  const { status, isAwake: contextIsAwake } = useContext(datacontext)
  const [robotMood, setRobotMood] = useState("neutral")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isAwake, setIsAwake] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isExcited, setIsExcited] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [showStatus, setShowStatus] = useState(false)

  // Update status text and visibility
  useEffect(() => {
    let text = ""
    if (status === "Passive") {
      text = "SLEEPING..."
      setIsSleeping(true)
      setIsAwake(false)
      setIsListening(false)
      setShowStatus(true)
    } else if (status === "Sleeping") {
      text = "POWERING DOWN..."
      setIsSleeping(true)
      setIsAwake(false)
      setIsListening(false)
      setShowStatus(true)
    } else if (status === "Waking") {
      text = "INITIALIZING..."
      setIsSleeping(false)
      setIsAwake(true)
      setIsListening(false)
      setShowStatus(true)
    } else if (status === "Thinking...") {
      text = "PROCESSING..."
      setIsSleeping(false)
      setIsListening(false)
      setShowStatus(true)
    } else if (isSpeaking) {
      text = "SPEAKING..."
      setIsSleeping(false)
      setShowStatus(true)
    } else if (status === "Listening") {
      text = "LISTENING..."
      setIsSleeping(false)
      setIsListening(true)
      setShowStatus(true)
    } else if (status === "Awake") {
      text = "ONLINE"
      setIsSleeping(false)
      setIsAwake(true)
      setIsListening(true)
      setShowStatus(true)
    } else {
      text = "STANDBY"
      setIsSleeping(false)
      setIsAwake(false)
      setShowStatus(false)
    }
    setStatusText(text)
  }, [status, isSpeaking])

  // Sync with context isAwake state
  useEffect(() => {
    if (contextIsAwake && !isAwake) {
      setIsAwake(true)
      setIsSleeping(false)
      setIsListening(true)
    }
  }, [contextIsAwake, isAwake])

  // Speech synthesis effect
  useEffect(() => {
    const checkSpeaking = () => {
      const isSpeechSynthesisSpeaking = window.speechSynthesis.speaking
      if (isSpeechSynthesisSpeaking !== isSpeaking) {
        setIsSpeaking(isSpeechSynthesisSpeaking)
        if (isSpeechSynthesisSpeaking) {
          setRobotMood("happy")
          setIsExcited(true)
        } else {
          setRobotMood("neutral")
          setIsExcited(false)
        }
      }
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener("start", () => {
        setIsSpeaking(true)
        setRobotMood("happy")
      })
      window.speechSynthesis.addEventListener("end", () => {
        setIsSpeaking(false)
        setRobotMood("neutral")
      })
      const interval = setInterval(checkSpeaking, 100)
      return () => {
        window.speechSynthesis.removeEventListener("start", () => {})
        window.speechSynthesis.removeEventListener("end", () => {})
        clearInterval(interval)
      }
    }
  }, [isSpeaking])

  // Status effect
  useEffect(() => {
    if (status === "Thinking...") {
      setRobotMood("thinking")
    } else if (status === "Awake") {
      setRobotMood("happy")
      setIsAwake(true)
    } else if (status === "Passive") {
      setRobotMood("sleeping")
    } else if (status === "Listening") {
      setRobotMood("listening")
    }
  }, [status])

  return (
    <>
      {/* Status Header - Only show when showStatus is true */}
      {showStatus && (
        <div
            className="status-text"
            style={{
              color: "#38bdf8",
              fontSize: "14px",
              fontWeight: "500",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              className="status-indicator"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#38bdf8",
                animation: isSleeping 
                  ? 'sleepPulse 2s ease-in-out infinite'
                  : isListening || isSpeaking 
                    ? 'activePulse 0.5s ease-in-out infinite'
                    : isAwake
                      ? 'awakePulse 1.5s ease-in-out infinite'
                      : 'none',
              }}
            />
            {statusText}
          </div>
      
      )}

      {/* Main JARVIS Interface */}
      <div
        className="jarvis-container"
        style={{
          position: "fixed",
          left: "12rem",
          top: "8rem",
          width: "80px",
          height: "80px",
          zIndex: 50,
        }}
      >
        <div
          className="jarvis-core"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${isAwake ? '1.1' : '1'})`,
            transition: "transform 0.3s ease-out",
          }}
        >
          {/* Main Circle */}
          <div
            className="jarvis-circle"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))",
              border: "2px solid rgba(14, 165, 233, 0.2)",
              boxShadow: `0 0 20px rgba(14, 165, 233, ${isAwake ? '0.3' : '0.2'})`,
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Energy Core */}
            <div
              className="energy-core"
              style={{
                width: "60%",
                height: "60%",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.3)",
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
                backdropFilter: "blur(4px)",
                opacity: isSleeping ? 0.1 : isListening || isSpeaking ? 0.6 : 0.3,
                animation: isSleeping 
                  ? 'sleep 2s ease-in-out infinite'
                  : isListening || isSpeaking 
                    ? 'pulse 1.5s infinite' 
                    : isAwake 
                      ? 'heartbeat 1.5s ease-in-out infinite'
                      : 'none',
              }}
            />

            {/* Rotating Ring */}
            <div
              className="rotating-ring"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px solid rgba(56, 189, 248, 0.1)",
                borderTop: "2px solid rgba(56, 189, 248, 0.4)",
                animation: `${status === "Thinking..." ? "spin 1s linear infinite" : "none"}`,
              }}
            />

            {/* Additional Rings for Wake/Sleep Effects */}
            {isAwake && (
              <>
                <div className="wake-ring ring1" />
                <div className="wake-ring ring2" />
                <div className="wake-ring ring3" />
              </>
            )}
          </div>

          {/* Sleep Indicators */}
          {isSleeping && (
            <div className="sleep-indicators">
              <div className="z-text z1">Z</div>
              <div className="z-text z2">Z</div>
              <div className="z-text z3">Z</div>
            </div>
          )}

          {/* Wave Effect */}
          {(isListening || isSpeaking) && !isSleeping && (
            <div
              className="wave-container"
              style={{
                position: "absolute",
                width: "150%",
                height: "150%",
                opacity: 0.1,
              }}
            >
              <div className="wave-circle wave1" />
              <div className="wave-circle wave2" />
              <div className="wave-circle wave3" />
            </div>
          )}

          {/* Speaking Visualization */}
          {isSpeaking && !isSleeping && (
            <div className="speak-waves">
              <div className="speak-bar bar1" />
              <div className="speak-bar bar2" />
              <div className="speak-bar bar3" />
              <div className="speak-bar bar4" />
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }

          @keyframes heartbeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.1); }
            28% { transform: scale(1); }
            42% { transform: scale(1.1); }
            70% { transform: scale(1); }
          }

          @keyframes sleep {
            0% { transform: scale(0.9); opacity: 0.2; }
            50% { transform: scale(1); opacity: 0.3; }
            100% { transform: scale(0.9); opacity: 0.2; }
          }

          @keyframes sleepPulse {
            0% { opacity: 0.3; }
            50% { opacity: 0.6; }
            100% { opacity: 0.3; }
          }

          @keyframes activePulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes awakePulse {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
          }

          .wave-circle {
            position: absolute;
            border: 2px solid rgba(56, 189, 248, 0.3);
            border-radius: 50%;
            animation: wave 2s infinite;
            opacity: 0;
            backdrop-filter: blur(2px);
          }

          .wave1 { width: 100%; height: 100%; animation-delay: 0s; }
          .wave2 { width: 100%; height: 100%; animation-delay: 0.6s; }
          .wave3 { width: 100%; height: 100%; animation-delay: 1.2s; }

          @keyframes wave {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          .wake-ring {
            position: absolute;
            border: 2px solid rgba(56, 189, 248, 0.2);
            border-radius: 50%;
            animation: wakeRing 2s infinite;
            backdrop-filter: blur(2px);
          }

          .ring1 { animation-delay: 0s; }
          .ring2 { animation-delay: 0.5s; }
          .ring3 { animation-delay: 1s; }

          @keyframes wakeRing {
            0% { width: 100%; height: 100%; opacity: 0.5; }
            100% { width: 150%; height: 150%; opacity: 0; }
          }

          .sleep-indicators {
            position: absolute;
            top: -30px;
            right: -20px;
            color: #38bdf8;
            font-weight: bold;
          }

          .z-text {
            position: absolute;
            animation: floatZ 2s infinite;
            opacity: 0;
          }

          .z1 { font-size: 16px; animation-delay: 0s; }
          .z2 { font-size: 14px; animation-delay: 0.6s; }
          .z3 { font-size: 12px; animation-delay: 1.2s; }

          @keyframes floatZ {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: translate(-15px, -15px) rotate(-10deg); opacity: 0; }
          }

          .speak-waves {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 3px;
            height: 15px;
            align-items: center;
          }

          .speak-bar {
            width: 3px;
            background: #38bdf8;
            border-radius: 3px;
            animation: speakBar 0.5s ease-in-out infinite;
          }

          .bar1 { height: 30%; animation-delay: 0s; }
          .bar2 { height: 60%; animation-delay: 0.1s; }
          .bar3 { height: 100%; animation-delay: 0.2s; }
          .bar4 { height: 60%; animation-delay: 0.3s; }

          @keyframes speakBar {
            0% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
            100% { transform: scaleY(0.5); }
          }

          @keyframes wake-transition {
            0% { transform: scale(0.8); opacity: 0.3; background: rgba(56, 189, 248, 0.1); }
            50% { transform: scale(1.2); opacity: 0.8; background: rgba(250, 204, 21, 0.4); }
            100% { transform: scale(1); opacity: 1; background: rgba(56, 189, 248, 0.3); }
          }

          @keyframes sleep-transition {
            0% { transform: scale(1); opacity: 1; background: rgba(56, 189, 248, 0.3); }
            50% { transform: scale(1.2); opacity: 0.8; background: rgba(99, 102, 241, 0.4); }
            100% { transform: scale(0.8); opacity: 0.3; background: rgba(56, 189, 248, 0.1); }
          }

          .energy-core {
            animation: ${status === "Waking" 
              ? 'wake-transition 1.5s ease-in-out'
              : status === "Sleeping"
                ? 'sleep-transition 1.5s ease-in-out'
                : isSleeping 
                  ? 'sleep 2s ease-in-out infinite'
                  : isListening || isSpeaking 
                    ? 'pulse 1.5s infinite' 
                    : isAwake 
                      ? 'heartbeat 1.5s ease-in-out infinite'
                      : 'none'};
          }
        `}</style>
      </div>
    </>
  )
}

export default Robot
