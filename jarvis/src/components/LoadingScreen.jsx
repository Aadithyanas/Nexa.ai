
import React from 'react';

import { useEffect, useState } from "react"

function LoadingScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress > 100 ? 100 : newProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111827, #1f2937)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(14, 165, 233, 0.5)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "15px",
          border: "2px solid rgba(14, 165, 233, 0.3)",
          marginBottom: "2rem",
          animation: "pulse 2s infinite",
        }}
      >
        {/* Robot eyes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 10px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 10px #38bdf8",
              animation: "blink 1s infinite",
            }}
          ></div>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 10px #38bdf8",
              animation: "blink 1s infinite 0.5s",
            }}
          ></div>
        </div>

        {/* Robot brain */}
        <div
          style={{
            width: "40px",
            height: "10px",
            background: "rgba(14, 165, 233, 0.3)",
            borderRadius: "5px",
            margin: "5px auto",
            boxShadow: "0 0 15px #38bdf8",
            animation: "thinking 1s infinite",
          }}
        ></div>

        {/* Robot mouth */}
        <div
          style={{
            width: "40px",
            height: "15px",
            background: "#38bdf8",
            margin: "0 auto",
            borderRadius: "5px",
            boxShadow: "0 0 10px #38bdf8",
          }}
        ></div>
      </div>

      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: "bold",
          background: "linear-gradient(to right, #38bdf8, #0284c7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1.5rem",
        }}
      >
        Friday
      </h1>

      <div
        style={{
          width: "300px",
          height: "6px",
          background: "rgba(31, 41, 55, 0.7)",
          borderRadius: "3px",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${loadingProgress}%`,
            background: "linear-gradient(to right, #38bdf8, #0284c7)",
            borderRadius: "3px",
            transition: "width 0.2s ease",
          }}
        ></div>
      </div>

      <p
        style={{
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        {loadingProgress < 100 ? "Initializing systems..." : "Ready to assist you"}
      </p>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes thinking {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
