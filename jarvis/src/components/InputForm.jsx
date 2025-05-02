import React, { useContext, useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import { datacontext } from "../context/VoiceContext"

function InputForm({ sessionId }) {
  const { status, aiResponse, isAwake } = useContext(datacontext)
  const [textInput, setTextInput] = useState("")
  const [rows, setRows] = useState(1)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (status === "Awake" && textareaRef.current) {
      textareaRef.current.focus()
    }
    if (status === "Passive") {
      setTextInput("")
      setRows(1)
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px'
      }
    }
  }, [status])

  const handleInput = (e) => {
    const textarea = e.target
    const value = textarea.value
    setTextInput(value)
    
    textarea.style.height = '40px'
    
    if (!value.trim()) {
      setRows(1)
      return
    }
    
    const newRows = Math.min(Math.max(1, Math.ceil(textarea.scrollHeight / 24)), 6)
    setRows(newRows)
    
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim() === "" || status === "Passive") return
    aiResponse(textInput, sessionId)
    setTextInput("")
    setRows(1)
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full"
      ref={containerRef}
    >
      <div
        className={`relative rounded-lg overflow-hidden transition-all duration-300 ease-in-out
          bg-transparent
          ${rows > 1 ? "py-2" : "py-1"}
          ${isFocused ? 'ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'ring-1 ring-white/10'}`}
        style={{
          opacity: status === "Passive" ? 0.5 : 1,
          pointerEvents: status === "Passive" ? "none" : "auto",
        }}
      >
        <textarea
          ref={textareaRef}
          value={textInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          placeholder={status === "Passive" ? "Say 'Nexa' to wake me up..." : "Type your message... (Shift+Enter for new line)"}
          className="w-full px-4 py-2 bg-transparent border-none outline-none resize-none text-white
            placeholder-gray-400 text-sm sm:text-base transition-all duration-300"
          style={{
            minHeight: "40px",
            maxHeight: "144px",
          }}
          disabled={status === "Passive"}
        />
        <button
          type="submit"
          className={`absolute right-2 bottom-2 p-2 rounded-full transition-all duration-300
            bg-transparent ring-1 
            ${textInput.trim() 
              ? 'ring-blue-500/50 text-blue-400 hover:text-blue-300 hover:ring-blue-400/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
              : 'ring-white/10 text-gray-400 hover:text-gray-300'}
            ${rows > 1 ? "mb-2" : ""}`}
          disabled={status === "Passive" || !textInput.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}

export default InputForm