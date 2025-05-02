"use client"

import { useContext, useRef, useEffect, useState, memo } from "react"
import { datacontext } from "../context/VoiceContext"
import Message from "./Message"

const TypingBubble = () => (
  <div className="flex items-end mb-2 justify-start">
    <div className="px-4 py-3 rounded-2xl shadow-md text-sm font-medium max-w-[80%] bg-gray-900 text-gray-200 mr-auto rounded-bl-md animate-fade-in flex items-center gap-2 border border-blue-500">
      <span className="mb-1 text-xs font-semibold opacity-80">Nexa</span>
      <span className="flex gap-1 ml-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
      </span>
    </div>
  </div>
)

function ChatArea({ sessionId }) {
  const { conversations, setConversations, isProcessing } = useContext(datacontext)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const chatEndRef = useRef(null)
  const [isNewChat, setIsNewChat] = useState(true)

  useEffect(() => {
    setIsNewChat(!sessionId)
  }, [sessionId])

  useEffect(() => {
    const fetchSessionMessages = async () => {
      if (!sessionId) {
        setConversations([])
        setIsNewChat(true)
        return
      }

      setIsLoading(true)
      setError(null)
      setIsNewChat(false)

      try {
        const response = await fetch(`https://antler-4k4i.onrender.com/session/${sessionId}`)
        if (!response.ok) throw new Error("Failed to fetch session messages")

        const data = await response.json()

        if (data.chats && Array.isArray(data.chats)) {
          // Transform the flat chats array into conversation pairs
          const formattedMessages = []
          data.chats.forEach((chat) => {
            if (chat.message) {
              formattedMessages.push({ type: "user", text: chat.message })
            }
            if (chat.response) {
              formattedMessages.push({ type: "ai", text: chat.response })
            }
          })
          setConversations(formattedMessages)
        } else {
          setConversations([])
        }
      } catch (err) {
        console.error("Error fetching session messages:", err)
        setError("Failed to load conversation history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionMessages()
  }, [sessionId, setConversations])

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversations])

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-gray-900">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return <div className="flex-1 flex justify-center items-center text-white bg-gray-900">{error}</div>
  }

  return (
    <div className="flex flex-col mt-24 gap-2 w-full h-[65vh] py-4  scrollbar-hide sm:h-[70vh] overflow-y-auto p-2 bg-transparent rounded-xl shadow-inner">
      {conversations && conversations.length > 0 ? (
        conversations.map((msg, idx) =>
          msg.type === "ai-thinking" ? (
            <TypingBubble key={idx} />
          ) : (
            <Message
              key={idx}
              msg={msg}
              sessionId={sessionId}
              index={idx}
              isLatestMessage={idx === conversations.length - 1}
              isNewChat={isNewChat}
            />
          ),
        )
      ) : (
        <div className="text-center text-gray-400 py-8">
          Hi there! <br />
          Start the conversation!
        </div>
      )}
      {isProcessing && <TypingBubble />}
      <div ref={chatEndRef} />
    </div>
  )
}

export default memo(ChatArea)
