import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileIcon({ toogleFileSummary }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  const pulseKeyframes = `
    @keyframes filePulse {
      0% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
      50% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.8); }
      100% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
    }
  `;

  const floatKeyframes = `
    @keyframes fileFloat {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `;

  const containerStyle = {
    position: "fixed",
    bottom: "6rem",
    right: "2rem",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 50,
    boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
    animation: "filePulse 2s infinite, fileFloat 3s ease-in-out infinite",
    transform: isAnimating ? "scale(1.1)" : "scale(1)"
  };

  const iconStyle = {
    width: "28px",
    height: "28px",
    color: "white",
    transition: "transform 0.3s ease"
  };

  return (
    <>
      <style>
        {pulseKeyframes}
        {floatKeyframes}
      </style>
      <div
        className="file-icon-container"
        style={containerStyle}
        onClick={toogleFileSummary}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(37, 99, 235, 0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isAnimating ? "scale(1.1)" : "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(37, 99, 235, 0.5)";
        }}
        title="File Summarizer"
      >
        <UploadCloud style={iconStyle} />
      </div>
    </>
  );
}