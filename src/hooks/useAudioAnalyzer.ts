import { useEffect, useRef, useState } from 'react';
import type { AudioData } from '@/types/audio';
import { FFT_SIZE, SMOOTHING_TIME_CONSTANT } from '@utils/constants';

/**
 * Custom hook for Web Audio API analysis
 * Provides real-time frequency and time domain data
 */
export function useAudioAnalyzer(
  audioElement: HTMLAudioElement | null
): AudioData | null {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    // Initialize Audio Context and Analyser
    const initAudioContext = async () => {
      try {
        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
          console.error('Web Audio API is not supported');
          return;
        }

        audioContextRef.current = new AudioContextClass();
        const analyser = audioContextRef.current.createAnalyser();
        
        // Configure analyser
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        
        analyserRef.current = analyser;

        // Create source node only once
        if (!isConnectedRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyser);
          analyser.connect(audioContextRef.current.destination);
          isConnectedRef.current = true;
        }

        // Initialize data arrays
        const frequencyData = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        const timeDomainData = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;

        setAudioData({
          frequencyData,
          timeDomainData,
          sampleRate: audioContextRef.current.sampleRate,
          duration: audioElement.duration || 0,
        });
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    initAudioContext();

    return () => {
      // Don't disconnect source node to avoid errors
      // Just cleanup the audio context if needed
    };
  }, [audioElement]);

  // Update frequency and time domain data
  useEffect(() => {
    if (!analyserRef.current || !audioData) {
      return;
    }

    const updateAudioData = () => {
      if (analyserRef.current && audioData) {
        analyserRef.current.getByteFrequencyData(audioData.frequencyData);
        analyserRef.current.getByteTimeDomainData(audioData.timeDomainData);
      }
    };

    // Update on animation frame for real-time data
    let animationFrameId: number;
    const animate = () => {
      updateAudioData();
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [audioData]);

  return audioData;
}

