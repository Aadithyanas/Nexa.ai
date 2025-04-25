import React from "react"
import { useState, useEffect, useRef } from "react"
import { UploadCloud } from "lucide-react"

export default function FileSummarizerModal({ onClose }) {
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState("")
  const [fullSummary, setFullSummary] = useState("")
  const [currentSentences, setCurrentSentences] = useState([])
  const [displayedCount, setDisplayedCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const modalRef = useRef(null)

  // Rainbow border animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (modalRef.current) {
        const hue = (Date.now() / 30) % 360
        modalRef.current.style.boxShadow = `
          0 0 30px rgba(255, 100, 100, 0.5),
          0 0 60px rgba(${Math.sin((hue / 180) * Math.PI) * 127 + 128}, ${Math.sin(((hue + 120) / 180) * Math.PI) * 127 + 128}, ${Math.sin(((hue + 240) / 180) * Math.PI) * 127 + 128}, 0.3)
        `
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  // Typing animation effect
  useEffect(() => {
    if (currentSentences.length > 0 && !isTyping) {
      const fullText = currentSentences.join(". ") + "."
      let i = 0
      setTypingText("")
      setIsTyping(true)

      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypingText((prev) => prev + fullText.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 15) // Speed of typing

      return () => clearInterval(typingInterval)
    }
  }, [currentSentences])

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setTypingText("")

    // Add a pulse effect to the modal during loading
    if (modalRef.current) {
      modalRef.current.classList.add("pulse-effect")
    }

    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("http://localhost:3002/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setSummary(data.summary)
      setFullSummary(data.fullSummary)
      const allSentences = data.fullSummary.split(/[.!?]\s+/).filter(Boolean)
      setCurrentSentences(allSentences.slice(0, 10))
      setDisplayedCount(10)
    } catch (err) {
      console.error("Error fetching summary:", err)
    }

    setLoading(false)

    // Remove pulse effect
    if (modalRef.current) {
      modalRef.current.classList.remove("pulse-effect")
    }
  }

  const handleAddMore = () => {
    const allSentences = fullSummary.split(/[.!?]\s+/).filter(Boolean)
    const nextSentences = allSentences.slice(0, displayedCount + 5)
    setCurrentSentences(nextSentences)
    setDisplayedCount((prev) => prev + 5)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        animation: "fadeIn 0.5s ease-in-out",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "rgba(15, 15, 20, 0.95)",
          borderRadius: "1rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "56rem",
          color: "#f0f0f0",
          transform: "scale(1)",
          transition: "all 0.3s",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          animation: "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Glow effect background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "150%",
            height: "150%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255, 100, 50, 0.15) 0%, rgba(25, 25, 30, 0) 70%)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        ></div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              color: "#ffffff",
              textShadow: "0 0 10px rgba(255, 100, 50, 0.5)",
            }}
          >
            <UploadCloud
              size={28}
              style={{
                color: "#ff6432",
                marginRight: "0.75rem",
                filter: "drop-shadow(0 0 8px rgba(255, 100, 50, 0.7))",
                animation: "float 3s ease-in-out infinite",
              }}
            />
            File Summarizer
          </h2>
          <button
            onClick={onClose}
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.color = "#ffffff"
              e.currentTarget.style.transform = "rotate(90deg)"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"
              e.currentTarget.style.transform = "rotate(0deg)"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              position: "relative",
              marginBottom: "1.5rem",
              borderRadius: "0.5rem",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <input
              type="file"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                color: "#ffffff",
                background: "transparent",
                border: "none",
                outline: "none",
                zIndex: 2,
                position: "relative",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "2px",
                width: file ? "100%" : "0%",
                background: "linear-gradient(90deg, #ff6432, #ff328f)",
                transition: "width 0.5s ease-in-out",
              }}
            ></div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              transition: "all 0.3s",
              marginTop: "1rem",
              backgroundColor: loading || !file ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 100, 50, 0.2)",
              color: loading || !file ? "rgba(255, 255, 255, 0.5)" : "#ffffff",
              cursor: loading || !file ? "not-allowed" : "pointer",
              border: loading || !file ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 100, 50, 0.3)",
              boxShadow: loading || !file ? "none" : "0 0 20px rgba(255, 100, 50, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              if (!loading && file) {
                e.currentTarget.style.backgroundColor = "rgba(255, 100, 50, 0.3)"
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 100, 50, 0.3)"
              }
            }}
            onMouseOut={(e) => {
              if (!loading && file) {
                e.currentTarget.style.backgroundColor = "rgba(255, 100, 50, 0.2)"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 100, 50, 0.2)"
              }
            }}
          >
            {/* Button background glow effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at center, rgba(255, 100, 50, 0.3) 0%, rgba(255, 100, 50, 0) 70%)",
                opacity: loading || !file ? 0.2 : 0.8,
                pointerEvents: "none",
              }}
            ></div>

            <UploadCloud
              size={20}
              style={{
                animation: loading ? "spin 1s linear infinite" : "float 2s ease-in-out infinite",
                filter: "drop-shadow(0 0 5px rgba(255, 100, 50, 0.7))",
              }}
            />
            {loading ? "Processing..." : "Upload & Summarize"}
          </button>

          {currentSentences.length > 0 && (
            <div
              style={{
                marginTop: "2rem",
               
                padding: "1.5rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "0.75rem",
                transition: "all 0.3s",
                animation: "fadeInUp 0.5s ease-in-out",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0, 0, 0, 0.3)")}
            >
              {/* Summary background glow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at top right, rgba(255, 100, 50, 0.1) 0%, rgba(25, 25, 30, 0) 70%)",
                  pointerEvents: "none",
                }}
              ></div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#ff6432",
                    boxShadow: "0 0 10px rgba(255, 100, 50, 0.7)",
                    animation: "pulse 2s infinite",
                  }}
                ></span>
                Summary
              </h3>

              <div
               style={{
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: 1.6,
                fontSize: "1.05rem",
                minHeight: "100px",
                maxHeight: "200px",
                overflowY: "auto"
              }}
              
              >
                {isTyping ? typingText : currentSentences.join(". ") + "."}
                {isTyping && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "1.2em",
                      backgroundColor: "#ff6432",
                      marginLeft: "2px",
                      verticalAlign: "middle",
                      animation: "blink 1s infinite",
                    }}
                  ></span>
                )}
              </div>

              <button
                onClick={handleAddMore}
                disabled={displayedCount >= fullSummary.split(/[.!?]\s+/).length}
                style={{
                  marginTop: "1.5rem",
                  padding: "0.5rem 1.25rem",
                  border: "1px solid rgba(255, 100, 50, 0.3)",
                  color: "#ff6432",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s",
                  opacity: displayedCount >= fullSummary.split(/[.!?]\s+/).length ? 0.5 : 1,
                  cursor: displayedCount >= fullSummary.split(/[.!?]\s+/).length ? "not-allowed" : "pointer",
                  background: "rgba(255, 100, 50, 0.05)",
                  backdropFilter: "blur(5px)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  if (displayedCount < fullSummary.split(/[.!?]\s+/).length) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 100, 50, 0.15)"
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 100, 50, 0.3)"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }
                }}
                onMouseOut={(e) => {
                  if (displayedCount < fullSummary.split(/[.!?]\s+/).length) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 100, 50, 0.05)"
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.transform = "translateY(0)"
                  }
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at center, rgba(255, 100, 50, 0.2) 0%, rgba(255, 100, 50, 0) 70%)",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                ></div>
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(255, 100, 50, 0.3), 0 0 40px rgba(255, 100, 50, 0.1); }
          50% { box-shadow: 0 0 30px rgba(255, 100, 50, 0.5), 0 0 60px rgba(255, 100, 50, 0.2); }
          100% { box-shadow: 0 0 20px rgba(255, 100, 50, 0.3), 0 0 40px rgba(255, 100, 50, 0.1); }
        }
        .pulse-effect {
          animation: glow 1.5s infinite;
        }
      `}</style>
    </div>
  )
}
