import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import type { FileUploaderProps } from '@/types/audio';
import { isValidAudioFile } from '@utils/audioProcessing';
import './styles.css';

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!isValidAudioFile(file)) {
      setError('Invalid audio file. Supported formats: MP3, AAC, FLAC, WAV, M4A, OGG, OPUS');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File too large. Maximum size is 100MB');
      return;
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-uploader">
      <div
        className={`file-uploader__dropzone ${isDragging ? 'file-uploader__dropzone--dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="file-uploader__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div className="file-uploader__text">
          <p className="file-uploader__title">
            {isDragging ? 'Drop your audio file here' : 'Drag & drop your audio file'}
          </p>
          <p className="file-uploader__subtitle">or click to browse</p>
          <p className="file-uploader__formats">
            MP3, AAC, FLAC, WAV, M4A, OGG, OPUS
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.aac,.flac,.wav,.m4a,.ogg,.opus,.webm"
          onChange={handleFileInput}
          className="file-uploader__input"
        />
      </div>
      {error && (
        <div className="file-uploader__error">
          {error}
        </div>
      )}
    </div>
  );
}

