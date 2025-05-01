import React, { useRef, useEffect } from "react";

function BackgroundCanvas() {
  const canvasRef = useRef(null);

  
  return (
    <canvas
      ref={canvasRef}
      
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',  // Prevents canvas from blocking interactions
      }}
    />
  );
}

export default BackgroundCanvas;