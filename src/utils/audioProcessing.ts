import type { AmplitudePoint } from '@/types/audio';
import { DB_MIN } from './constants';

/**
 * Calculate amplitude points from audio buffer
 * Converts raw audio samples to decibel values
 */
export function calculateAmplitude(audioBuffer: AudioBuffer): AmplitudePoint[] {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Sample every ~500ms for reasonable data points
  const samplesPerPoint = Math.floor(sampleRate * 0.5);
  const points: AmplitudePoint[] = [];

  for (let i = 0; i < channelData.length; i += samplesPerPoint) {
    const endIndex = Math.min(i + samplesPerPoint, channelData.length);
    const slice = channelData.slice(i, endIndex);

    // Calculate RMS (Root Mean Square) amplitude
    const rms = Math.sqrt(
      slice.reduce((sum, sample) => sum + sample * sample, 0) / slice.length
    );

    // Convert to decibels: 20 * log10(amplitude)
    // Add small value to avoid log(0)
    const decibels = 20 * Math.log10(Math.max(rms, 1e-10));

    points.push({
      time: (i / sampleRate),
      amplitude: rms,
      decibels: Math.max(decibels, DB_MIN),
    });
  }
  
  return points;
}

/**
 * Apply Hann window function to reduce spectral leakage
 * Used for better frequency analysis
 */
export function applyHannWindow(data: Float32Array): Float32Array {
  const windowedData = new Float32Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    // Hann window formula: 0.5 * (1 - cos(2π * n / (N - 1)))
    const multiplier = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (data.length - 1)));
    windowedData[i] = data[i] * multiplier;
  }
  
  return windowedData;
}

/**
 * Normalize frequency data to 0-1 range
 */
export function normalizeFrequencyData(data: Uint8Array): number[] {
  const normalized: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    normalized.push(data[i] / 255);
  }
  
  return normalized;
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate audio file format
 */
export function isValidAudioFile(file: File): boolean {
  const validTypes = [
    'audio/mpeg',
    'audio/aac',
    'audio/flac',
    'audio/wav',
    'audio/x-m4a',
    'audio/mp4',
    'audio/ogg',
    'audio/opus',
    'audio/webm',
  ];
  
  const validExtensions = ['.mp3', '.aac', '.flac', '.wav', '.m4a', '.ogg', '.opus', '.webm'];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  return hasValidType || hasValidExtension;
}

/**
 * Create gradient for frequency visualization
 */
export function createFrequencyGradient(
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  
  // Cyan to Orange gradient
  gradient.addColorStop(0, '#00f3ff');    // Cyan
  gradient.addColorStop(0.5, '#ff1493');  // Pink (middle)
  gradient.addColorStop(1, '#ff6b00');    // Orange
  
  return gradient;
}

