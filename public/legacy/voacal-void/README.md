# 🎙️ VOID VOCAL - Real-Time Voice Changer & Pitch Shifter

> **Transform your voice live in the browser. No install. No server. No limits.**

VOID VOCAL is a browser-based, real-time voice processing engine built entirely with the **Web Audio API**. Speak or sing into your microphone and instantly hear your voice transformed - pitch-shifted, autotuned, distorted, reverbed, and more - with zero latency and zero setup.

---

## 🚀 Quick Start

1. Open `void-vocal.html` in **Chrome or Edge** (HTTPS required for mic access)
2. Click **"Let's Go"** on the welcome screen
3. Allow microphone access when prompted
4. **Put on headphones** (to avoid echo/feedback)
5. Speak or sing - pick a preset or tweak sliders

---

## 🎵 What Does It Do?

VOID VOCAL listens to your microphone **live** and applies a real-time DSP (Digital Signal Processing) chain to your voice. Think of it like a studio rack of audio effects - except it all runs inside your browser tab, processing every millisecond of audio as you speak.

You can:
- **Shift your pitch** up or down (chipmunk to demon-deep)
- **Snap to autotune** like T-Pain or Travis Scott
- **Add hall reverb** so your voice sounds like it's in a cathedral
- **Crush the bit depth** for lo-fi robot vibes
- **Add vibrato** - the natural pitch wobble of singers
- **Layer harmonies** a musical fifth above your voice
- **Add delay echo** and chorus width

---

## ✨ Features

### 🎛️ 8 One-Click Presets
| Preset | What it does |
|---|---|
| **T-Pain** | Hard autotune snap, modern pop style |
| **Travis Scott** | Dark, melodic trap with reverb & subtle pitch drop |
| **Robot** | Full robotic voice with bit-crush and ring modulation |
| **Vocoder** | Classic electro vocoder sound |
| **Choir** | Lush angelic harmonies with wide reverb |
| **Lo-Fi** | Crushed vintage radio with heavy drive |
| **Octave Down** | One full octave deeper - demon mode |
| **Chipmunk** | One full octave up - cartoon voice |

### 🔧 5 Effect Toggles
- **Autotune** - Snaps your pitch to the nearest musical note in real time
- **Harmony +5th** - Adds a second voice a perfect fifth above yours
- **Robot Voice** - Ring modulation for a machine-like buzz
- **Chorus** - Widens your voice by layering slightly detuned copies
- **Hall Reverb** - Adds massive spatial depth and echo

### 🎚️ 12 Fine-Tune Sliders
Organized into 4 panels:

**Pitch Engine**
- Pitch Shift (±12 semitones)
- Autotune Snap Speed (0–100%)
- Formant Shift (changes vocal character, not just pitch)

**Modulation**
- Vibrato Speed (Hz)
- Vibrato Depth (semitones)
- Dry/Wet Mix

**Distortion & Grit**
- Drive (overdrive/saturation)
- Bit Crush (16-bit clean → 1-bit extreme)
- Output Volume (dB)

**Space & Echo**
- Reverb Size
- Reverb Amount
- Delay Time (ms)

### 📊 Live Pitch Detection
- Detects the exact musical note you're singing (e.g. **A#3**)
- Shows frequency in Hz
- Visual tuner needle - green = in tune, yellow = close, red = off
- Powered by autocorrelation algorithm on raw audio buffers

### 📈 Real-Time Waveform Visualizer
- Live frequency spectrum bars
- Dual waveform display (purple + cyan mirror)
- 60fps canvas animation

---

## ⚙️ How It Works (Technical)

VOID VOCAL is built on the **Web Audio API** - a low-level audio processing API built into modern browsers. Here's the signal chain:

```
Microphone Input
      │
      ▼
MediaStreamSource
      │
      ├──► AnalyserNode (Waveform Visualizer)
      │
      ├──► AnalyserNode (Pitch Detection - Autocorrelation)
      │
      ▼
WaveShaperNode (Distortion/Drive)
      │
      ▼
GainNode (Input Gain)
      │
      ├──► DryGainNode ──────────────────────────────────┐
      │                                                   │
      ├──► ConvolverNode (Reverb) → ReverbGainNode ──────┤
      │                                                   │
      └──► DelayNode → FeedbackGainNode → DelayNode ─────┤
                                                          │
                                                    OutputGainNode
                                                          │
                                                    AudioDestination
                                                    (Your Headphones)
```

### Pitch Detection Algorithm
VOID VOCAL uses **autocorrelation** to detect pitch:
1. Grabs a buffer of raw audio samples from the microphone
2. Calculates the Root Mean Square (RMS) - if too quiet, skips detection
3. Runs autocorrelation across all lag values to find periodicity
4. Finds the first strong local maximum (fundamental frequency)
5. Uses parabolic interpolation for sub-sample accuracy
6. Converts the lag in samples → Hz → musical note name + cents deviation

### Reverb (Convolution)
Real reverb is simulated using a **ConvolverNode** with a synthetically generated impulse response:
- Generates a stereo buffer of shaped random noise
- Applies exponential decay envelope
- The length and decay shape are controlled by the "Reverb Size" slider

### Distortion (Waveshaping)
Drive uses a **WaveShaperNode** with a soft-clipping transfer curve:
```
f(x) = (π + k) · x / (π + k · |x|)
```
Where `k` is the drive amount. At `k=0` it's linear (clean). Higher values compress and clip the waveform.

---

## 🌐 Deployment

VOID VOCAL is a **single HTML file** - no build step, no dependencies, no server needed.

### Host on GitHub Pages
```bash
# 1. Create a repo on GitHub
# 2. Drop void-vocal.html in as index.html
# 3. Enable GitHub Pages in Settings → Pages
# 4. Done - live at https://yourusername.github.io/void-vocal
```

### Host on Vercel
```bash
# 1. Create a new project folder
mkdir void-vocal && cd void-vocal
cp path/to/void-vocal.html index.html

# 2. Deploy with Vercel CLI
npx vercel
# Or drag-drop the folder at vercel.com/new
```

### Host on Netlify
Drag and drop `void-vocal.html` at **app.netlify.com/drop** - live in 10 seconds.

> ⚠️ **HTTPS is required** for microphone access. All the above platforms serve HTTPS by default.

---

## 🎯 Benefits

| Benefit | Details |
|---|---|
| **Zero Install** | Runs entirely in the browser - no app, no plugins, no downloads |
| **Zero Server** | Single `.html` file - host it anywhere, even from a USB drive |
| **Real-Time** | Sub-50ms latency using Web Audio API's native audio graph |
| **Privacy** | Your voice never leaves your device - no data sent anywhere |
| **Cross-Platform** | Works on Windows, Mac, Linux, Android (Chrome/Edge) |
| **Free** | 100% open source - no subscriptions, no paywalls |
| **Educational** | Full DSP chain exposed - great for learning audio programming |

---

## 🛠️ Browser Compatibility

| Browser | Support |
|---|---|
| ✅ Chrome 80+ | Full support |
| ✅ Edge 80+ | Full support |
| ⚠️ Firefox | Partial (some AudioContext quirks) |
| ⚠️ Safari | Limited (restricted mic API on iOS) |
| ❌ IE | Not supported |

---

## 💡 Tips & Tricks

- **Headphones are essential** - Without them, your mic picks up the processed output, causing feedback loops
- **Quiet room = better pitch detection** - Background noise can confuse the autocorrelation algorithm
- **Layer presets with sliders** - Load a preset then fine-tune any slider on top of it
- **Start with T-Pain** - It's the most dramatic and shows the app's power immediately
- **Low Dry/Wet for subtle effect** - Set Mix to 30–50% for a natural-sounding slight pitch correction
- **Bit Crush + Reverb** - Combine lo-fi crunch with reverb for a dreamy, degraded aesthetic

---

## 📁 Project Structure

```
void-vocal.html          ← The entire app (self-contained)
README.md                ← This file
```

That's it. One file. The entire DSP engine, UI, pitch detector, visualizer, and preset system - all in a single HTML file using vanilla JavaScript and the Web Audio API.

---

## 👨‍💻 Built By

**Syed Adil Hassan** - BSIT Student @ GCUF  
GitHub: [adil-12-hassan](https://github.com/adil-12-hassan)  
Part of the **VOID** series of browser-based audio instruments

> *"The Web Audio API is one of the most underrated superpowers of the modern browser. VOID VOCAL proves you don't need a DAW, a plugin, or an install to do real-time audio processing."*

---

## 📜 License

MIT License - free to use, modify, and distribute.