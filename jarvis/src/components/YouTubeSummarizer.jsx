import { useState, useEffect, useRef } from "react";
import React from 'react';
import { jsPDF } from "jspdf";
import { Youtube, X, Download, Languages } from "lucide-react";

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
        
        if (typingIndex % 5 === 0 && translationRef.current) {
          translationRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest'
          });
        }
      }, 15);
      
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
    <div className="text-white">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Youtube className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            YouTube Video Summarizer
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
          />
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Summarizing...
              </>
            ) : (
              "Summarize"
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm sm:text-base">
            {error}
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-400">Video Summary</h3>
              <p className="text-gray-300 text-sm sm:text-base">{summary}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
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
                disabled={translateLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                {translateLoading ? "Translating..." : "Translate"}
              </button>

              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Download PDF
              </button>
            </div>

            {translatedSummary && (
              <div ref={translationRef} className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-400">
                  Translated Summary ({selectedLang.toUpperCase()})
                </h3>
                <p className="text-gray-300 text-sm sm:text-base">
                  {displayedTranslation}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default YouTubeSummarizer;