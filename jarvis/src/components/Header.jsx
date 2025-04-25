
import React from 'react';

import { useContext } from "react"
import { Mic, Trash2, Power, StopCircle, SkipForward, Cpu, Youtube } from "lucide-react"
import { datacontext } from "../context/VoiceContext"

function Header({ toggleRobot, toggleYouTubeSummarizer }) {
  const { safeStart, status, conversations, clearConversations, goToSleep, wakeUp, recognition } =
    useContext(datacontext)

  // Function to stop voice recognition
  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
  }

  // Function to skip current processing
  const skipToNext = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  // Handle wake up with animation
  const handleWakeUp = () => {
    setTimeout(() => {
      wakeUp()
    }, 500)
  }

  // Handle sleep with animation
  const handleSleep = () => {
    setTimeout(() => {
      goToSleep()
    }, 500)
  }

  // Get status color based on current status
  const getStatusColor = () => {
    switch (status) {
      case "Awake":
        return "#38bdf8"
      case "Passive":
        return "#9ca3af"
      case "Thinking...":
        return "#f59e0b"
      case "Listening":
        return "#10b981"
      default:
        return "#38bdf8"
    }
  }

  // Get status background based on current status
  const getStatusBackground = () => {
    switch (status) {
      case "Awake":
        return "rgba(14, 165, 233, 0.1)"
      case "Passive":
        return "rgba(156, 163, 175, 0.1)"
      case "Thinking...":
        return "rgba(245, 158, 11, 0.1)"
      case "Listening":
        return "rgba(16, 185, 129, 0.1)"
      default:
        return "rgba(14, 165, 233, 0.1)"
    }
  }

  return (
    <div
      className="header-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        background: "rgba(31, 41, 55, 0.7)",
        padding: "1rem",
        borderRadius: "1rem",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 10px rgba(14, 165, 233, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "50%",
              background: "rgba(14, 165, 233, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              boxShadow: status !== "Passive" ? "0 0 15px rgba(14, 165, 233, 0.5)" : "none",
              cursor: "pointer",
            }}
            onClick={status === "Passive" ? handleWakeUp : handleSleep}
            title={status === "Passive" ? "Wake up Nexa" : "Put Nexa to sleep"}
          >
            <Power
              style={{
                width: "1.5rem",
                height: "1.5rem",
                color: status !== "Passive" ? "#38bdf8" : "#9ca3af",
                transition: "color 0.3s ease",
              }}
            />
          </div>
          {status !== "Passive" && <div className="status-dot" />}
        </div>
        <div>
          <h1
            className="app-title"
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              background: "linear-gradient(to right, #38bdf8, #0284c7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
            }}
          >
            Nexa
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Status:
            <span
              style={{
                color: getStatusColor(),
                padding: "0.2rem 0.5rem",
                background: getStatusBackground(),
                borderRadius: "0.25rem",
                transition: "all 0.3s ease",
              }}
            >
              {status}
            </span>
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={safeStart}
          className="control-button"
          style={{
            padding: "0.5rem",
            borderRadius: "50%",
            background: "rgba(14, 165, 233, 0.2)",
            transition: "all 0.2s",
            cursor: "pointer",
            border: "none",
            color: "white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(14, 165, 233, 0.2)",
          }}
          title="Start listening"
        >
          <Mic style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>

        {/* Stop voice processing button */}
        <button
          onClick={stopListening}
          className="control-button"
          style={{
            padding: "0.5rem",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.2)",
            transition: "all 0.2s",
            cursor: "pointer",
            border: "none",
            color: "#ef4444",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(239, 68, 68, 0.2)",
          }}
          title="Stop listening"
        >
          <StopCircle style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>

        {/* Skip to next button */}
        <button
          onClick={skipToNext}
          className="control-button"
          style={{
            padding: "0.5rem",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.2)",
            transition: "all 0.2s",
            cursor: "pointer",
            border: "none",
            color: "#10b981",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(16, 185, 129, 0.2)",
          }}
          title="Skip current speech"
        >
          <SkipForward style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>

        {/* Toggle robot button */}
        <button
          onClick={toggleRobot}
          className="control-button"
          style={{
            padding: "0.5rem",
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.2)",
            transition: "all 0.2s",
            cursor: "pointer",
            border: "none",
            color: "#8b5cf6",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(139, 92, 246, 0.2)",
          }}
          title="Toggle robot"
        >
          <Cpu style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>

        {/* YouTube Summarizer button */}
        <button
          onClick={toggleYouTubeSummarizer}
          className="control-button"
          style={{
            padding: "0.5rem",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.2)",
            transition: "all 0.2s",
            cursor: "pointer",
            border: "none",
            color: "#ef4444",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(239, 68, 68, 0.2)",
          }}
          title="YouTube Summarizer"
        >
          <Youtube style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>

        {conversations.length > 0 && (
          <button
            onClick={clearConversations}
            className="control-button"
            style={{
              padding: "0.5rem",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              transition: "all 0.2s",
              cursor: "pointer",
              border: "none",
              color: "#f87171",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(239, 68, 68, 0.1)",
            }}
            title="Clear conversations"
          >
            <Trash2 style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
