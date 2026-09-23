# FRETWORK - Studio Guitar

> A browser-based 6-string guitar simulator with an interactive fretboard, amp modelling, multi-FX chain, chord strumming, and real-time VU meters - built entirely with the Web Audio API.

---


## Features
- **Interactive Fretboard** - Click or tap any fret on any string to play individual notes with a glowing visual indicator.

- **4 Amp Models** - Switch between Clean, Crunch, Lead, and Acoustic tones, each with its own gain, distortion curve, and tone character.

- **Tone Stack Knobs** - Drag-to-control Gain, Tone (filter cutoff), and Volume knobs.

- **FX Chain**
  - Delay with feedback loop and wet/dry control
  - Convolution reverb with adjustable mix
  - Chorus effect with LFO modulation
  - Waveshaper distortion (per amp model)
  - Dynamics compressor on the master bus

- **3 Tunings** - Standard (EADGBe), Drop D, and Open G

- **Quick Chord Strumming** - One-click strumming for E, Am, C, G, D, Em, F, Bm, A, Dm with animated fret highlights

- **Keyboard Playability** - Physical keyboard mapped to strings and frets across 3 rows

- **Real-time VU Meters** - Live frequency visualisation via the Web Audio Analyser node

- **Responsive** - Works on desktop and mobile browsers

---

## How to Play

### Mouse / Touch

Click or tap any **fret cell** on the fretboard to play that note. The active note glows with an orange indicator and the note name appears in the top-right corner.

### Quick Chords

Click any chord button below the fretboard to strum the full chord. Notes are staggered with a slight delay to simulate a real strum.

### Physical Keyboard
| Keys | Action |
|------|--------|
| `1` `2` `3` `4` `5` `6` | Open strings (low E → high e) |
| `Q` `W` `E` `R` `T` `Y` | Low E string - frets 1–6 |
| `A` `S` `D` `F` `G` `H` | A string - frets 1–6 |
| `Z` `X` `C` `V` `B` `N` | D string - frets 1–6 | 

---
## Controls
### Amp Models
| Model | Character |
|-------|--|
| **Clean** | Low gain, bright tone - jazz and rhythm |
| **Crunch** | Mild distortion - blues and classic rock |
| **Lead** | High gain, scooped tone - lead solos |
| **Acoustic** | No distortion, open high-frequency response |

### Tone Stack Knobs
Drag up/down on each knob to adjust:
| Knob | Range | Description |
|------|-------|----|
| **Gain** | 0–400% | Pre-amplifier gain (feeds waveshaper distortion) |
| **Tone** | 200–8000 Hz | Lowpass filter cutoff frequency |
| **Vol** | 0–100% | Master output volume |

### FX Sliders
| Control | Description |
|---------|----|
| **Delay** | Echo delay time (0–0.6s). Activates wet signal when > 0 |
| **Reverb** | Convolution reverb wet mix (0–100%) |
| **Chorus** | LFO-modulated chorus depth (0–100%) |

### Tunings
| Tuning | Strings (low → high) |
|--------|----|
| **E Standard** | E A D G B e |
| **Drop D** | D A D G B e |
| **Open G** | D G D G B D |

---
## Audio Architecture

```
Oscillators (fundamental + harmonics)
        ↓
    GainNode (pluck envelope)
        ↓
    PreGain (amp gain)
        ↓
  WaveShaper (distortion)
        ↓
  LowpassFilter (tone)
        ↓
  ┌─────┼──────────┬─────────────┐
  │     │          │             │
Delay  Convolver  ChorusDelay   Dry
  │     │          │
DelayWet ReverbWet ChorusGain
  └─────┴──────────┴─────────────┘
                 ↓
        DynamicsCompressor
                 ↓
            MasterGain
                 ↓
            AnalyserNode → VU Meters
                 ↓
           ctx.destination
```
The guitar tone is synthesised using three stacked oscillators - a sawtooth fundamental, square wave at 2× frequency, and a triangle sub-octave - shaped by a pluck-style ADSR envelope.

---
## Getting Started

No build step or dependencies required.
```bash
git clone https://github.com/your-username/fretwork-studio.git
cd fretwork-studio
open index.html
```
Or serve locally:
```bash
python -m http.server 8080
# visit http://localhost:8080
```

---
## Browser Support

Any modern browser with Web Audio API support - Chrome, Firefox, Safari, Edge, desktop and mobile.
> **Note:** Audio requires a user gesture to start in most browsers. The AudioContext resumes automatically on first click or keypress.

---
## Tech Stack

- **Web Audio API** - Oscillators, waveshaper distortion, biquad filters, delay, convolution reverb, chorus LFO, compression, and analysis
- **Vanilla JS** - No frameworks or dependencies
- **SVG** - String rendering with per-string thickness and glow filter
- **CSS Custom Properties + Animations** - Wood grain aesthetic, vignette, and slide-in transitions

- **Google Fonts** - Share Tech Mono, Bebas Neue, Playfair Display
---

## License

MIT - free to use, modify, and distribute.