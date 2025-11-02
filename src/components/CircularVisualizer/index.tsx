import { useEffect, useRef } from 'react';
import type { VisualizerProps } from '@/types/audio';
import { CIRCULAR_VISUALIZER, COLORS } from '@utils/constants';
import './styles.css';

export function CircularVisualizer({ audioData, isPlaying }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);

      canvas.width = size * dpr;
      canvas.height = size * dpr;

      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      // Re-apply scale after resize (canvas.width/height reset transform)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      const centerX = size / 2;
      const centerY = size / 2;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
      ctx.fillRect(0, 0, size, size);

      if (!isPlaying) {
        // Draw idle state
        drawIdleState(ctx, centerX, centerY);
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Update rotation
      rotationRef.current += CIRCULAR_VISUALIZER.ROTATION_SPEED;

      // Get frequency data
      const frequencyData = audioData.frequencyData;
      const barCount = CIRCULAR_VISUALIZER.BAR_COUNT;
      const step = Math.floor(frequencyData.length / barCount);

      // Calculate radius
      const minRadius = size * 0.15;

      // Draw circular bars
      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * step;
        const value = frequencyData[dataIndex] / 255;

        // Calculate bar height
        const barHeight = CIRCULAR_VISUALIZER.MIN_BAR_HEIGHT + 
                         value * (CIRCULAR_VISUALIZER.MAX_BAR_HEIGHT * (size / 500));

        // Calculate angle
        const angle = (i / barCount) * Math.PI * 2 + rotationRef.current;

        // Calculate positions
        const innerX = centerX + Math.cos(angle) * minRadius;
        const innerY = centerY + Math.sin(angle) * minRadius;
        const outerX = centerX + Math.cos(angle) * (minRadius + barHeight);
        const outerY = centerY + Math.sin(angle) * (minRadius + barHeight);

        // Determine color based on position
        let color: string;
        const normalizedPos = i / barCount;
        if (normalizedPos < 0.33) {
          color = COLORS.CYAN;
        } else if (normalizedPos < 0.66) {
          color = COLORS.PINK;
        } else {
          color = COLORS.ORANGE;
        }

        // Draw bar with glow
        ctx.shadowBlur = CIRCULAR_VISUALIZER.GLOW_BLUR;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = CIRCULAR_VISUALIZER.BAR_WIDTH;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();

        // Draw outer glow point
        if (value > 0.5) {
          ctx.shadowBlur = CIRCULAR_VISUALIZER.GLOW_BLUR * 2;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(outerX, outerY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw center circle
      drawCenterCircle(ctx, centerX, centerY, minRadius * 0.8);

      // Draw waveform in center
      if (isPlaying) {
        drawCenterWaveform(ctx, centerX, centerY, minRadius * 0.6, audioData.timeDomainData);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioData, isPlaying]);

  const drawIdleState = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const size = Math.min(centerX, centerY) * 2;
    const minRadius = size * 0.15;
    const barCount = CIRCULAR_VISUALIZER.BAR_COUNT;
    const time = Date.now() * 0.001;

    rotationRef.current += CIRCULAR_VISUALIZER.ROTATION_SPEED * 0.5;

    for (let i = 0; i < barCount; i++) {
      const wave = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
      const barHeight = 10 + wave * 20;

      const angle = (i / barCount) * Math.PI * 2 + rotationRef.current;

      const innerX = centerX + Math.cos(angle) * minRadius;
      const innerY = centerY + Math.sin(angle) * minRadius;
      const outerX = centerX + Math.cos(angle) * (minRadius + barHeight);
      const outerY = centerY + Math.sin(angle) * (minRadius + barHeight);

      const normalizedPos = i / barCount;
      let color: string;
      if (normalizedPos < 0.33) {
        color = COLORS.CYAN;
      } else if (normalizedPos < 0.66) {
        color = COLORS.PINK;
      } else {
        color = COLORS.ORANGE;
      }

      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = CIRCULAR_VISUALIZER.BAR_WIDTH;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.4;

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    drawCenterCircle(ctx, centerX, centerY, minRadius * 0.8);
  };

  const drawCenterCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // Outer glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = COLORS.CYAN;
    ctx.strokeStyle = COLORS.CYAN;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = COLORS.PURPLE;

    ctx.beginPath();
    ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  const drawCenterWaveform = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    timeDomainData: Uint8Array
  ) => {
    ctx.strokeStyle = COLORS.CYAN;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.CYAN;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();

    const sliceWidth = (Math.PI * 2) / timeDomainData.length;
    let angle = 0;

    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 128.0;
      const r = radius * (0.8 + (v - 1) * 0.2);

      const pointX = x + Math.cos(angle) * r;
      const pointY = y + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }

      angle += sliceWidth;
    }

    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  return (
    <div className="circular-visualizer">
      <div className="circular-visualizer__header">
        <h3 className="circular-visualizer__title">Circular Spectrum</h3>
        <div className="circular-visualizer__badge">
          {isPlaying && (
            <span className="circular-visualizer__badge-text">
              <span className="circular-visualizer__badge-icon">●</span>
              Live Visualization
            </span>
          )}
        </div>
      </div>
      <div className="circular-visualizer__canvas-container">
        <canvas ref={canvasRef} className="circular-visualizer__canvas" />
        {!audioData && (
          <div className="circular-visualizer__placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <p>Circular visualization will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

