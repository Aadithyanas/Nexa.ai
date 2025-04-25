import React, { useRef, useEffect } from "react";

function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function drawGrid() {
      ctx.clearRect(0, 0, width, height);
      
      // Deep blue background
      ctx.fillStyle = '#0a1a2f';
      ctx.fillRect(0, 0, width, height);

      // Grid settings
      const gridSize = 60;
      const gridColor = 'rgba(94, 155, 255, 0.05)';
      const majorLineColor = 'rgba(94, 155, 255, 0.1)';
      const majorLineFrequency = 4;

      // Draw grid lines
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        const isMajor = x % (gridSize * majorLineFrequency) === 0;
        ctx.strokeStyle = isMajor ? majorLineColor : gridColor;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        const isMajor = y % (gridSize * majorLineFrequency) === 0;
        ctx.strokeStyle = isMajor ? majorLineColor : gridColor;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Blue vignette effect
      const vignetteGradient = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.4,
        width / 2, height / 2, height * 0.8
      );
      vignetteGradient.addColorStop(0, 'rgba(10, 26, 47, 0)');
      vignetteGradient.addColorStop(1, 'rgba(10, 26, 47, 0.8)');
      
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, width, height);
    }

    drawGrid();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      drawGrid();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas 
    ref={canvasRef} 
    className="background-canvas" 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0,
      pointerEvents: 'none'
    }}
  />;
}

export default BackgroundCanvas;