import React from 'react';


import { useContext, useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import { datacontext } from "../context/VoiceContext"

function InputForm({ sessionId }) {
  const { status, aiResponse, isAwake } = useContext(datacontext)
  const [textInput, setTextInput] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (status === "Awake" && inputRef.current) {
      inputRef.current.focus()
    }
    // Clear input when going to sleep
    if (status === "Passive") {
      setTextInput("")
    }
  }, [status])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim() === "" || status === "Passive") return
    aiResponse(textInput, sessionId)
    setTextInput("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: "relative",
      }}
    >
      <div
        className={status !== "Passive" ? "input-container" : ""}
        style={{
          position: "relative",
          borderRadius: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 15px rgba(14, 165, 233, 0.2)",
          transition: "all 0.3s ease",
          opacity: status === "Passive" ? 0.5 : 1,
          pointerEvents: status === "Passive" ? "none" : "auto",
        }}
      >
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={status === "Passive" ? "Say 'Nexa' to wake me up..." : "Type your message..."}
          ref={inputRef}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            paddingRight: "3rem",
            background: "rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(10px)",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "0.875rem",
          }}
          disabled={status === "Passive"}
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "0.5rem",
            background: "none",
            border: "none",
            cursor: status === "Passive" ? "not-allowed" : "pointer",
            opacity: status === "Passive" ? 0.5 : 1,
          }}
          disabled={status === "Passive"}
        >
          <Send className="text-blue-400" size={20} />
        </button>
      </div>
    </form>
  )
}

export default InputForm