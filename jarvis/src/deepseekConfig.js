import axios from "axios"

const OPENROUTER_API_KEY = "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"
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

// Enhanced text analysis with more patterns and keywords
export const analyzeTextType = (text) => {
  // Programming-related patterns
  const programmingKeywords = [
    "code",
    "program",
    "function",
    "algorithm",
    "implement",
    "write",
    "create",
    "build",
    "develop",
    "debug",
    "syntax",
    "compile",
    "execute",
    "runtime",
    "variable",
    "loop",
    "array",
    "string",
    "integer",
    "boolean",
    "class",
    "object",
    "method",
    "property",
    "inheritance",
    "interface",
    "package",
    "library",
    "framework",
    "api",
    "prime",
    "number",
    "sort",
    "search",
    "binary",
    "tree",
    "graph",
    "stack",
    "queue",
    "linked",
    "list",
    "hash",
    "map",
    "set",
    "dictionary",
    "react",
    "component",
    "jsx",
    "html",
    "css",
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "ruby",
    "php",
    "go",
    "rust",
    "swift",
  ]

  // Code explanation patterns
  const codeExplanationKeywords = [
    "explain",
    "what does",
    "how does",
    "output of",
    "result of",
    "return",
    "print",
    "display",
    "def ",
    "function",
    "class",
    "method",
    "parameter",
    "argument",
    "value",
    "error",
    "bug",
    "fix",
    "issue",
    "problem",
    "solution",
    "optimize",
    "refactor",
    "improve",
  ]

  // Logical/mathematical patterns
  const logicalKeywords = [
    "solve",
    "calculate",
    "find",
    "determine",
    "analyze",
    "optimize",
    "maximize",
    "minimize",
    "evaluate",
    "compute",
    "derive",
    "prove",
    "verify",
    "check",
    "test",
    "pattern",
    "sequence",
    "series",
    "matrix",
    "vector",
    "equation",
    "formula",
    "theorem",
    "proof",
    "logic",
    "probability",
    "statistics",
    "permutation",
    "combination",
    "factorial",
    "algorithm",
    "complexity",
    "big o",
    "time complexity",
    "space complexity",
  ]

  // Enhanced patterns for code detection
  const codeSnippetPattern = /```[\s\S]*?```/
  const languagePattern =
    /(in|using|with)\s+(python|java|c\+\+|javascript|typescript|ruby|php|go|rust|swift|kotlin|scala|r|matlab)/i
  const mathPattern = /(\d+[+\-*/]\d+)|(sqrt|sin|cos|tan|log|ln|integral|derivative)/i
  const codePattern =
    /(def\s+\w+|class\s+\w+|function\s+\w+|\w+\s*$$.*$$\s*[{:]|var\s+\w+|let\s+\w+|const\s+\w+|import\s+|export\s+|from\s+|require\s*\()/
  const htmlPattern = /(<\/?[a-z][\s\S]*?>)/i

  const isProgramming =
    programmingKeywords.some((keyword) => text.toLowerCase().includes(keyword)) ||
    codeSnippetPattern.test(text) ||
    languagePattern.test(text) ||
    codePattern.test(text) ||
    htmlPattern.test(text)

  const isCodeExplanation = codeExplanationKeywords.some((keyword) => text.toLowerCase().includes(keyword))

  const isLogical = logicalKeywords.some((keyword) => text.toLowerCase().includes(keyword)) || mathPattern.test(text)

  return {
    isProgramming,
    isLogical,
    isCodeExplanation,
    shouldUseDeepSeek: isProgramming || isLogical || isCodeExplanation,
  }
}

// Improved code formatting with language detection
export const formatCodeResponse = (response) => {
  // If the response already contains code blocks, ensure they have language specifiers
  if (response.includes("```")) {
    // Replace code blocks without language specifier with appropriate language
    return response.replace(/```(?!\w)/g, "```javascript")
  }

  // Detect code patterns that should be wrapped in code blocks
  const codePatterns = [
    { pattern: /(function\s+\w+\s*$$[^)]*$$\s*{[\s\S]*?})/g, language: "javascript" },
    { pattern: /(const|let|var)\s+\w+\s*=\s*(?:function|$$[^)]*$$\s*=>)/g, language: "javascript" },
    { pattern: /(class\s+\w+\s*{[\s\S]*?})/g, language: "javascript" },
    { pattern: /(import\s+.*?from\s+['"].*?['"];)/g, language: "javascript" },
    { pattern: /(def\s+\w+\s*$$[^)]*$$:[\s\S]*?)(?=\n\w|$)/g, language: "python" },
    { pattern: /(class\s+\w+\s*(?:$$[^)]*$$)?\s*:[\s\S]*?)(?=\n\w|$)/g, language: "python" },
    { pattern: /(<\w+[^>]*>[\s\S]*?<\/\w+>)/g, language: "html" },
  ]

  let modifiedResponse = response

  // Check if the response contains code patterns that should be wrapped
  for (const { pattern, language } of codePatterns) {
    if (pattern.test(modifiedResponse)) {
      // Extract code blocks and wrap them
      modifiedResponse = modifiedResponse.replace(pattern, (match) => {
        return `\n\`\`\`${language}\n${match}\n\`\`\`\n`
      })
    }
  }

  return modifiedResponse
}

// Enhanced prompt engineering for better responses
export const enhancePrompt = (prompt, type, conversationContext = []) => {
  let systemPrompt = ""

  if (type.isProgramming || type.isCodeExplanation) {
    systemPrompt = `You are a programming expert. Please provide a detailed response with the following guidelines:
        1. If explaining code: Provide a clear, step-by-step explanation
        2. If showing code: Format it in proper code blocks with syntax highlighting using \`\`\`language format
        3. Include example outputs if relevant
        4. Explain any technical concepts used
        5. Use proper formatting for code and technical terms
        6. Always wrap code in \`\`\`javascript (or appropriate language) code blocks
        7. Use proper Markdown formatting for headings (# for main headings, ## for subheadings)
        8. Keep explanations concise but thorough`
  } else if (type.isLogical) {
    systemPrompt = `You are a logical problem-solving assistant. Please provide a detailed solution for the following request.
        Include step-by-step explanation, mathematical formulas if applicable, and clear reasoning.
        Format any code or mathematical expressions in appropriate code blocks.
        Use proper Markdown formatting for headings (# for main headings, ## for subheadings).`
  } else {
    systemPrompt = `You are Nexa, a helpful AI assistant. Provide clear, concise, and accurate responses.
        If your response includes code, always format it in proper code blocks with syntax highlighting.
        Use proper Markdown formatting for headings (# for main headings, ## for subheadings).
        Structure your responses with clear sections and bullet points where appropriate.`
  }

  // Add conversation context if available
  let messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ]

  // Add conversation history for context
  if (conversationContext.length > 0) {
    messages = [...messages, ...conversationContext]
  }

  // Add the current user prompt
  messages.push({
    role: "user",
    content: prompt,
  })

  return messages
}

// Improved API call with conversation context
export const getDeepSeekResponse = async (prompt, type, conversationContext = []) => {
  try {
    const messages = enhancePrompt(prompt, type, conversationContext)

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "deepseek/deepseek-r1:free",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Nexa AI Assistant",
          "Content-Type": "application/json",
        },
      },
    )

    const content = response.data.choices[0].message.content
    return formatCodeResponse(content)
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    throw error
  }
}

// Function to convert conversation history to DeepSeek format
export const formatConversationHistory = (conversations, maxPairs = 3) => {
  const history = []
  const filtered = conversations.filter((m) => m.type === "user" || m.type === "ai")

  // Get the most recent conversation pairs (up to maxPairs)
  const recentMessages = filtered.slice(-maxPairs * 2)

  for (let i = 0; i < recentMessages.length; i += 2) {
    const userMsg = recentMessages[i]
    const aiMsg = recentMessages[i + 1]

    if (userMsg && userMsg.type === "user") {
      history.push({ role: "user", content: userMsg.text })
    }

    if (aiMsg && aiMsg.type === "ai") {
      history.push({ role: "assistant", content: aiMsg.text })
    }
  }

  return history
}
