import { useState, useEffect, useRef } from "react";
import React from 'react';
import { jsPDF } from "jspdf";

function YouTubeSummarizer({ onClose }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [displayedTranslation, setDisplayedTranslation] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [error, setError] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for scrolling
  const translationRef = useRef(null);
  const summaryContainerRef = useRef(null);

  const extractVideoId = (url) => {
    const regex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Typing animation effect for translated text
  useEffect(() => {
    if (isTyping && typingIndex < translatedSummary.length) {
      const timer = setTimeout(() => {
        setDisplayedTranslation(prev => prev + translatedSummary[typingIndex]);
        setTypingIndex(typingIndex + 1);
        
        // Scroll to the typing area periodically during typing
        if (typingIndex % 5 === 0 && translationRef.current) {
          translationRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest'
          });
        }
      }, 15); // Speed of typing animation
      
      return () => clearTimeout(timer);
    } else if (typingIndex >= translatedSummary.length && isTyping) {
      setIsTyping(false);
    }
  }, [typingIndex, translatedSummary, isTyping]);

  // Auto-scroll to the translation section when translation starts
  useEffect(() => {
    if (isTyping && translationRef.current) {
      translationRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [isTyping]);

  // Auto-scroll to the summary when it's loaded
  useEffect(() => {
    if (summary && summaryContainerRef.current) {
      summaryContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [summary]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const content = translatedSummary || summary;
    const lines = doc.splitTextToSize(content, 180);
    doc.text("YouTube Video Summary", 10, 10);
    doc.text(lines, 10, 20);
    doc.save("video-summary.pdf");
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setSummary("");
    setTranslatedSummary("");
    setDisplayedTranslation("");
  
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError("Invalid YouTube URL");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch("https://nexa-ai.onrender.com/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
      } else {
        setError(data.error || "Failed to summarize");
      }
    } catch (err) {
      if (err.message.includes("YoutubeTranscriptDisabledError")) {
        setError("Transcript is disabled for this video.");
      } else {
        setError("Error connecting to server");
      }
    }
  
    setLoading(false);
  };
  
  const handleTranslate = async () => {
    if (!summary) return;

    setTranslateLoading(true);
    setDisplayedTranslation("");
    setTypingIndex(0);

    try {
      const response = await fetch("https://nexa-ai.onrender.com/translate/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summary, targetLang: selectedLang }),
      });

      const data = await response.json();
      if (response.ok) {
        setTranslatedSummary(data.translated);
        setIsTyping(true);
      } else {
        setError(data.error || "Translation failed");
      }
    } catch (err) {
      setError("Error connecting to translation server");
    }

    setTranslateLoading(false);
  };

  return (
    <div style={{ padding: "1.5rem", color: "white", position: "relative" }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          @keyframes scanline {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
          }
          .typing-cursor {
            display: inline-block;
            width: 3px;
            height: 18px;
            background-color: #93c5fd;
            margin-left: 2px;
            animation: pulse 0.8s infinite;
            vertical-align: middle;
          }
          .summary-container {
            animation: fadeIn 0.5s ease-out;
          }
          .translation-container {
            animation: fadeIn 0.5s ease-out;
            scroll-margin-top: 20px;
          }
        `}
      </style>

      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          background: "linear-gradient(to right, #ff0000, #cc0000)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "#ff0000" }}
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
        YouTube Video Summarizer
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Paste YouTube URL..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: "rgba(31, 41, 55, 0.7)",
            border: "1px solid rgba(255, 0, 0, 0.3)",
            color: "white",
            width: "100%",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        />

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleSummarize}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              background: loading ? "rgba(156, 163, 175, 0.5)" : "linear-gradient(135deg, #ff0000, #cc0000)",
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "140px",
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ marginRight: "8px" }}></div>
                Summarizing...
              </>
            ) : (
              "Summarize"
            )}
          </button>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            disabled={!summary}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              background: "rgba(31, 41, 55, 0.7)",
              color: "white",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              cursor: summary ? "pointer" : "not-allowed",
              opacity: summary ? 1 : 0.6,
              transition: "opacity 0.3s ease",
            }}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={translateLoading || !summary}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              background: summary ? "linear-gradient(135deg, #6366f1, #4338ca)" : "rgba(99, 102, 241, 0.3)",
              color: "white",
              border: "none",
              cursor: summary && !translateLoading ? "pointer" : "not-allowed",
              fontWeight: "500",
              boxShadow: summary ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "120px",
              transition: "all 0.3s ease",
            }}
          >
            {translateLoading ? (
              <>
                <div className="spinner" style={{ marginRight: "8px" }}></div>
                Translating...
              </>
            ) : (
              "Translate"
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              background: "rgba(31, 41, 55, 0.7)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: "#ef4444",
            padding: "0.75rem",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            borderLeft: "3px solid #ef4444",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {error}
        </div>
      )}

      {summary && (
        <div
          ref={summaryContainerRef}
          className="summary-container"
          style={{
            background: "rgba(31, 41, 55, 0.7)",
            padding: "1.25rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255, 0, 0, 0.2)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 0, 0, 0.1)",
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.75rem",
              color: "#f87171",
            }}
          >
            Video Summary
          </h3>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #ff0000, transparent)",
              animation: "scanline 2s linear infinite",
              opacity: 0.5,
            }}
          ></div>
          <p style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>{summary}</p>

          {translatedSummary && (
            <div 
              ref={translationRef} 
              className="translation-container"
              style={{ marginTop: "1rem" }}
            >
              <h4 style={{ color: "#93c5fd", marginBottom: "0.5rem" }}>
                Translated Summary ({selectedLang.toUpperCase()}):
              </h4>
              <p style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                {displayedTranslation}
                {isTyping && <span className="typing-cursor"></span>}
              </p>
            </div>
          )}

          <button
            onClick={handleDownloadPDF}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background 0.3s ease",
            }}
          >
            Download as PDF
          </button>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "transparent",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer",
          width: "2rem",
          height: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          transition: "all 0.2s ease",
        }}
        title="Close"
      >
        ×
      </button>
    </div>
  );
}

export default YouTubeSummarizer;