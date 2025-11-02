import { useEffect, useRef, useState, useMemo } from 'react';
import type { AmplitudeChartProps } from '@/types/audio';
import { calculateAmplitude } from '@utils/audioProcessing';
import { COLORS, DB_MIN, DB_MAX } from '@utils/constants';
import './styles.css';

export function AmplitudeChart({ audioBuffer }: AmplitudeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; time: string; db: string } | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isOffscreenReady, setIsOffscreenReady] = useState(false);
  const tooltipTimeoutRef = useRef<number | undefined>(undefined);

  // Memoize amplitude data calculation - only recalculate when audioBuffer changes
  const amplitudeData = useMemo(() => {
    if (!audioBuffer) return [];
    return calculateAmplitude(audioBuffer);
  }, [audioBuffer]);

  // Draw the amplitude chart ONCE when audioBuffer changes
  useEffect(() => {
    if (!audioBuffer || amplitudeData.length === 0) {
      setIsOffscreenReady(false);
      return;
    }

    // Create offscreen canvas for caching
    const offscreen = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    
    // Fixed size for offscreen canvas (high resolution)
    const width = 2000;
    const height = 600;
    
    offscreen.width = width * dpr;
    offscreen.height = height * dpr;
    
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);

    // Draw the chart once
    const draw = () => {

      // Padding for axes (increased for larger fonts on offscreen canvas)
      const paddingLeft = 100;
      const paddingRight = 30;
      const paddingTop = 60;
      const paddingBottom = 80;

      const chartWidth = width - paddingLeft - paddingRight;
      const chartHeight = height - paddingTop - paddingBottom;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 14, 39, 0.5)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Horizontal grid lines (dB scale)
      const dbRange = DB_MAX - DB_MIN;
      const dbStep = 20;
      for (let db = DB_MIN; db <= DB_MAX; db += dbStep) {
        const y = paddingTop + chartHeight - ((db - DB_MIN) / dbRange) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(paddingLeft + chartWidth, y);
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = COLORS.TEXT_SECONDARY;
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${db} dB`, paddingLeft - 15, y);
      }

      // Vertical grid lines (time)
      const duration = audioBuffer.duration;
      const timeStep = duration > 60 ? 10 : duration > 30 ? 5 : 2;
      for (let time = 0; time <= duration; time += timeStep) {
        const x = paddingLeft + (time / duration) * chartWidth;
        
        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, paddingTop + chartHeight);
        ctx.stroke();

        // X-axis labels
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        const timeLabel = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
        
        ctx.fillStyle = COLORS.TEXT_SECONDARY;
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(timeLabel, x, paddingTop + chartHeight + 15);
      }

      // Draw axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, paddingTop);
      ctx.lineTo(paddingLeft, paddingTop + chartHeight);
      ctx.lineTo(paddingLeft + chartWidth, paddingTop + chartHeight);
      ctx.stroke();

      // Draw amplitude line with gradient fill using smooth curves
      ctx.beginPath();
      ctx.moveTo(paddingLeft, paddingTop + chartHeight);

      // Convert points to coordinates
      const coords = amplitudeData.map(point => ({
        x: paddingLeft + (point.time / duration) * chartWidth,
        y: paddingTop + chartHeight - ((point.decibels - DB_MIN) / dbRange) * chartHeight,
      }));

      // Draw smooth curve to first point
      if (coords.length > 0) {
        ctx.lineTo(coords[0].x, coords[0].y);
      }

      // Draw smooth Catmull-Rom spline through points
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[Math.max(0, i - 1)];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[Math.min(coords.length - 1, i + 2)];

        // Catmull-Rom to Bezier conversion
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      // Close path for fill
      const lastCoord = coords[coords.length - 1];
      if (lastCoord) {
        ctx.lineTo(lastCoord.x, paddingTop + chartHeight);
      }
      ctx.closePath();

      // Fill with gradient
      const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
      gradient.addColorStop(0, 'rgba(0, 243, 255, 0.6)');
      gradient.addColorStop(0.5, 'rgba(176, 38, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0.2)');
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw smooth line on top
      ctx.beginPath();
      if (coords.length > 0) {
        ctx.moveTo(coords[0].x, coords[0].y);
      }

      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[Math.max(0, i - 1)];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[Math.min(coords.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      ctx.strokeStyle = COLORS.CYAN;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.CYAN;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw axis labels
      ctx.fillStyle = COLORS.TEXT_SECONDARY;
      ctx.font = '600 28px system-ui, -apple-system, sans-serif';
      
      // Y-axis label
      ctx.save();
      ctx.translate(30, paddingTop + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Amplitude (dB)', 0, 0);
      ctx.restore();

      // X-axis label
      ctx.textAlign = 'center';
      ctx.fillText('Time (seconds)', paddingLeft + chartWidth / 2, height - 25);
    };

    draw();
    offscreenCanvasRef.current = offscreen;
    setIsOffscreenReady(true);
  }, [audioBuffer, amplitudeData]);

  // Separate effect for rendering cached canvas to visible canvas on resize
  useEffect(() => {
    if (!isOffscreenReady) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const offscreen = offscreenCanvasRef.current;
    
    if (!canvas || !container || !offscreen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderCached = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);
      
      // Simply draw the cached offscreen canvas
      ctx.drawImage(offscreen, 0, 0, rect.width, rect.height);
    };

    renderCached();
    window.addEventListener('resize', renderCached);

    return () => {
      window.removeEventListener('resize', renderCached);
    };
  }, [isOffscreenReady]);

  // Separate effect for tooltip handling - doesn't trigger redraws
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || amplitudeData.length === 0) return;

    // Throttled mouse move handler for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipTimeoutRef.current) {
        return;
      }

      tooltipTimeoutRef.current = window.setTimeout(() => {
        tooltipTimeoutRef.current = undefined;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Use same padding as chart (scaled to visible canvas)
        const scale = rect.width / 2000; // offscreen width = 2000
        const paddingLeft = 100 * scale;
        const paddingRight = 30 * scale;
        const paddingTop = 60 * scale;
        const paddingBottom = 80 * scale;

        const chartWidth = rect.width - paddingLeft - paddingRight;
        const chartHeight = rect.height - paddingTop - paddingBottom;

        if (
          x >= paddingLeft &&
          x <= paddingLeft + chartWidth &&
          y >= paddingTop &&
          y <= paddingTop + chartHeight
        ) {
          const duration = audioBuffer.duration;
          const time = ((x - paddingLeft) / chartWidth) * duration;
          
          // Find closest data point
          let closestPoint = amplitudeData[0];
          let minDiff = Math.abs(closestPoint.time - time);
          
          for (const point of amplitudeData) {
            const diff = Math.abs(point.time - time);
            if (diff < minDiff) {
              minDiff = diff;
              closestPoint = point;
            }
          }

          const mins = Math.floor(closestPoint.time / 60);
          const secs = Math.floor(closestPoint.time % 60);
          const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

          setTooltip({
            x: e.clientX,
            y: e.clientY,
            time: timeLabel,
            db: closestPoint.decibels.toFixed(2),
          });
        } else {
          setTooltip(null);
        }
      }, 50);
    };

    const handleMouseLeave = () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = undefined;
      }
      setTooltip(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [audioBuffer, amplitudeData]);

  if (!audioBuffer) {
    return (
      <div className="amplitude-chart amplitude-chart--empty">
        <div className="amplitude-chart__placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <p>Amplitude chart will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="amplitude-chart">
      <div className="amplitude-chart__header">
        <h3 className="amplitude-chart__title">Amplitude Analysis</h3>
        <div className="amplitude-chart__range">
          <span className="amplitude-chart__range-label">Range:</span>
          <span className="amplitude-chart__range-value">{DB_MIN} dB to +{DB_MAX} dB</span>
        </div>
      </div>
      <div className="amplitude-chart__canvas-container" ref={containerRef}>
        <canvas ref={canvasRef} className="amplitude-chart__canvas" />
        {tooltip && (
          <div
            className="amplitude-chart__tooltip"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 60}px`,
            }}
          >
            <div className="amplitude-chart__tooltip-time">Time: {tooltip.time}</div>
            <div className="amplitude-chart__tooltip-value">Amplitude: {tooltip.db} dB</div>
          </div>
        )}
      </div>
    </div>
  );
}

