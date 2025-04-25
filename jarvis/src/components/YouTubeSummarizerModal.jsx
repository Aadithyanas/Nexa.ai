
import React from 'react';

import YouTubeSummarizer from "./YouTubeSummarizer"

function YouTubeSummarizerModal({ onClose }) {
  return (
    <div className="youtube-summarizer-modal">
      <div className="youtube-summarizer-container">
        <YouTubeSummarizer onClose={onClose} />
      </div>
    </div>
  )
}

export default YouTubeSummarizerModal
