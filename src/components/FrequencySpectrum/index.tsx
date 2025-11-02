import { useEffect, useRef } from 'react';
import type { VisualizerProps } from '@/types/audio';
import { createFrequencyGradient, applyHannWindow } from '@utils/audioProcessing';
import { FREQUENCY_SPECTRUM, COLORS } from '@utils/constants';
import './styles.css';

export function FrequencySpectrum({ audioData, isPlaying }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

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
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
      ctx.fillRect(0, 0, width, height);

      if (!isPlaying) {
        // Draw idle state
        drawIdleState(ctx, width, height);
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Get frequency data
      const frequencyData = audioData.frequencyData;
      const bufferLength = frequencyData.length;

      // Apply Hann window for better frequency resolution
      const floatData = new Float32Array(frequencyData);
      const windowedData = applyHannWindow(floatData);

      // Calculate bar dimensions
      const barCount = FREQUENCY_SPECTRUM.BAR_COUNT;
      const barWidth = (width - (barCount - 1) * FREQUENCY_SPECTRUM.BAR_SPACING) / barCount;
      const step = Math.floor(bufferLength / barCount);

      // Create gradient
      const gradient = createFrequencyGradient(ctx, width, height);

      // Draw frequency bars
      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * step;
        const value = windowedData[dataIndex] / 255;

        // Calculate bar height with smoothing
        const barHeight = value * height * 0.9;

        // Calculate position
        const x = i * (barWidth + FREQUENCY_SPECTRUM.BAR_SPACING);
        const y = height - barHeight;

        // Draw bar with glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = i < barCount / 3 ? COLORS.CYAN : i < (2 * barCount) / 3 ? COLORS.PINK : COLORS.ORANGE;

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw reflection
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, height, barWidth, -barHeight * 0.3);
        ctx.globalAlpha = 1;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isPlaying]);

  const drawIdleState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const barCount = FREQUENCY_SPECTRUM.BAR_COUNT;
    const barWidth = (width - (barCount - 1) * FREQUENCY_SPECTRUM.BAR_SPACING) / barCount;
    const time = Date.now() * 0.001;

    const gradient = createFrequencyGradient(ctx, width, height);

    for (let i = 0; i < barCount; i++) {
      // Create wave effect
      const wave = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
      const barHeight = 20 + wave * 30;

      const x = i * (barWidth + FREQUENCY_SPECTRUM.BAR_SPACING);
      const y = height - barHeight;

      ctx.shadowBlur = 10;
      ctx.shadowColor = i < barCount / 3 ? COLORS.CYAN : i < (2 * barCount) / 3 ? COLORS.PINK : COLORS.ORANGE;

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.globalAlpha = 1;
    }
  };

  return (
    <div className="frequency-spectrum">
      <div className="frequency-spectrum__header">
        <h3 className="frequency-spectrum__title">Frequency Spectrum</h3>
        <div className="frequency-spectrum__status">
          <div className={`frequency-spectrum__indicator ${isPlaying ? 'frequency-spectrum__indicator--active' : ''}`} />
          <span className="frequency-spectrum__status-text">
            {isPlaying ? 'Live' : 'Idle'}
          </span>
        </div>
      </div>
      <div className="frequency-spectrum__canvas-container">
        <canvas ref={canvasRef} className="frequency-spectrum__canvas" />
        {!audioData && (
          <div className="frequency-spectrum__placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <p>Frequency spectrum will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

