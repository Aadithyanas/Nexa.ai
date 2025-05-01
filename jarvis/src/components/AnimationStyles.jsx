import React from 'react';

import { useEffect } from "react"

function AnimationStyles() {
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
      0% { transform: translateX(-20px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes floatUp {
      0% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0); }
    }
    
    @keyframes glow {
      0% { box-shadow: 0 0 5px #2563eb; }
      50% { box-shadow: 0 0 15px #38bdf8; }
      100% { box-shadow: 0 0 5px #2563eb; }
    }
    
  
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    
    @keyframes zigzagSpeak {
      0% { clip-path: polygon(0% 50%, 20% 20%, 40% 50%, 60% 20%, 80% 50%, 100% 20%); }
      50% { clip-path: polygon(0% 20%, 20% 50%, 40% 20%, 60% 50%, 80% 20%, 100% 50%); }
      100% { clip-path: polygon(0% 50%, 20% 20%, 40% 50%, 60% 20%, 80% 50%, 100% 20%); }
    }
    
    @keyframes thinking {
      0% { transform: scale(1); }
      25% { transform: scale(1.1); }
      50% { transform: scale(1); }
      75% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-10px) rotate(-2deg); }
      50% { transform: translateY(0) rotate(0deg); }
      75% { transform: translateY(10px) rotate(2deg); }
    }
    
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    
    @keyframes particleFloat {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
    
    @keyframes listening {
      0% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 0.7; }
    }
    
    @keyframes wakeUp {
      0% { transform: perspective(1000px) translateZ(-200px) scale(0.8); opacity: 0.3; }
      50% { transform: perspective(1000px) translateZ(50px) scale(1.1); opacity: 0.8; }
      100% { transform: perspective(1000px) translateZ(0) scale(1); opacity: 1; }
    }
    
    @keyframes goToSleep {
      0% { transform: perspective(1000px) translateZ(0) scale(1); opacity: 1; }
      100% { transform: perspective(1000px) translateZ(-200px) scale(0.8); opacity: 0.3; }
    }
    
    @keyframes eyeMovement {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }

    @keyframes gridHeartbeat {
      0% { opacity: 0.1; filter: blur(0px); }
      50% { opacity: 0.3; filter: blur(1px); }
      100% { opacity: 0.1; filter: blur(0px); }
    }

  
    
 
    
    .ai-particle {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      
      filter: blur(1px);
      background: #232323 !important;
      border: 1.5px solid #2563eb !important;
    }
    
    .status-dot {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      width: 0.75rem;
      height: 0.75rem;
      background-color: #38bdf8;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .message-bubble-user {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      background: #181818;
      color: #e0e0e0;
      animation: fadeIn 0.3s ease-out;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      transform-origin: bottom right;
      border: 1px solid #2563eb;
      backdrop-filter: blur(4px);
    }
    
    .message-bubble-ai {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      background: #232323;
      color: #e0e0e0;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transform-origin: bottom left;
      border: 1px solid #2563eb;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(4px);
    }
    
    .message-bubble-ai::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #2563eb, transparent);
      animation: scanline 2s linear infinite;
      opacity: 0.5;
    }
    
    .message-bubble-system {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      background: #181818;
      color: #b0b0b0;
      animation: fadeIn 0.3s ease-out;
      box-shadow: 0 2px 8px rgba(0,0,0,0.10);
      margin: 0 auto;
      font-style: italic;
      opacity: 0.8;
      border: 1px solid #2563eb;
      backdrop-filter: blur(4px);
    }
    
    .header-container {
      animation: fadeIn 0.5s ease-out;
      background: #131313 !important;
      color: #e0e0e0 !important;
      border-bottom: 1.5px solid #2563eb !important;
    }
    
    .app-title {
      animation: floatUp 3s ease-in-out infinite;
      color: #e0e0e0 !important;
    }
    
    .control-button:hover {
      transform: scale(1.1);
      transition: transform 0.2s ease;
      background: #232323 !important;
      border: 1.5px solid #2563eb !important;
      color: #e0e0e0 !important;
    }
    
    .processing-indicator {
      animation: pulse 1.5s infinite;
      color: #2563eb !important;
    }
    
    .input-container {
      animation: glow 3s infinite;
      background: #181818 !important;
      border: 1.5px solid #2563eb !important;
      color: #e0e0e0 !important;
    }
    
   
    
   
    

   
 
  
    
 
    

    
  
    
.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: #131313 !important;  /* Dark background */
}

    
   
 
  `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return null
}

export default AnimationStyles
