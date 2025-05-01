"use client"

import { useRef, useEffect, useState, memo } from "react"
import { FaVolumeUp } from "react-icons/fa"
import CodeBlock from "./CodeBlock"

const UserRobot = memo(({ isVisible, animate }) => {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        marginLeft: "8px",
        opacity: isVisible ? 1 : 0,
        transform: `scale(${isVisible ? 1 : 0.8}) translateX(${isVisible ? 0 : 10}px)`,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f766e, #0d9488)",
          borderRadius: "12px",
          border: "2px solid rgba(20, 184, 166, 0.3)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "4px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          animation: animate ? "userRobotBounce 0.5s ease" : "none",
        }}
      >
        {/* Antenna */}
        <div
          style={{
            width: "6px",
            height: "6px",
            background: "#5eead4",
            borderRadius: "50%",
            margin: "-8px auto 0",
            boxShadow: "0 0 4px #5eead4",
          }}
        />
        {/* Eyes */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 4px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#5eead4",
              boxShadow: "0 0 4px #5eead4",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#5eead4",
              boxShadow: "0 0 4px #5eead4",
            }}
          />
        </div>
        {/* Mouth */}
        <div
          style={{
            width: "12px",
            height: "3px",
            background: "#5eead4",
            margin: "0 auto",
            borderRadius: "3px",
            boxShadow: "0 0 4px #5eead4",
            transform: "rotate(0deg)",
          }}
        />
      </div>
    </div>
  )
})

const AIRobot = memo(({ isVisible, animate }) => {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        marginRight: "8px",
        opacity: isVisible ? 1 : 0,
        transform: `scale(${isVisible ? 1 : 0.8}) translateX(${isVisible ? 0 : -10}px)`,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          borderRadius: "12px",
          border: "2px solid rgba(14, 165, 233, 0.3)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "4px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          animation: animate ? "aiRobotBounce 0.5s ease" : "none",
        }}
      >
        {/* Ears */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "-6px" }}>
          <div
            style={{
              width: "4px",
              height: "8px",
              background: "#38bdf8",
              borderRadius: "2px",
              marginLeft: "-2px",
              boxShadow: "0 0 4px #38bdf8",
            }}
          />
          <div
            style={{
              width: "4px",
              height: "8px",
              background: "#38bdf8",
              borderRadius: "2px",
              marginRight: "-2px",
              boxShadow: "0 0 4px #38bdf8",
            }}
          />
        </div>
        {/* Eyes */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 4px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 4px #38bdf8",
            }}
          />
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 4px #38bdf8",
            }}
          />
        </div>
        {/* Mouth */}
        <div
          style={{
            width: "12px",
            height: "3px",
            background: "#38bdf8",
            margin: "0 auto",
            borderRadius: "0 0 3px 3px",
            boxShadow: "0 0 4px #38bdf8",
          }}
        />
      </div>
    </div>
  )
})

// Function to parse message text and extract code blocks
const parseMessageContent = (text) => {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add code block
    parts.push({
      type: "code",
      language: match[1] || "javascript",
      content: match[2],
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last code block
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    })
  }

  // If no code blocks were found, return the entire text as a single text part
  if (parts.length === 0) {
    parts.push({
      type: "text",
      content: text,
    })
  }

  return parts
}

const Message = memo(({ msg, sessionId, index, isLatestMessage }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [parsedContent, setParsedContent] = useState([])
  const [isFullyTyped, setIsFullyTyped] = useState(true)
  const messageRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (messageRef.current) {
      observer.observe(messageRef.current)
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current)
      }
    }
  }, [])

  // Parse message content when the message text changes
  useEffect(() => {
    setParsedContent(parseMessageContent(msg.text))
    setDisplayedText(msg.text)
  }, [msg.text])

  // Speak handler for AI responses
  const handleSpeak = () => {
    if ("speechSynthesis" in window && msg.type === "ai") {
      const utter = new window.SpeechSynthesisUtterance(msg.text)
      utter.lang = "en-US"
      window.speechSynthesis.speak(utter)
    }
  }

  // Tailwind bubble classes - Modified for black background, white text, and blue borders
  const baseBubble =
    "px-4 py-3 rounded-2xl shadow-md text-sm font-medium transition-all duration-300 max-w-[80%] break-words border border-blue-500"
  const userBubble = baseBubble + " bg-transparent backdrop-blur-md text-gray-200 ml-auto rounded-br-md animate-fade-in"
  const aiBubble = baseBubble + " bg-transparent backdrop-blur-md text-gray-200 mr-auto rounded-bl-md animate-fade-in"
  const systemBubble = baseBubble + " bg-gray-600 text-gray-200 mx-auto text-center animate-fade-in"

  return (
    <div
      ref={messageRef}
      key={`${sessionId}-${index}`}
      className={`flex items-end mb-2 scrollbar-hide ${
        msg.type === "user" ? "justify-end" : msg.type === "system" ? "justify-center" : "justify-start"
      }`}
    >
      {msg.type === "ai" && <AIRobot isVisible={isVisible} animate={isLatestMessage} />}
      <div
        className={msg.type === "user" ? userBubble : msg.type === "system" ? systemBubble : aiBubble}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : msg.type === "user" ? "translateY(20px)" : "translateY(-20px)",
          position: "relative",
        }}
      >
        <p className="mb-1 text-xs font-semibold opacity-80">
          {msg.type === "user" ? "You" : msg.type === "system" ? "System" : "Nexa"}
        </p>

        {/* Render message content */}
        {msg.type === "ai" && !isFullyTyped ? (
          <p className="whitespace-pre-line">{displayedText}</p>
        ) : (
          <div className="message-content">
            {parsedContent.map((part, i) =>
              part.type === "text" ? (
                <p key={i} className="whitespace-pre-line mb-2">
                  {part.content}
                </p>
              ) : (
                <CodeBlock key={i} code={part.content} language={part.language} />
              ),
            )}
          </div>
        )}

        {/* Render YoutubeAutomation or any attached component */}
        {msg.component && <div className="message-component-wrapper mt-2">{msg.component}</div>}

        {/* Speak icon for AI responses */}
        {msg.type === "ai" && (
          <button
            onClick={handleSpeak}
            className="absolute bottom-2 right-2 p-1 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors"
            title="Speak this response"
            style={{ lineHeight: 0 }}
          >
            <FaVolumeUp className="text-blue-300" size={16} />
          </button>
        )}
      </div>
      {msg.type === "user" && <UserRobot isVisible={isVisible} animate={isLatestMessage} />}
    </div>
  )
})

export default Message
