import React from 'react';

import { Youtube } from "lucide-react"

function YouTubeIcon({ toggleYouTubeSummarizer }) {
  return (
    <div
      className="youtube-icon-container"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff0000, #cc0000)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 50,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 0, 0, 0.5)",
        border: "2px solid rgba(255, 255, 255, 0.2)",
      }}
      onClick={toggleYouTubeSummarizer}
      title="YouTube Video Summarizer"
    >
      <Youtube
        style={{
          width: "30px",
          height: "30px",
          color: "white",
        }}
      />
    </div>
  )
}

export default YouTubeIcon
