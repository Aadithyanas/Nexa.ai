import React, { useState, useEffect } from 'react';
import { Youtube } from "lucide-react"

function YouTubeIcon({ toggleYouTubeSummarizer }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div
      className="fixed bottom-[calc(var(--bottom-input-height)+1rem)] right-2 sm:right-4 z-30"
      onClick={toggleYouTubeSummarizer}
    >
      <div
        className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500 flex items-center justify-center
          shadow-lg shadow-red-500/50 cursor-pointer transition-all duration-300
          hover:scale-110 hover:shadow-red-500/70
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        title="YouTube Video Summarizer"
      >
        <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    </div>
  )
}

export default YouTubeIcon
