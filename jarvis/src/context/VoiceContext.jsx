"use client"

import { createContext, useState, useCallback } from "react"
import run from "../GeminiApi"
import YoutubeAutomation from "../components/YoutubeAutomation"
import { analyzeTextType, getDeepSeekResponse, formatCodeResponse, formatConversationHistory } from "../deepseekConfig"

export const datacontext = createContext()

function AIContext({ children }) {
  const [conversations, setConversations] = useState([])
  const [status, setStatus] = useState("Ready")
  const [lastError, setLastError] = useState(null)
  const [sessionId, setSessionId] = useState(() => {
    return `session-${Date.now()}`
  })
  const [youtubeQuery, setYoutubeQuery] = useState("")
  const [showYoutube, setShowYoutube] = useState(false)
  const [currentMode, setCurrentMode] = useState("normal")
  const [isProcessing, setIsProcessing] = useState(false)

  // Enhanced function to save chat to the backend
  const saveChat = useCallback(
    async (userMessage, aiResponse, sessionIdOverride) => {
      try {
        await fetch("https://antler-4k4i.onrender.com/save-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "guest",
            session_id: sessionIdOverride || sessionId,
            message: userMessage,
            response: aiResponse,
          }),
        })
      } catch (error) {
        console.error("Error saving chat:", error)
        setLastError("Failed to save chat")
      }
    },
    [sessionId],
  )

  // Improved function to detect follow-up questions
  const isFollowUp = useCallback(
    (prompt) => {
      if (!conversations.length) return false

      // Enhanced follow-up detection with more patterns
      const followUpPatterns = [
        // Direct references
        /\b(it|this|that|these|those|the code|the solution|the answer|the result)\b/i,
        // Questions about previous content
        /\b(explain|clarify|elaborate|tell me more about|what does|how does|why does)\b/i,
        // Modifications to previous content
        /\b(modify|change|update|improve|fix|refactor|optimize)\b/i,
        // Continuations
        /\b(continue|go on|proceed|next|more|another|additional)\b/i,
        // Comparisons
        /\b(instead|alternative|better way|different approach)\b/i,
        // Short queries that likely refer to context
        /^(how\?|why\?|what\?|explain\.?|continue\.?)$/i,
      ]

      // Check if any pattern matches
      const isFollowUpQuery = followUpPatterns.some((pattern) => pattern.test(prompt))

      // Also consider it a follow-up if in programming/logical mode and short query
      const isShortQuery = prompt.split(" ").length <= 5

      return isFollowUpQuery || ((currentMode === "programming" || currentMode === "logical") && isShortQuery)
    },
    [conversations, currentMode],
  )

  // Enhanced AI response function with better context handling
  const aiResponse = useCallback(
    async (prompt, sessionIdOverride) => {
      // Prevent multiple simultaneous requests
      if (isProcessing) return

      setIsProcessing(true)
      setStatus("Processing")
      setConversations((prev) => [...prev, { type: "user", text: prompt }])
      setConversations((prev) => [...prev, { type: "ai-thinking", text: "" }])
      const useSessionId = sessionIdOverride || sessionId

      // Handle YouTube commands
      if (prompt.toLowerCase().includes("play")) {
        const query = prompt.slice(prompt.toLowerCase().indexOf("play") + 5).trim()
        if (query) {
          setYoutubeQuery(query)
          setShowYoutube(true)
          setConversations((prev) => [
            ...prev.slice(0, -1),
            {
              type: "ai",
              text: `Playing "${query}" on YouTube`,
              component: <YoutubeAutomation query={query} />,
            },
          ])
          setStatus("Ready")
          setIsProcessing(false)
          return `Playing "${query}" on YouTube`
        }
      }

      try {
        // Analyze the incoming text
        const analysis = analyzeTextType(prompt)
        const isFollowUpQuery = isFollowUp(prompt)

        // Prepare conversation history for context
        let conversationHistory = []
        if (isFollowUpQuery && conversations.length > 0) {
          conversationHistory = formatConversationHistory(conversations)
        }

        if (analysis.shouldUseDeepSeek || isFollowUpQuery) {
          // Handle with DeepSeek for code, logical questions, or follow-ups
          const enhancedPrompt = prompt

          // For follow-ups, provide more context
          if (isFollowUpQuery && conversations.length > 0) {
            // We don't need to modify the prompt as we're passing the conversation history
          }

          const response = await getDeepSeekResponse(enhancedPrompt, analysis, conversationHistory)

          setCurrentMode(analysis.isProgramming ? "programming" : analysis.isLogical ? "logical" : "normal")
          setConversations((prev) => [...prev.slice(0, -1), { type: "ai", text: response }])
          setStatus("Ready")
          await saveChat(prompt, response, useSessionId)
          setIsProcessing(false)
          return response
        } else {
          // Handle with Gemini for general conversation
          const history = []
          const filtered = conversations.filter((m) => m.type === "user" || m.type === "ai")
          for (let i = 0; i < filtered.length; i += 2) {
            const userMsg = filtered[i]
            const aiMsg = filtered[i + 1]
            if (userMsg && userMsg.type === "user") {
              history.push({ role: "user", parts: [{ text: userMsg.text }] })
            }
            if (aiMsg && aiMsg.type === "ai") {
              history.push({ role: "model", parts: [{ text: aiMsg.text }] })
            }
          }

          history.push({ role: "user", parts: [{ text: prompt }] })
          const text = await run(prompt, history)
          const cleaned = text
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/Google/gi, "Nexa")

          // Check if the response contains code that should be formatted
          const formattedResponse = formatCodeResponse(cleaned)

          setCurrentMode("normal")
          setConversations((prev) => [...prev.slice(0, -1), { type: "ai", text: formattedResponse }])
          setStatus("Ready")
          await saveChat(prompt, formattedResponse, useSessionId)
          setIsProcessing(false)
          return formattedResponse
        }
      } catch (error) {
        console.error("AI response error:", error)
        setLastError("Failed to get AI response")
        setStatus("Error")
        const errorMsg = "Sorry, I encountered an error processing your request."
        setConversations((prev) => [...prev.slice(0, -1), { type: "ai", text: errorMsg }])
        setIsProcessing(false)
        return errorMsg
      }
    },
    [conversations, currentMode, isFollowUp, isProcessing, saveChat, sessionId],
  )

  const clearConversations = useCallback(() => {
    setConversations([])
    setSessionId(`session-${Date.now()}`)
    setCurrentMode("normal")
  }, [])

  const value = {
    aiResponse,
    status,
    conversations,
    setConversations,
    clearConversations,
    sessionId,
    setSessionId,
    lastError,
    setLastError,
    youtubeQuery,
    showYoutube,
    setShowYoutube,
    currentMode,
    isProcessing,
  }

  return <datacontext.Provider value={value}>{children}</datacontext.Provider>
}

export default AIContext
