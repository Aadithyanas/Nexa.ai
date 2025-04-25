import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileIcon({ toogleFileSummary }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  // Define animations in a style block
  const floatKeyframes = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `;

  const glowKeyframes = `
    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
      50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
      100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    }
  `;

  const pulseKeyframes = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;

  const buttonStyle = {
    position: 'absolute',
    bottom:'6rem',
    right: "2rem",
    width: "60px",
    height: "60px",
    padding: '1rem',
    borderRadius: '9999px',
    backgroundColor: '#2563eb',
    color: 'white',
    transition: 'all 300ms',
    animation: 'float 3s ease-in-out infinite, glow 3s ease-in-out infinite',
    transform: isAnimating ? 'translateY(0.25rem)' : '',
    cursor: 'pointer',
    border: 'none',
  };

  const buttonHoverStyle = {
    backgroundColor: '#1d4ed8',
    transform: 'scale(1.1)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  const iconStyle = {
    animation: 'pulse 2s infinite ease-in-out',
    width: '20px',
    height: '20px',
  };

  return (
    <>
      <style>
        {floatKeyframes}
        {glowKeyframes}
        {pulseKeyframes}
      </style>
      <button 
        onClick={toogleFileSummary}
        style={buttonStyle}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, buttonHoverStyle);
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
          e.currentTarget.style.transform = isAnimating ? 'translateY(0.25rem)' : '';
          e.currentTarget.style.boxShadow = '';
        }}
        aria-label="Open File Summarizer"
      >
        <UploadCloud style={iconStyle} />
      </button>
    </>
  );
}