# 🎵 AudioViz - Real-Time Audio Visualization Platform

<div align="center">

  <h3>🎨 SEE YOUR MUSIC | FEEL THE FREQUENCIES | EXPERIENCE THE SOUND 🎨</h3>

  <p><i>Created for music lovers who want to truly see what they hear</i></p>

</div>

## ⚡ What This Visualizer Can Do

### 🎵 Three Unique Real-Time Visualizations

- **Amplitude Chart**: See the loudness dynamics of your track from -130 to +6 dB
  - Smooth curves flowing through time
  - Detailed 500ms sampling for precision
  - Interactive tooltip shows exact amplitude at any moment
  - One-time render with zero performance impact - works flawlessly even with hours-long tracks

- **Frequency Spectrum**: Watch the frequencies dance in real-time
  - Cyan-to-orange gradient that moves with the music
  - Hann window smoothing for professional-grade visualization
  - 60 FPS buttery smooth animation
  - See exactly which frequencies are playing at any moment

- **Circular Visualizer**: A mesmerizing 360° spectrum experience
  - Rotating circular bars that pulse with the beat
  - Neon glow effects that react to bass and treble
  - Hypnotic idle state when music is paused
  - The most unique way to visualize your audio

### 🎧 Professional Audio Player

- **Smart Waveform Display**: See your entire track at a glance with Wavesurfer.js
  - Click anywhere to jump to that moment
  - Visual representation of your audio's structure
  - Smooth scrolling and zooming

- **Full Playback Control**:
  - Play/Pause with a click or **Spacebar**
  - Stop button to reset to the beginning
  - Skip ±10 seconds forward/backward
  - Precise seeking by clicking the waveform
  - Current time and duration display

### 📁 Effortless File Upload

- **Drag & Drop**: Just drop your audio file anywhere on the upload zone
- **Universal Format Support**: MP3, AAC, FLAC, WAV, M4A, OGG, OPUS - it handles them all
- **Instant Analysis**: File loads and starts analyzing immediately
- **No Backend Required**: Everything happens in your browser

### 🎨 Stunning Dark Glassmorphism UI

- **Modern Design**: Dark theme with neon accents (Cyan, Orange, Purple, Pink)
- **Glass Effects**: Translucent panels with blur effects
- **Smooth Animations**: Every interaction feels premium
- **Responsive Layout**: Works flawlessly on desktop, tablet, and mobile
- **Neon Accents**: Glowing elements that make visualizations pop

### ⚡ Blazing Fast Performance

- **60 FPS Everywhere**: Smooth animations on all devices
- **Zero Lag**: Even with multi-hour audio files
- **Offscreen Canvas Caching**: Amplitude chart renders once, displays instantly
- **Optimized Rendering**: Web Audio API + Canvas for maximum performance
- **Smart Throttling**: Tooltip and resize events don't slow you down

### ⌨️ Keyboard Shortcuts

- **Spacebar**: Play/Pause audio (works everywhere except input fields)
- More shortcuts coming soon!

## 🎯 Why AudioViz?

### For Music Enthusiasts
Simply enjoy watching your favorite tracks come alive. Discover patterns you never noticed before and experience music in a whole new dimension.

### For Presenters & Streamers
Add stunning visual flair to your streams and presentations. Real-time visualizations that react to any audio source.

## 🎨 The Technical Magic (Without the Boring Details)

- Built with React 19 + TypeScript 5.9 + Vite 7 (Rolldown)
- Web Audio API for real-time frequency analysis
- Canvas-based rendering for maximum performance
- Offscreen canvas caching for zero-cost redraws
- Device Pixel Ratio optimization for crystal-clear visuals on any screen

## 🚀 Three Visualizations, One Goal

Each visualization tells a different story about your audio:

1. **Amplitude Chart** = The Story of Dynamics
   - Shows how loud your track gets over time
   - Perfect for seeing crescendos, drops, and quiet moments
   - Understand the emotional flow of your music

2. **Frequency Spectrum** = The Story of Tone
   - Shows which frequencies are playing right now
   - Watch bass, mids, and treble in real-time
   - See how instruments and vocals occupy different frequency ranges

3. **Circular Visualizer** = The Story of Energy
   - A 360° view of the entire frequency spectrum
   - Hypnotic rotation that follows the music's rhythm
   - The most visually stunning way to experience sound

## 💡 Quick Start

1. Open AudioViz in your browser
2. Drag and drop any audio file (or click to browse)
3. Hit Play (or press Spacebar)
4. Watch your music come alive!

> No installation, no setup, no configuration. Just pure audio visualization magic.

## 🎵 Supported Audio Formats

- **MP3** - The universal standard
- **AAC** - High quality, smaller files
- **FLAC** - Lossless audiophile quality
- **WAV** - Uncompressed studio quality
- **M4A** - Apple's compressed format
- **OGG** - Open-source high-quality lossy alternative
- **OPUS** - The smallest

## 🌟 Good For

- 🎧 Analyzing your music library
- 🎤 Visualizing podcast audio
- 🎼 Studying music production techniques
- 🎮 Adding visual flair to your streams
- 🎨 Creating stunning audio-visual experiences
- 🔊 Testing speaker and headphone frequency response

## 🎨 The Design Philosophy

**Simplicity meets sophistication.** Every element serves a purpose. No clutter, no distractions - just you and your music, visualized beautifully.

**Dark by design.** The dark glassmorphism theme isn't just trendy - it reduces eye strain during long listening sessions and makes the neon accents truly pop.

**Performance first.** What good is a beautiful visualization if it lags? AudioViz is optimized to run at 60 FPS even on modest hardware.
