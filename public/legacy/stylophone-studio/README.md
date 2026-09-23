# ΣTYLOPHONE - Studio Edition

> A browser-based stylophone synthesizer with a full chromatic keyboard, multi-waveform engine, effects chain, and real-time VU meters - built entirely with the Web Audio API.

---

## Features

- **Stylophone Strip** - Touch or click the classic strip interface to play notes across one octave
- **Chromatic Keyboard** - Full piano-style keyboard with mouse, touch, and physical keyboard support
- **4 Waveforms** - Switch between Square, Sawtooth, Sine, and Triangle oscillators in real time
- **Effects Chain**
  - Delay with adjustable time and feedback
  - Lowpass filter with sweepable cutoff
  - Convolution reverb with dry/wet mix control
  - Dynamics compressor on the master bus
- **Octave Shifting** - Transpose the instrument across octaves 1–7
- **Real-time VU Meters** - Live frequency-domain visualization via the Web Audio Analyser node
- **CRT Aesthetic** - Scanlines, vignette, corner brackets, and glow effects for that vintage studio feel
- **Responsive** - Works on desktop and mobile browsers

---

## How to Play

### Mouse / Touch
Click or tap the **Stylophone Strip** or the **Chromatic Keyboard** to play notes. Hold to sustain.

### Physical Keyboard

| Key | Note |
|-----|------|
| `A` | C    |
| `W` | C#   |
| `S` | D    |
| `E` | D#   |
| `D` | E    |
| `F` | F    |
| `T` | F#   |
| `G` | G    |
| `Y` | G#   |
| `H` | A    |
| `U` | A#   |
| `J` | B    |
| `K` | C'   |

---

## Controls

| Control | Description |
|---------|----|
| **Waveform** | Selects the oscillator type (Square / Sawtooth / Sine / Triangle) |
| **Delay Time** | Sets the echo delay length (0–0.6 seconds) |
| **Filter Cutoff** | Lowpass filter frequency (200–8000 Hz) |
| **Reverb Mix** | Wet/dry blend for convolution reverb (0–100%) |
| **Octave** | Shifts the entire instrument up or down by octave |

---

## Audio Architecture

```
Oscillator → GainNode → LowpassFilter ─┬─ DryGain ──────────────────┐
                                        ├─ DelayNode (+ feedback) ───┤
                                        └─ Convolver → ReverbGain ───┘
                                                                      ↓
                                                              DynamicsCompressor
                                                                      ↓
                                                               MasterGain → Output
```

An `AnalyserNode` taps off the master gain to drive the VU meter display.

---

## Getting Started

No build step or dependencies required. Just open the file in any modern browser.

```bash
git clone https://github.com/your-username/stylophone-studio.git
cd stylophone-studio
open index.html   # or serve with any static file server
```

Or serve locally with Python:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## Browser Support

Works in any browser with Web Audio API support - Chrome, Firefox, Safari, and Edge on both desktop and mobile.

> **Note:** Some browsers require a user gesture (click or keypress) before audio can start. The AudioContext is resumed automatically on first interaction.

---

## Tech Stack

- **Web Audio API** - Oscillators, filters, delay, convolution reverb, compression, and analysis
- **Vanilla JS** - No frameworks or dependencies
- **CSS Custom Properties + Animations** - CRT scanlines, glow effects, and fade-in transitions
- **Google Fonts** - Share Tech Mono, Bebas Neue, Space Mono

---

## License

MIT - free to use, modify, and distribute.