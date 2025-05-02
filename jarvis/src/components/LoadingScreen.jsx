import React, { useEffect, useState } from 'react';

function LoadingScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#131313',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Nexa Logo (robot dog face) - very transparent */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(24,24,24,0.15)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.08), 0 0 15px #2563eb22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          animation: 'pulse 2s infinite',
          border: '2px solid rgba(37,99,235,0.18)',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 48 48" fill="none" style={{opacity: 0.18}}>
          <ellipse cx="24" cy="28" rx="14" ry="12" fill="#181818" fillOpacity="0.18" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.18"/>
          <polygon points="10,20 6,8 16,16" fill="#181818" fillOpacity="0.18" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.18"/>
          <polygon points="38,20 42,8 32,16" fill="#181818" fillOpacity="0.18" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.18"/>
          <ellipse cx="18" cy="28" rx="2.2" ry="2.8" fill="#38bdf8" fillOpacity="0.18" />
          <ellipse cx="30" cy="28" rx="2.2" ry="2.8" fill="#38bdf8" fillOpacity="0.18" />
          <ellipse cx="24" cy="34" rx="1.5" ry="1" fill="#2563eb" fillOpacity="0.18" />
          <path d="M22 36 Q24 38 26 36" stroke="#2563eb" strokeWidth="1.5" fill="none" strokeOpacity="0.18"/>
        </svg>
      </div>
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: '1.5rem',
        }}
      >
        Nexa
      </h1>
      <div
        style={{
          width: '300px',
          height: '6px',
          background: '#232323',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${loadingProgress}%`,
            background: 'linear-gradient(to right, #2563eb, #38bdf8)',
            borderRadius: '3px',
            transition: 'width 0.2s ease',
          }}
        ></div>
      </div>
      <p
        style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
        }}
      >
        {loadingProgress < 100 ? 'Initializing systems...' : 'Ready to assist you'}
      </p>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;