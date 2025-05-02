import React, { useState } from 'react';

function Header() {
  const [isListening, setIsListening] = useState(false);

  const handleMicClick = () => {
    setIsListening(true);
    // Start speech recognition here
  };

  const handleSpeechEnd = () => {
    setIsListening(false);
    // Stop speech recognition here
  };

  return (
    <div className=" flex flex-row gap-2 items-center bg-transparent justify-center px-4 py-5" >
      {/* Nexa Logo (simple SVG robot icon) */}
      <div className="mb-2">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          {/* Head shape */}
          <ellipse cx="24" cy="28" rx="14" ry="12" fill="#181818" stroke="#2563eb" strokeWidth="2" />
          {/* Ears */}
          <polygon points="10,20 6,8 16,16" fill="#181818" stroke="#2563eb" strokeWidth="2" />
          <polygon points="38,20 42,8 32,16" fill="#181818" stroke="#2563eb" strokeWidth="2" />
          {/* Eyes */}
          <ellipse cx="18" cy="28" rx="2.2" ry="2.8" fill="#38bdf8" />
          <ellipse cx="30" cy="28" rx="2.2" ry="2.8" fill="#38bdf8" />
          {/* Nose */}
          <ellipse cx="24" cy="34" rx="1.5" ry="1" fill="#2563eb" />
          {/* Mouth */}
          <path d="M22 36 Q24 38 26 36" stroke="#2563eb" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <span className="text-2xl font-bold" style={{ color: 'black' }}>Nexa</span>
      <span className="text-base font-medium mt-1 text-gray-200 hidden sm:block">
        Hi, I'm Nexa – Your Assistant
      </span>

    </div>
  );
}

export default Header;