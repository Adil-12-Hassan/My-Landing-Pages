// ──────────────────────────────────────────────
// AUDIO ENGINE
// ──────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioCtx();

// Master chain
const masterGain = ctx.createGain();
masterGain.gain.value = 0.7;
const compressor = ctx.createDynamicsCompressor();
compressor.threshold.value = -14;
compressor.ratio.value = 6;
compressor.attack.value = 0.003;
compressor.release.value = 0.25;

// Tone filter
const toneFilter = ctx.createBiquadFilter();
toneFilter.type = 'lowpass';
toneFilter.frequency.value = 3000;

// Delay
const delayNode = ctx.createDelay(2.0);
delayNode.delayTime.value = 0;
const delayFeedback = ctx.createGain();
delayFeedback.gain.value = 0.35;
const delayWet = ctx.createGain();
delayWet.gain.value = 0;
delayNode.connect(delayFeedback);
delayFeedback.connect(delayNode);
delayNode.connect(delayWet);

// Reverb
const convolver = ctx.createConvolver();
function makeImpulse(dur, dec) {
    const rate = ctx.sampleRate, len = rate * dur;
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, dec);
    }
    return buf;
}
convolver.buffer = makeImpulse(2.5, 2.5);
const reverbWet = ctx.createGain();
reverbWet.gain.value = 0.2;

// Chorus (simple with delay + LFO)
const chorusDelay = ctx.createDelay(0.1);
chorusDelay.delayTime.value = 0.02;
const chorusGain = ctx.createGain();
chorusGain.gain.value = 0;
const lfo = ctx.createOscillator();
const lfoGain = ctx.createGain();
lfo.frequency.value = 2.5;
lfoGain.gain.value = 0.003;
lfo.connect(lfoGain);
lfoGain.connect(chorusDelay.delayTime);
lfo.start();

// Distortion shaper
function makeDistortion(amount) {
    const n = 256, curve = new Float32Array(n);
    const k = amount;
    for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
const distortion = ctx.createWaveShaper();
distortion.curve = makeDistortion(0);
distortion.oversample = '4x';

// Pre-gain (for amp models)
const preGain = ctx.createGain();
preGain.gain.value = 0.6;

// Analyser
const analyser = ctx.createAnalyser();
analyser.fftSize = 256;

// Chain: preGain -> distortion -> toneFilter -> [delay, reverb, chorus, dry] -> compressor -> master -> analyser -> dest
preGain.connect(distortion);
distortion.connect(toneFilter);
toneFilter.connect(delayNode);
toneFilter.connect(convolver);
toneFilter.connect(chorusDelay);
toneFilter.connect(compressor); // dry path
convolver.connect(reverbWet);
reverbWet.connect(compressor);
delayWet.connect(compressor);
chorusDelay.connect(chorusGain);
chorusGain.connect(compressor);
compressor.connect(masterGain);
masterGain.connect(analyser);
analyser.connect(ctx.destination);

// Amp models
const AMP_MODELS = {
    clean: { dist: 0, gain: 0.6, tone: 3500, color: '#00d4aa' },
    crunch: { dist: 80, gain: 1.2, tone: 2800, color: '#ff6b1a' },
    lead: { dist: 200, gain: 2.5, tone: 2200, color: '#ff2d78' },
    acoustic: { dist: 0, gain: 0.4, tone: 6000, color: '#ffe44d' },
};
let currentAmp = 'clean';

function applyAmp(name) {
    const m = AMP_MODELS[name];
    distortion.curve = makeDistortion(m.dist);
    preGain.gain.value = m.gain;
    toneFilter.frequency.value = m.tone;
    document.getElementById('tone-val').textContent = m.tone >= 1000 ? Math.round(m.tone / 1000) + 'k' : m.tone;
    currentAmp = name;
}

// ──────────────────────────────────────────────
// TUNINGS & NOTE MATH
// ──────────────────────────────────────────────
const TUNINGS = {
    'standard': [40, 45, 50, 55, 59, 64], // EADGBE (MIDI numbers)
    'drop-d': [38, 45, 50, 55, 59, 64],
    'open-g': [38, 43, 50, 55, 58, 62],
};
const NOTE_NAMES_ALL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STRING_LABELS = { standard: ['E', 'A', 'D', 'G', 'B', 'e'], 'drop-d': ['D', 'A', 'D', 'G', 'B', 'e'], 'open-g': ['D', 'G', 'D', 'G', 'B', 'D'] };

let currentTuning = 'standard';
const NUM_FRETS = 12;

function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
function midiToName(midi) {
    return NOTE_NAMES_ALL[midi % 12];
}

// ──────────────────────────────────────────────
// PLAY NOTE
// ──────────────────────────────────────────────
function playNote(freq, duration = 1.2) {
    if (ctx.state === 'suspended') ctx.resume();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const g = ctx.createGain();

    // Guitar-like: fundamental + harmonics
    osc1.type = 'sawtooth';
    osc1.frequency.value = freq;
    osc2.type = 'square';
    osc2.frequency.value = freq * 2;
    osc3.type = 'triangle';
    osc3.frequency.value = freq * 0.5;

    const g2 = ctx.createGain(); g2.gain.value = 0.15;
    const g3 = ctx.createGain(); g3.gain.value = 0.1;

    osc1.connect(g);
    osc2.connect(g2); g2.connect(g);
    osc3.connect(g3); g3.connect(g);

    // Pluck envelope
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.7, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    g.connect(preGain);

    osc1.start(); osc2.start(); osc3.start();
    osc1.stop(ctx.currentTime + duration + 0.1);
    osc2.stop(ctx.currentTime + duration + 0.1);
    osc3.stop(ctx.currentTime + duration + 0.1);

    return () => {
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc1.stop(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.15);
        osc3.stop(ctx.currentTime + 0.15);
    };
}

// ──────────────────────────────────────────────
// VU METER
// ──────────────────────────────────────────────
const vuWrap = document.getElementById('vu-wrap');
const VU_BARS = 14;
const vuFills = [];
for (let i = 0; i < VU_BARS; i++) {
    const b = document.createElement('div'); b.className = 'vu-bar';
    const f = document.createElement('div'); f.className = 'vu-fill';
    b.appendChild(f); vuWrap.appendChild(b); vuFills.push(f);
}
const freqData = new Uint8Array(analyser.frequencyBinCount);
function animVU() {
    requestAnimationFrame(animVU);
    analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < VU_BARS; i++) {
        const idx = Math.floor((i / VU_BARS) * freqData.length * 0.5);
        vuFills[i].style.height = (freqData[idx] / 255 * 100).toFixed(1) + '%';
    }
}
animVU();

// ──────────────────────────────────────────────
// BUILD FRETBOARD
// ──────────────────────────────────────────────
const MARKER_FRETS = [3, 5, 7, 9, 12];

function buildFretboard() {
    const neck = document.getElementById('neck');
    const fretLinesEl = document.getElementById('fret-lines');
    const fretMarkersEl = document.getElementById('fret-markers');
    const stringsArea = document.getElementById('strings-area');
    const fretNumbers = document.getElementById('fret-numbers');

    fretLinesEl.innerHTML = '';
    fretMarkersEl.innerHTML = '';
    stringsArea.innerHTML = '';
    fretNumbers.innerHTML = '';

    const tuning = TUNINGS[currentTuning];
    const stringLabels = STRING_LABELS[currentTuning];

    // We need to know fret widths - use JS after render
    const totalCols = NUM_FRETS + 1; // open + 12 frets
    const openWeight = 0.5;
    const totalWeight = openWeight + NUM_FRETS;

    // Fret lines (visual only, via CSS left %)
    // nut
    const nut = document.createElement('div');
    nut.className = 'fret-line nut';
    const nutPct = (openWeight / totalWeight * 100).toFixed(2);
    nut.style.left = nutPct + '%';
    fretLinesEl.appendChild(nut);

    for (let f = 1; f <= NUM_FRETS; f++) {
        const line = document.createElement('div');
        line.className = 'fret-line';
        const pct = ((openWeight + f) / totalWeight * 100).toFixed(2);
        line.style.left = pct + '%';
        fretLinesEl.appendChild(line);
    }

    // Fret markers
    MARKER_FRETS.forEach(f => {
        if (f === 12) {
            [-0.015, 0.015].forEach(off => {
                const dot = document.createElement('div');
                dot.className = 'fret-dot';
                const mid = (openWeight + f - 0.5) / totalWeight * 100;
                dot.style.left = (mid + off * 100) + '%';
                dot.style.top = '50%';
                dot.style.transform = 'translate(-50%,-50%)';
                fretMarkersEl.appendChild(dot);
            });
        } else {
            const dot = document.createElement('div');
            dot.className = 'fret-dot';
            const mid = (openWeight + f - 0.5) / totalWeight * 100;
            dot.style.left = mid + '%';
            dot.style.top = '50%';
            dot.style.transform = 'translate(-50%,-50%)';
            fretMarkersEl.appendChild(dot);
        }
    });

    // String thickness (low E thickest)
    const stringThickness = [3.2, 2.6, 2.1, 1.6, 1.2, 0.9];
    const stringColor = [
        'rgba(200,176,96,0.9)',
        'rgba(200,176,96,0.85)',
        'rgba(220,200,140,0.85)',
        'rgba(220,200,140,0.8)',
        'rgba(232,213,160,0.8)',
        'rgba(240,225,180,0.75)',
    ];

    // Build string rows (low E at top = string index 0 reversed visually)
    for (let si = 5; si >= 0; si--) {
        const baseMidi = tuning[si];
        const row = document.createElement('div');
        row.className = 'string-row';

        // String label
        const lbl = document.createElement('div');
        lbl.className = 'string-name';
        lbl.textContent = stringLabels[si];
        row.appendChild(lbl);

        // String track
        const track = document.createElement('div');
        track.className = 'string-track';

        // Visual string line
        const vIdx = 5 - si; // visual index (0=low E on top)
        const sline = document.createElement('div');
        sline.className = 'string-line';
        sline.innerHTML = `<svg width="100%" height="4" style="display:block;overflow:visible">
      <line x1="0" y1="2" x2="100%" y2="2"
        stroke="${stringColor[vIdx]}"
        stroke-width="${stringThickness[vIdx]}"
        stroke-linecap="round"
        filter="url(#sg)"/>
      <defs>
        <filter id="sg" x="-5%" y="-200%" width="110%" height="500%">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
    </svg>`;
        track.appendChild(sline);

        // Fret cells container
        const fretsCont = document.createElement('div');
        fretsCont.className = 'frets-container';

        // Open string cell
        const openCell = document.createElement('div');
        openCell.className = 'fret-cell open-cell';
        openCell.dataset.string = si;
        openCell.dataset.fret = 0;
        openCell.dataset.midi = baseMidi;
        track.appendChild(sline);
        fretsCont.appendChild(openCell);

        // Fretted cells
        for (let f = 1; f <= NUM_FRETS; f++) {
            const cell = document.createElement('div');
            cell.className = 'fret-cell';
            cell.dataset.string = si;
            cell.dataset.fret = f;
            cell.dataset.midi = baseMidi + f;
            fretsCont.appendChild(cell);
        }
        track.appendChild(fretsCont);
        row.appendChild(track);
        stringsArea.appendChild(row);
    }

    // Fret numbers row
    const openNumDiv = document.createElement('div');
    openNumDiv.className = 'fret-num open-num';
    openNumDiv.textContent = '0';
    fretNumbers.appendChild(openNumDiv);
    for (let f = 1; f <= NUM_FRETS; f++) {
        const n = document.createElement('div');
        n.className = 'fret-num' + (MARKER_FRETS.includes(f) ? ' marked' : '');
        n.textContent = f;
        fretNumbers.appendChild(n);
    }

    // Attach events
    attachFretEvents();
}

// ──────────────────────────────────────────────
// FRET EVENTS
// ──────────────────────────────────────────────
let activeStops = {};

function attachFretEvents() {
    document.querySelectorAll('.fret-cell').forEach(cell => {
        const midi = parseInt(cell.dataset.midi);
        const sIdx = cell.dataset.string;
        const key = sIdx + '-' + cell.dataset.fret;

        function startPlay(e) {
            e.preventDefault();
            if (ctx.state === 'suspended') ctx.resume();
            if (activeStops[sIdx]) { try { activeStops[sIdx](); } catch (e) { } }
            cell.classList.add('active');
            const freq = midiToFreq(midi);
            activeStops[sIdx] = playNote(freq, 1.5);
            showNowPlaying(midiToName(midi));
        }
        function endPlay() {
            cell.classList.remove('active');
        }

        cell.addEventListener('mousedown', startPlay);
        cell.addEventListener('mouseup', endPlay);
        cell.addEventListener('mouseleave', endPlay);
        cell.addEventListener('touchstart', startPlay, { passive: false });
        cell.addEventListener('touchend', endPlay);
    });
}

// ──────────────────────────────────────────────
// NOW PLAYING
// ──────────────────────────────────────────────
let npTimeout;
function showNowPlaying(note) {
    const el = document.getElementById('now-playing');
    el.textContent = note;
    el.classList.add('visible');
    clearTimeout(npTimeout);
    npTimeout = setTimeout(() => el.classList.remove('visible'), 1200);
}

// ──────────────────────────────────────────────
// CHORD STRUMMING
// ──────────────────────────────────────────────
const CHORDS = {
    // Each chord: array of [stringIndex, fret] for 6 strings, null = muted
    'E': [[0, 0], [1, 2], [2, 2], [3, 1], [4, 0], [5, 0]],
    'Am': [[0, 0], [1, 0], [2, 2], [3, 2], [4, 1], [5, null]],
    'C': [[0, null], [1, 3], [2, 2], [3, 0], [4, 1], [5, 0]],
    'G': [[0, 3], [1, 2], [2, 0], [3, 0], [4, 0], [5, 3]],
    'D': [[0, null], [1, null], [2, 0], [3, 2], [4, 3], [5, 2]],
    'Em': [[0, 0], [1, 2], [2, 2], [3, 0], [4, 0], [5, 0]],
    'F': [[0, 1], [1, 1], [2, 2], [3, 3], [4, 3], [5, 1]],
    'Bm': [[0, null], [1, 2], [2, 4], [3, 4], [4, 3], [5, 2]],
    'A': [[0, 0], [1, 0], [2, 2], [3, 2], [4, 2], [5, null]],
    'Dm': [[0, null], [1, null], [2, 0], [3, 2], [4, 3], [5, 1]],
};

const chordBtns = document.getElementById('chord-btns');
Object.keys(CHORDS).forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'chordbtn';
    btn.textContent = name;
    btn.addEventListener('click', () => strumChord(name));
    chordBtns.appendChild(btn);
});

function strumChord(name) {
    if (ctx.state === 'suspended') ctx.resume();
    const chord = CHORDS[name];
    const tuning = TUNINGS[currentTuning];
    chord.forEach(([stringIdx, fret], order) => {
        if (fret === null) return;
        setTimeout(() => {
            const midi = tuning[stringIdx] + fret;
            const freq = midiToFreq(midi);
            playNote(freq, 1.8);
            // Flash the fret cell
            const cell = document.querySelector(`.fret-cell[data-string="${stringIdx}"][data-fret="${fret}"]`);
            if (cell) {
                cell.classList.add('active');
                setTimeout(() => cell.classList.remove('active'), 300);
            }
        }, order * 28);
    });
    showNowPlaying(name);
}

// ──────────────────────────────────────────────
// KEYBOARD BINDINGS
// ──────────────────────────────────────────────
// Map keyboard rows to strings + frets
// Row 1 (1-6): open strings
// Q-Y: string 5 (low E) frets 1-6
// A-H: string 4 frets 1-6
// Z-N: string 3 frets 1-6
const KEY_MAP = {
    '1': { s: 5, f: 0 }, '2': { s: 4, f: 0 }, '3': { s: 3, f: 0 }, '4': { s: 2, f: 0 }, '5': { s: 1, f: 0 }, '6': { s: 0, f: 0 },
    'q': { s: 5, f: 1 }, 'w': { s: 5, f: 2 }, 'e': { s: 5, f: 3 }, 'r': { s: 5, f: 4 }, 't': { s: 5, f: 5 }, 'y': { s: 5, f: 6 },
    'a': { s: 4, f: 1 }, 's': { s: 4, f: 2 }, 'd': { s: 4, f: 3 }, 'f': { s: 4, f: 4 }, 'g': { s: 4, f: 5 }, 'h': { s: 4, f: 6 },
    'z': { s: 3, f: 1 }, 'x': { s: 3, f: 2 }, 'c': { s: 3, f: 3 }, 'v': { s: 3, f: 4 }, 'b': { s: 3, f: 5 }, 'n': { s: 3, f: 6 },
};

const kbPlaying = {};
document.addEventListener('keydown', e => {
    if (e.repeat) return;
    const m = KEY_MAP[e.key];
    if (!m) return;
    if (ctx.state === 'suspended') ctx.resume();
    const tuning = TUNINGS[currentTuning];
    const midi = tuning[m.s] + m.f;
    const freq = midiToFreq(midi);
    kbPlaying[e.key] = playNote(freq, 1.5);
    showNowPlaying(midiToName(midi));
    const cell = document.querySelector(`.fret-cell[data-string="${m.s}"][data-fret="${m.f}"]`);
    if (cell) cell.classList.add('active');
});
document.addEventListener('keyup', e => {
    if (kbPlaying[e.key]) { kbPlaying[e.key](); delete kbPlaying[e.key]; }
    const m = KEY_MAP[e.key];
    if (m) {
        const cell = document.querySelector(`.fret-cell[data-string="${m.s}"][data-fret="${m.f}"]`);
        if (cell) cell.classList.remove('active');
    }
});

// Key hints
const keyhints = document.getElementById('keyhints');
const HINT_DATA = [
    ['1-6', 'Open strings'], ['Q-Y', 'Low E frets 1-6'], ['A-H', 'A string frets 1-6'], ['Z-N', 'D string frets 1-6'],
];
HINT_DATA.forEach(([k, n]) => {
    const h = document.createElement('div');
    h.className = 'hint-chip';
    h.innerHTML = `<span class="hk">${k}</span><span class="hn">${n}</span>`;
    keyhints.appendChild(h);
});

// ──────────────────────────────────────────────
// CONTROLS
// ──────────────────────────────────────────────

// Amp buttons
document.querySelectorAll('.ampbtn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.ampbtn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyAmp(btn.dataset.amp);
    });
});

// Tuning buttons
document.querySelectorAll('.tuning-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tuning-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTuning = btn.dataset.tuning;
        buildFretboard();
    });
});

// Knob drag logic
let knobDrag = null;
document.querySelectorAll('.knob').forEach(knob => {
    knob.addEventListener('mousedown', e => {
        e.preventDefault();
        knobDrag = { knob, startY: e.clientY, startVal: parseFloat(knob.dataset.val) };
    });
    knob.addEventListener('touchstart', e => {
        e.preventDefault();
        knobDrag = { knob, startY: e.touches[0].clientY, startVal: parseFloat(knob.dataset.val) };
    }, { passive: false });
});
document.addEventListener('mousemove', e => {
    if (!knobDrag) return;
    updateKnob(knobDrag.knob, knobDrag.startY - e.clientY, knobDrag.startVal);
});
document.addEventListener('touchmove', e => {
    if (!knobDrag) return;
    updateKnob(knobDrag.knob, knobDrag.startY - e.touches[0].clientY, knobDrag.startVal);
}, { passive: false });
document.addEventListener('mouseup', () => knobDrag = null);
document.addEventListener('touchend', () => knobDrag = null);

function updateKnob(knob, deltaY, startVal) {
    const min = parseFloat(knob.dataset.min);
    const max = parseFloat(knob.dataset.max);
    const range = max - min;
    const newVal = Math.max(min, Math.min(max, startVal + (deltaY / 120) * range));
    knob.dataset.val = newVal;
    const pct = (newVal - min) / range; // 0..1
    const angle = -135 + pct * 270; // -135deg to +135deg
    knob.querySelector('.knob-dot').style.transform = `translateX(-50%) rotate(${angle}deg)`;
    const param = knob.dataset.param;
    if (param === 'gain') {
        preGain.gain.value = newVal;
        document.getElementById('gain-val').textContent = Math.round(pct * 100);
    } else if (param === 'tone') {
        toneFilter.frequency.value = newVal;
        document.getElementById('tone-val').textContent = newVal >= 1000 ? Math.round(newVal / 1000) + 'k' : Math.round(newVal);
    } else if (param === 'vol') {
        masterGain.gain.value = newVal;
        document.getElementById('vol-val').textContent = Math.round(pct * 100);
    }
}

// Initialize knob visuals
document.querySelectorAll('.knob').forEach(knob => {
    const min = parseFloat(knob.dataset.min);
    const max = parseFloat(knob.dataset.max);
    const val = parseFloat(knob.dataset.val);
    const pct = (val - min) / (max - min);
    const angle = -135 + pct * 270;
    knob.querySelector('.knob-dot').style.transform = `translateX(-50%) rotate(${angle}deg)`;
});

// Sliders
document.getElementById('delay').addEventListener('input', e => {
    delayNode.delayTime.value = parseFloat(e.target.value);
    const v = parseFloat(e.target.value);
    delayWet.gain.value = v > 0 ? 0.5 : 0;
    document.getElementById('delay-val').textContent = v.toFixed(2);
});
document.getElementById('reverb').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    reverbWet.gain.value = v * 0.7;
    document.getElementById('reverb-val').textContent = Math.round(v * 100) + '%';
});
document.getElementById('chorus').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    chorusGain.gain.value = v * 0.4;
    document.getElementById('chorus-val').textContent = Math.round(v * 100) + '%';
});

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
buildFretboard();
applyAmp('clean');