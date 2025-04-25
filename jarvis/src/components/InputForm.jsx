import React from 'react';


import { useContext, useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import { datacontext } from "../context/VoiceContext"

function InputForm() {
  const { status, aiResponse } = useContext(datacontext)
  const [textInput, setTextInput] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (status === "Awake" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim() === "") return
    aiResponse(textInput)
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
        }}
      >
        <input
          type="text"
          ref={inputRef}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={status === "Passive" ? "Say 'Friday' to wake up your assistant..." : "Type your message..."}
          disabled={status === "Passive"}
          style={{
            width: "100%",
            background: "rgba(31, 41, 55, 0.7)",
            color: "white",
            padding: "0.85rem 3.5rem 0.85rem 1.25rem",
            borderRadius: "0.75rem",
            border: status !== "Passive" ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
            outline: "none",
            backdropFilter: "blur(10px)",
            opacity: status === "Passive" ? 0.5 : 1,
            cursor: status === "Passive" ? "not-allowed" : "text",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
          }}
        />
        <button
          type="submit"
          disabled={status === "Passive" || textInput.trim() === ""}
          style={{
            position: "absolute",
            right: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "0.5rem",
            borderRadius: "50%",
            background: textInput.trim() !== "" ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "rgba(75, 85, 99, 0.5)",
            border: "none",
            cursor: status === "Passive" || textInput.trim() === "" ? "not-allowed" : "pointer",
            color: "white",
            transition: "all 0.3s ease",
            opacity: status === "Passive" || textInput.trim() === "" ? 0.5 : 1,
            boxShadow:
              textInput.trim() !== "" ? "0 4px 6px rgba(14, 165, 233, 0.3), 0 0 10px rgba(14, 165, 233, 0.2)" : "none",
          }}
        >
          <Send
            style={{
              width: "1rem",
              height: "1rem",
              transform: textInput.trim() !== "" ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      </div>
    </form>
  )
}

export default InputForm
