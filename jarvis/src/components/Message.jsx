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

// Enhanced function to parse message text and extract code blocks, headings, and other formatted content
const parseMessageContent = (text) => {
  // Improved regex for code blocks that handles various formats
  // This regex matches:
  // 1. Triple backtick blocks with or without language specification
  // 2. Code blocks that use indentation instead of backticks
  // 3. Handles whitespace variations
  const codeBlockRegex = /```(\w*)\s*\n([\s\S]*?)```|`{3}\s*(\w*)\s*\n([\s\S]*?)`{3}/g

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

    // Determine language and content from the match groups
    const language = match[1] || match[3] || "javascript"
    const content = match[2] || match[4] || ""

    // Add code block with proper language and trimmed content
    parts.push({
      type: "code",
      language: language.trim(),
      content: content.trim(),
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

// Component to render formatted text with headings, lists, etc.
const FormattedText = ({ content }) => {
  // Process headings (# Heading, ## Subheading, etc.)
  const processedContent = content
    // Process headings
    .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold text-blue-400 mt-4 mb-2">$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold text-blue-300 mt-3 mb-2">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold text-blue-200 mt-2 mb-1">$1</h3>')
    .replace(/^#### (.*?)$/gm, '<h4 class="text-base font-semibold text-gray-200 mt-2 mb-1">$1</h4>')
    .replace(/^##### (.*?)$/gm, '<h5 class="text-sm font-semibold text-gray-300 mt-1 mb-1">$1</h5>')
    .replace(/^###### (.*?)$/gm, '<h6 class="text-xs font-semibold text-gray-400 mt-1 mb-1">$1</h6>')

    // Process bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Process unordered lists
    .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^• (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')

    // Process ordered lists
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal">$2</li>')

    // Process links
    .replace(
      /\[(.*?)\]$$(.*?)$$/g,
      '<a href="$2" class="text-blue-400 underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    // Process horizontal rules
    .replace(/^---$/gm, '<hr class="my-4 border-gray-600" />')

    // Process blockquotes
    .replace(
      /^> (.*?)$/gm,
      '<blockquote class="pl-4 border-l-4 border-blue-500 text-gray-400 italic my-2">$1</blockquote>',
    )

  // Split by newlines and wrap paragraphs
  const lines = processedContent.split("\n")
  let inList = false
  const formattedLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line is a list item
    if (line.includes('<li class="')) {
      if (!inList) {
        // Start a new list
        formattedLines.push('<ul class="my-2">')
        inList = true
      }
      formattedLines.push(line)
    } else {
      // Close list if we were in one
      if (inList) {
        formattedLines.push("</ul>")
        inList = false
      }

      // Skip empty lines
      if (line.trim() === "") {
        formattedLines.push("<br />")
        continue
      }

      // If line is not already a formatted element (heading, etc.), wrap it in a paragraph
      if (!line.startsWith("<h") && !line.startsWith("<blockquote") && !line.startsWith("<hr")) {
        formattedLines.push(`<p class="my-2">${line}</p>`)
      } else {
        formattedLines.push(line)
      }
    }
  }

  // Close list if we're still in one at the end
  if (inList) {
    formattedLines.push("</ul>")
  }

  return <div dangerouslySetInnerHTML={{ __html: formattedLines.join("") }} />
}

const Message = memo(({ msg, sessionId, index, isLatestMessage, isNewChat }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [parsedContent, setParsedContent] = useState([])
  const [isFullyTyped, setIsFullyTyped] = useState(false)
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

  // Parse message content when the message text changes or when typing is complete
  useEffect(() => {
    if (msg.type === "ai" && isFullyTyped) {
      setParsedContent(parseMessageContent(msg.text))
    } else if (msg.type !== "ai") {
      setParsedContent(parseMessageContent(msg.text))
    }
  }, [msg.text, isFullyTyped, msg.type])

  // Typing animation only for new live AI responses (not for history)
  useEffect(() => {
    if (msg.type === "ai" && isLatestMessage && isVisible && isNewChat) {
      setDisplayedText("")
      setIsFullyTyped(false)
      let i = 0
      const interval = setInterval(() => {
        setDisplayedText(msg.text.slice(0, i + 1))
        i++
        if (i >= msg.text.length) {
          clearInterval(interval)
          setIsFullyTyped(true)
        }
      }, 15) // Faster typing speed (ms per character)
      return () => clearInterval(interval)
    } else {
      setDisplayedText(msg.text)
      setIsFullyTyped(true)
    }
  }, [msg.text, msg.type, isLatestMessage, isVisible, isNewChat])

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
  const userBubble = baseBubble + " bg-gray-900 text-gray-200 ml-auto rounded-br-md animate-fade-in"
  const aiBubble = baseBubble + " bg-gray-900 text-gray-200 mr-auto rounded-bl-md animate-fade-in"
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
          <div className="whitespace-pre-line">{displayedText}</div>
        ) : (
          <div className="message-content">
            {parsedContent.map((part, i) =>
              part.type === "text" ? (
                <FormattedText key={i} content={part.content} />
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
