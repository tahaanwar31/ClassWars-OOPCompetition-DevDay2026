import React, { useEffect, useRef } from 'react';

interface Blip {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  speed: number;
  angle: number;
}

interface Reticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  active: boolean;
}

export default function TacticalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let radarAngle = 0;
    const blips: Blip[] = [];
    const reticles: Reticle[] = Array(3).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      targetX: Math.random() * window.innerWidth,
      targetY: Math.random() * window.innerHeight,
      size: 40 + Math.random() * 40,
      active: true
    }));

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw a subtle hex grid
    const drawHexGrid = (width: number, height: number) => {
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.03)';
      ctx.lineWidth = 1;
      const hexSize = 30;
      const hexHeight = hexSize * Math.sqrt(3);
      const hexWidth = hexSize * 2;
      const vertDist = hexHeight;
      const horizDist = hexWidth * 0.75;

      ctx.beginPath();
      for (let y = -hexHeight; y < height + hexHeight; y += vertDist) {
        for (let x = -hexWidth; x < width + hexWidth; x += horizDist) {
          const isOffset = Math.abs(Math.round(x / horizDist)) % 2 === 1;
          const yPos = isOffset ? y + hexHeight / 2 : y;
          
          ctx.moveTo(x + hexSize * Math.cos(0), yPos + hexSize * Math.sin(0));
          for (let i = 1; i <= 6; i++) {
            ctx.lineTo(x + hexSize * Math.cos(i * Math.PI / 3), yPos + hexSize * Math.sin(i * Math.PI / 3));
          }
        }
      }
      ctx.stroke();
    };

    const drawGrid = (width: number, height: number) => {
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 100;

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw center crosshairs
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.2)';
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawRadar = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      // Radar circles
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * (i / 5), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Compass marks
      ctx.fillStyle = 'rgba(57, 255, 20, 0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', centerX, centerY - radius - 15);
      ctx.fillText('S', centerX, centerY + radius + 15);
      ctx.fillText('E', centerX + radius + 15, centerY);
      ctx.fillText('W', centerX - radius - 15, centerY);

      // Radar sweep
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(radarAngle);
      
      const gradient = ctx.createConicGradient(0, 0, 0);
      gradient.addColorStop(0, 'rgba(57, 255, 20, 0.5)');
      gradient.addColorStop(0.1, 'rgba(57, 255, 20, 0.1)');
      gradient.addColorStop(1, 'rgba(57, 255, 20, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Sweep leading edge line
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
      
      ctx.restore();
    };

    const drawBlips = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      // Randomly add new blips
      if (Math.random() < 0.05 && blips.length < 12) {
        const r = Math.random() * radius * 0.9;
        const theta = Math.random() * Math.PI * 2;
        blips.push({
          x: centerX + r * Math.cos(theta),
          y: centerY + r * Math.sin(theta),
          life: 150,
          maxLife: 150,
          speed: Math.random() * 0.5 + 0.1,
          angle: Math.random() * Math.PI * 2
        });
      }

      // Draw and update blips
      for (let i = blips.length - 1; i >= 0; i--) {
        const blip = blips[i];
        const opacity = blip.life / blip.maxLife;
        
        // Move blip
        blip.x += Math.cos(blip.angle) * blip.speed;
        blip.y += Math.sin(blip.angle) * blip.speed;
        
        ctx.fillStyle = `rgba(255, 50, 50, ${opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'red';
        
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Expanding ring
        ctx.strokeStyle = `rgba(255, 50, 50, ${opacity * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, (blip.maxLife - blip.life) * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Target ID text
        ctx.fillStyle = `rgba(255, 50, 50, ${opacity * 0.7})`;
        ctx.font = '10px monospace';
        ctx.fillText(`TGT-${Math.floor(blip.x % 1000)}`, blip.x + 10, blip.y - 10);

        ctx.shadowBlur = 0; // reset

        blip.life--;
        if (blip.life <= 0) {
          blips.splice(i, 1);
        }
      }
    };

    const drawReticles = () => {
      reticles.forEach(ret => {
        // Move towards target
        ret.x += (ret.targetX - ret.x) * 0.05;
        ret.y += (ret.targetY - ret.y) * 0.05;

        // Pick new target if close
        if (Math.abs(ret.targetX - ret.x) < 5 && Math.abs(ret.targetY - ret.y) < 5) {
          ret.targetX = Math.random() * window.innerWidth;
          ret.targetY = Math.random() * window.innerHeight;
        }

        ctx.strokeStyle = 'rgba(57, 255, 20, 0.4)';
        ctx.lineWidth = 1;
        const s = ret.size / 2;

        // Draw corners
        ctx.beginPath();
        // Top Left
        ctx.moveTo(ret.x - s, ret.y - s + 10);
        ctx.lineTo(ret.x - s, ret.y - s);
        ctx.lineTo(ret.x - s + 10, ret.y - s);
        // Top Right
        ctx.moveTo(ret.x + s - 10, ret.y - s);
        ctx.lineTo(ret.x + s, ret.y - s);
        ctx.lineTo(ret.x + s, ret.y - s + 10);
        // Bottom Left
        ctx.moveTo(ret.x - s, ret.y + s - 10);
        ctx.lineTo(ret.x - s, ret.y + s);
        ctx.lineTo(ret.x - s + 10, ret.y + s);
        // Bottom Right
        ctx.moveTo(ret.x + s - 10, ret.y + s);
        ctx.lineTo(ret.x + s, ret.y + s);
        ctx.lineTo(ret.x + s, ret.y + s - 10);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = 'rgba(57, 255, 20, 0.6)';
        ctx.beginPath();
        ctx.arc(ret.x, ret.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawDataStream = (width: number, height: number) => {
      ctx.fillStyle = 'rgba(57, 255, 20, 0.4)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      
      const time = Date.now();
      
      // Left side data
      for (let i = 0; i < 25; i++) {
        const y = (height / 25) * i;
        // Only draw some lines to make it look like scrolling data
        if ((time / 100 + i) % 30 < 15) {
          const lat = (Math.random() * 90).toFixed(4);
          const lon = (Math.random() * 180).toFixed(4);
          const alt = Math.floor(Math.random() * 40000);
          ctx.fillText(`TRK_${i.toString().padStart(2, '0')} | LAT:${lat} LON:${lon} ALT:${alt}FT`, 20, y);
        }
      }

      // Right side data
      ctx.textAlign = 'right';
      for (let i = 0; i < 25; i++) {
        const y = (height / 25) * i;
        if ((time / 150 + i) % 20 < 10) {
          const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
          const status = Math.random() > 0.8 ? 'WARN' : 'OK';
          ctx.fillStyle = status === 'WARN' ? 'rgba(255, 50, 50, 0.6)' : 'rgba(57, 255, 20, 0.4)';
          ctx.fillText(`SYS_CHK_${hash} [${status}]`, width - 20, y);
        }
      }
    };

    const render = () => {
      // Clear with dark tactical green/black
      ctx.fillStyle = '#010301';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawHexGrid(canvas.width, canvas.height);
      drawGrid(canvas.width, canvas.height);
      drawRadar(canvas.width, canvas.height);
      drawBlips(canvas.width, canvas.height);
      drawReticles();
      drawDataStream(canvas.width, canvas.height);

      radarAngle += 0.015; // Radar rotation speed
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-80"
    />
  );
}

