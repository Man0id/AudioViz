// Audio Analysis Constants
export const FFT_SIZE = 1024;
export const SMOOTHING_TIME_CONSTANT = 0.8;

// Decibel Range
export const DB_MIN = -90;
export const DB_MAX = 3;

// Color Palette - Dark Glassmorphism with Neon Accents
export const COLORS = {
  // Neon Accents
  CYAN: '#00f3ff',
  ORANGE: '#ff6b00',
  PURPLE: '#b026ff',
  PINK: '#ff1493',
  
  // Dark Theme
  BACKGROUND: '#0a0e27',
  SURFACE: 'rgba(255, 255, 255, 0.05)',
  SURFACE_HOVER: 'rgba(255, 255, 255, 0.08)',
  
  // Text
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
  TEXT_DISABLED: 'rgba(255, 255, 255, 0.4)',
  
  // Borders
  BORDER: 'rgba(255, 255, 255, 0.1)',
  BORDER_FOCUS: 'rgba(0, 243, 255, 0.5)',
} as const;

// Supported Audio Formats
export const SUPPORTED_FORMATS = [
  'audio/mpeg',      // mp3
  'audio/aac',       // aac
  'audio/flac',      // flac
  'audio/wav',       // wav
  'audio/x-m4a',     // m4a
  'audio/ogg',       // ogg
  'audio/opus',      // opus
  'audio/webm',      // webm
] as const;

export const SUPPORTED_EXTENSIONS = [
  '.mp3',
  '.aac',
  '.flac',
  '.wav',
  '.m4a',
  '.ogg',
  '.opus',
  '.webm',
] as const;

// Animation Constants
export const ANIMATION_FPS = 60;
export const ANIMATION_FRAME_TIME = 1000 / ANIMATION_FPS;

// Visualizer Constants
export const CIRCULAR_VISUALIZER = {
  BAR_COUNT: 128,
  MIN_BAR_HEIGHT: 5,
  MAX_BAR_HEIGHT: 150,
  BAR_WIDTH: 4,
  ROTATION_SPEED: 0.001,
  GLOW_BLUR: 20,
} as const;

export const FREQUENCY_SPECTRUM = {
  BAR_COUNT: 64,
  BAR_SPACING: 2,
  MIN_DECIBELS: -90,
  MAX_DECIBELS: -10,
} as const;

