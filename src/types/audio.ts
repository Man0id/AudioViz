export interface AudioData {
  frequencyData: Uint8Array<ArrayBuffer>;
  timeDomainData: Uint8Array<ArrayBuffer>;
  sampleRate: number;
  duration: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface AmplitudePoint {
  time: number;
  amplitude: number;
  decibels: number;
}

export interface VisualizerProps {
  audioData: AudioData | null;
  isPlaying: boolean;
}

export interface AudioPlayerProps {
  audioFile: File | null;
  onAudioReady: (audio: HTMLAudioElement) => void;
}

export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export interface AmplitudeChartProps {
  audioBuffer: AudioBuffer | null;
}

