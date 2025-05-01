"use client"

import { useState } from "react"
import { FaCopy, FaCheck } from "react-icons/fa"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-sql"

// Load Prism components for syntax highlighting
const loadPrismLanguage = (language) => {
  if (language && !Prism.languages[language]) {
    try {
      require(`prismjs/components/prism-${language}`)
    } catch (e) {
      console.warn(`Prism language '${language}' not found, using fallback`)
    }
  }
}

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  // Determine language or use fallback
  const lang = language || "javascript"
  loadPrismLanguage(lang)

  // Format code with Prism
  const formattedCode = Prism.highlight(code, Prism.languages[lang] || Prism.languages.javascript, lang)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block-container my-4 rounded-md overflow-hidden bg-gray-900 border border-gray-700">
      <div className="code-header flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{lang}</span>
        <button
          onClick={copyToClipboard}
          className="copy-button text-gray-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
        </button>
      </div>
      <div className="code-content p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          <div dangerouslySetInnerHTML={{ __html: formattedCode }} />
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
