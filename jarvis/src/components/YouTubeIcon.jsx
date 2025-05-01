import React, { useState, useEffect } from 'react';
import { Youtube } from "lucide-react"

function YouTubeIcon({ toggleYouTubeSummarizer }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  const pulseKeyframes = `
    @keyframes youtubePulse {
      0% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
      50% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.8); }
      100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
    }
  `;

  const floatKeyframes = `
    @keyframes youtubeFloat {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `;

  const containerStyle = {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#ff0000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 50,
    boxShadow: "0 0 20px rgba(255, 0, 0, 0.5)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
    animation: "youtubePulse 2s infinite, youtubeFloat 3s ease-in-out infinite",
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
        className="youtube-icon-container"
        style={containerStyle}
        onClick={toggleYouTubeSummarizer}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 0, 0, 0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isAnimating ? "scale(1.1)" : "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 0, 0, 0.5)";
        }}
        title="YouTube Video Summarizer"
      >
        <Youtube style={iconStyle} />
      </div>
    </>
  )
}

export default YouTubeIcon
