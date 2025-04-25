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
      0% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.5); }
      50% { box-shadow: 0 0 15px rgba(14, 165, 233, 0.8); }
      100% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.5); }
    }
    
    @keyframes rotate3d {
      0% { transform: perspective(1000px) rotateY(0deg); }
      100% { transform: perspective(1000px) rotateY(360deg); }
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
    
    @keyframes youtubeIconJump {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes youtubeIconGlow {
      0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.7)); }
      50% { filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.9)); }
    }
    
    .youtube-icon-container {
      animation: youtubeIconJump 2s ease-in-out infinite, youtubeIconGlow 3s ease-in-out infinite;
      transition: transform 0.3s ease;
    }
    
    .youtube-icon-container:hover {
      transform: scale(1.2);
    }
    
    .ai-particle {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      
      filter: blur(1px);
    }
    
    .status-dot {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      width: 0.75rem;
      height: 0.75rem;
      background-color: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .message-bubble-user {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      animation: fadeIn 0.3s ease-out;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(14, 165, 233, 0.3);
      transform-origin: bottom right;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .message-bubble-ai {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #374151, #1f2937);
      color: white;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(14, 165, 233, 0.3);
      transform-origin: bottom left;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .message-bubble-ai::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #38bdf8, transparent);
      animation: scanline 2s linear infinite;
      opacity: 0.5;
    }
    
    .message-bubble-system {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #4b5563, #6b7280);
      color: white;
      animation: fadeIn 0.3s ease-out;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      font-style: italic;
      opacity: 0.8;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .header-container {
      animation: fadeIn 0.5s ease-out;
    }
    
    .app-title {
      animation: floatUp 3s ease-in-out infinite;
    }
    
    .control-button:hover {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
    
    .processing-indicator {
      animation: pulse 1.5s infinite;
    }
    
    .input-container {
      animation: glow 3s infinite;
    }
    
    .robot-container {
      animation: float 6s ease-in-out infinite;
      transform-style: preserve-3d;
      perspective: 1000px;
    }
    
    .robot-eye {
      animation: blink 3s infinite;
    }
    
    .robot-mouth.speaking {
      animation: zigzagSpeak 0.3s infinite;
      height: 15px !important;
    }
    
    .robot-brain.thinking {
      animation: thinking 1s infinite;
    }
    
    .robot-face.happy .robot-mouth {
      border-radius: 0 0 100px 100px;
    }
    
    .robot-face.thinking .robot-eye::after {
      content: '?';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: bold;
      color: #38bdf8;
    }
    
    .robot-face.listening .robot-ear {
      animation: listening 1s infinite;
    }
    
    .robot-face.waking-up {
      animation: wakeUp 1s forwards;
      transform-origin: center center;
    }
    
    .robot-face.going-to-sleep {
      animation: goToSleep 1s forwards;
      transform-origin: center center;
    }
    
    .robot-eye.active {
      animation: eyeMovement 3s infinite;
    }
    
    .background-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    
    .youtube-summarizer-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .youtube-summarizer-container {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 0, 0, 0.4);
      border: 1px solid rgba(255, 0, 0, 0.3);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
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
