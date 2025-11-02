import { useState, useCallback } from 'react';
import { FileUploader } from '@components/FileUploader';
import { AudioPlayer } from '@components/AudioPlayer';
import { AmplitudeChart } from '@components/AmplitudeChart';
import { FrequencySpectrum } from '@components/FrequencySpectrum';
import { CircularVisualizer } from '@components/CircularVisualizer';
import { useAudioAnalyzer } from '@hooks/useAudioAnalyzer';
import './App.css';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioData = useAudioAnalyzer(audioElement);

  const handleFileSelect = useCallback((file: File) => {
    setAudioFile(file);
    setAudioBuffer(null);
    setIsPlaying(false);

    // Decode audio for amplitude chart
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        try {
          const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!AudioContextClass) return;

          const audioContext = new AudioContextClass();
          const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(decodedBuffer);
        } catch (error) {
          console.error('Error decoding audio:', error);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleAudioReady = useCallback((audio: HTMLAudioElement) => {
    setAudioElement(audio);

    // Listen to play/pause events
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="app">
      <div className="app__background">
        <div className="app__background-gradient app__background-gradient--1"></div>
        <div className="app__background-gradient app__background-gradient--2"></div>
        <div className="app__background-gradient app__background-gradient--3"></div>
      </div>

      <div className="app__container">
        <header className="app__header">
          <div className="app__logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 className="app__title">
            Audio<span className="app__title-accent">Viz</span>
          </h1>
          <p className="app__subtitle">Real-time Audio Visualization & Analysis</p>
        </header>

        <main className="app__main">
          {!audioFile ? (
            <div className="app__upload-section">
              <FileUploader onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <>
              <section className="app__section app__section--full">
                <AudioPlayer audioFile={audioFile} onAudioReady={handleAudioReady} />
              </section>

              <section className="app__section app__section--full">
                <AmplitudeChart audioBuffer={audioBuffer} />
              </section>

              <div className="app__visualizers">
                <section className="app__section">
                  <FrequencySpectrum audioData={audioData} isPlaying={isPlaying} />
                </section>

                <section className="app__section">
                  <CircularVisualizer audioData={audioData} isPlaying={isPlaying} />
                </section>
              </div>

              <div className="app__actions">
                <button
                  className="app__button app__button--secondary"
                  onClick={() => {
                    setAudioFile(null);
                    setAudioElement(null);
                    setAudioBuffer(null);
                    setIsPlaying(false);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Load New File
                </button>
              </div>
            </>
          )}
        </main>

        <footer className="app__footer">
          <p className="app__footer-text">
            Built with React, TypeScript, Wavesurfer.js & Web Audio API
          </p>
          <div className="app__footer-badges">
            <span className="app__footer-badge">Real-time FFT</span>
            <span className="app__footer-badge">Canvas</span>
            <span className="app__footer-badge">Responsive</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
