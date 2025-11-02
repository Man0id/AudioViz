import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import type { AudioPlayerProps } from '@/types/audio';
import { formatTime } from '@utils/audioProcessing';
import { COLORS } from '@utils/constants';
import './styles.css';

export function AudioPlayer({ audioFile, onAudioReady }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !audioFile) return;

    setIsLoading(true);

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: COLORS.CYAN,
      progressColor: COLORS.ORANGE,
      cursorColor: COLORS.PURPLE,
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 80,
      barGap: 1,
      normalize: true,
    });

    wavesurferRef.current = wavesurfer;

    // Load audio file
    const url = URL.createObjectURL(audioFile);
    wavesurfer.load(url);

    // Event listeners
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
      
      // Get audio element and pass to parent
      const audioElement = wavesurfer.getMediaElement();
      if (audioElement) {
        onAudioReady(audioElement);
      }
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    
    wavesurfer.on('timeupdate', (time: number) => {
      setCurrentTime(time);
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      // Safely destroy wavesurfer
      try {
        wavesurfer.destroy();
      } catch (error) {
        // Ignore abort errors during cleanup in development mode
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error destroying wavesurfer:', error);
        }
      }
      URL.revokeObjectURL(url);
    };
  }, [audioFile, onAudioReady]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleStop = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSkipBackward = () => {
    if (wavesurferRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      wavesurferRef.current.setTime(newTime);
    }
  };

  const handleSkipForward = () => {
    if (wavesurferRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      wavesurferRef.current.setTime(newTime);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.code === 'Space' &&
        event.target instanceof HTMLElement &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      ) {
        event.preventDefault();
        
        // Прямой вызов через ref - без замыканий!
        if (wavesurferRef.current && !isLoading) {
          wavesurferRef.current.playPause();
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoading]);

  return (
    <div className="audio-player">
      <div className="audio-player__waveform-container">
        {isLoading && (
          <div className="audio-player__loading">
            <div className="audio-player__spinner"></div>
            <p>Loading audio...</p>
          </div>
        )}
        <div ref={containerRef} className="audio-player__waveform" />
      </div>

      <div className="audio-player__controls">
        <div className="audio-player__buttons">
          <button
            className="audio-player__button audio-player__button--secondary"
            onClick={handleSkipBackward}
            disabled={!wavesurferRef.current || isLoading}
            aria-label="Skip backward 10 seconds"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 19l-7-7 7-7" />
              <path d="M17 19l-7-7 7-7" />
            </svg>
            <span className="audio-player__button-label">-10s</span>
          </button>

          <button
            className="audio-player__button audio-player__button--primary"
            onClick={handlePlayPause}
            disabled={!wavesurferRef.current || isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            className="audio-player__button audio-player__button--secondary"
            onClick={handleStop}
            disabled={!wavesurferRef.current || isLoading}
            aria-label="Stop"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>

          <button
            className="audio-player__button audio-player__button--secondary"
            onClick={handleSkipForward}
            disabled={!wavesurferRef.current || isLoading}
            aria-label="Skip forward 10 seconds"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 5l7 7-7 7" />
              <path d="M7 5l7 7-7 7" />
            </svg>
            <span className="audio-player__button-label">+10s</span>
          </button>
        </div>

        <div className="audio-player__time">
          <span>{formatTime(currentTime)}</span>
          <span className="audio-player__time-separator">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

