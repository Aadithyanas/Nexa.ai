import React from 'react';

import YouTubeSummarizer from "./YouTubeSummarizer"

function YouTubeSummarizerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
        <div className="p-4 sm:p-6">
          <YouTubeSummarizer onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

export default YouTubeSummarizerModal
