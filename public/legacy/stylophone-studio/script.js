
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

let waveform = 'square';
let octave = 4;

// ─── Audio chain ───
const masterGain = ctx.createGain();
masterGain.gain.value = 0.7;

const compressor = ctx.createDynamicsCompressor();
compressor.threshold.value = -18;
compressor.ratio.value = 4;

const delayNode = ctx.createDelay(1.0);
delayNode.delayTime.value = 0;
const feedbackGain = ctx.createGain();
feedbackGain.gain.value = 0.35;

const bpFilter = ctx.createBiquadFilter();
bpFilter.type = 'lowpass';
bpFilter.frequency.value = 3000;

// Reverb (simple convolver with impulse response)
const reverbGain = ctx.createGain();
reverbGain.gain.value = 0;
const dryGain = ctx.createGain();
dryGain.gain.value = 1;

function makeImpulse(duration, decay) {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const buf = ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    return buf;
}
const convolver = ctx.createConvolver();
convolver.buffer = makeImpulse(2.5, 3);

// chain: osc -> gain -> bpFilter -> split dry/wet -> compressor -> master -> destination
//                                dry: dryGain -> compressor
//                                wet: convolver -> reverbGain -> compressor
//         also: delayNode feedback loop

delayNode.connect(feedbackGain);
feedbackGain.connect(delayNode);

bpFilter.connect(delayNode);
bpFilter.connect(dryGain);
bpFilter.connect(convolver);

dryGain.connect(compressor);
convolver.connect(reverbGain);
reverbGain.connect(compressor);
delayNode.connect(compressor);

compressor.connect(masterGain);
masterGain.connect(ctx.destination);

// ─── VU Meter ───
const analyser = ctx.createAnalyser();
analyser.fftSize = 256;
masterGain.connect(analyser);

const vuSection = document.getElementById('vu-section');
const VU_COUNT = 12;
const vuFills = [];
for (let i = 0; i < VU_COUNT; i++) {
    const bar = document.createElement('div');
    bar.className = 'vu-bar';
    const fill = document.createElement('div');
    fill.className = 'vu-fill';
    bar.appendChild(fill);
    vuSection.appendChild(bar);
    vuFills.push(fill);
}
const vuData = new Uint8Array(analyser.frequencyBinCount);
function animateVU() {
    requestAnimationFrame(animateVU);
    analyser.getByteFrequencyData(vuData);
    for (let i = 0; i < VU_COUNT; i++) {
        const binIdx = Math.floor((i / VU_COUNT) * (vuData.length * 0.6));
        const val = vuData[binIdx] / 255;
        vuFills[i].style.height = (val * 100).toFixed(1) + '%';
    }
}
animateVU();

// ─── Note frequencies (C4 base, 2 octaves) ───
function getFreq(semitone, oct) {
    return 261.63 * Math.pow(2, (semitone + (oct - 4) * 12) / 12);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const allSemitones = [];
for (let i = 0; i < 13; i++) allSemitones.push(i);

function getNotesForOctave() {
    return allSemitones.map(s => getFreq(s, octave));
}

// ─── Play ───
function play(freq) {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveform;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 0.015);
    osc.connect(gain);
    gain.connect(bpFilter);
    osc.start();
    return () => {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
    };
}

// ─── Strip ───
const strip = document.getElementById('strip');
function buildStrip() {
    strip.innerHTML = '';
    const notes = getNotesForOctave();
    notes.forEach((freq, i) => {
        const div = document.createElement('div');
        div.className = 'stnote';
        div.innerHTML = `<div class="note-line"></div><div class="note-num">${NOTE_NAMES[i % 12]}</div>`;
        let stop;
        function startNote(e) {
            e.preventDefault();
            if (ctx.state === 'suspended') ctx.resume();
            if (!stop) { stop = play(freq); div.classList.add('active'); }
        }
        function endNote() {
            if (stop) { stop(); stop = null; div.classList.remove('active'); }
        }
        div.addEventListener('mousedown', startNote);
        div.addEventListener('mouseup', endNote);
        div.addEventListener('mouseleave', endNote);
        div.addEventListener('touchstart', startNote, { passive: false });
        div.addEventListener('touchend', endNote);
        strip.appendChild(div);
    });
}
buildStrip();

// ─── Keyboard ───
const keyboard = document.getElementById('keyboard');
const WHITE_INDICES = [0, 2, 4, 5, 7, 9, 11, 12];
const BLACK_POSITIONS = [
    { semi: 1, afterWhite: 0 },
    { semi: 3, afterWhite: 1 },
    { semi: 6, afterWhite: 3 },
    { semi: 8, afterWhite: 4 },
    { semi: 10, afterWhite: 5 },
];

const KEY_BINDINGS = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k'];

function buildKeyboard() {
    keyboard.innerHTML = '';
    const notes = getNotesForOctave();
    const whiteKeyEls = [];

    WHITE_INDICES.forEach((semi, idx) => {
        const key = document.createElement('div');
        key.className = 'white-key';
        key.innerHTML = `<span class="k-label">${KEY_BINDINGS[semi] || ''}</span>`;
        let stop;
        function startNote(e) { e.preventDefault(); if (!stop) { stop = play(notes[semi]); key.classList.add('active'); } }
        function endNote() { if (stop) { stop(); stop = null; key.classList.remove('active'); } }
        key.addEventListener('mousedown', startNote);
        key.addEventListener('mouseup', endNote);
        key.addEventListener('mouseleave', endNote);
        key.addEventListener('touchstart', startNote, { passive: false });
        key.addEventListener('touchend', endNote);
        keyboard.appendChild(key);
        whiteKeyEls.push(key);
    });

    // Black keys - position after layout
    requestAnimationFrame(() => {
        BLACK_POSITIONS.forEach(({ semi, afterWhite }) => {
            const refKey = whiteKeyEls[afterWhite];
            if (!refKey) return;
            const refRect = refKey.getBoundingClientRect();
            const kbRect = keyboard.getBoundingClientRect();
            const leftPos = refRect.right - kbRect.left - 18;

            const key = document.createElement('div');
            key.className = 'black-key';
            key.style.left = leftPos + 'px';
            key.innerHTML = `<span class="k-label">${KEY_BINDINGS[semi] || ''}</span>`;
            let stop;
            function startNote(e) { e.preventDefault(); if (!stop) { stop = play(notes[semi]); key.classList.add('active'); } }
            function endNote() { if (stop) { stop(); stop = null; key.classList.remove('active'); } }
            key.addEventListener('mousedown', startNote);
            key.addEventListener('mouseup', endNote);
            key.addEventListener('mouseleave', endNote);
            key.addEventListener('touchstart', startNote, { passive: false });
            key.addEventListener('touchend', endNote);
            keyboard.appendChild(key);
        });
    });
}
buildKeyboard();

window.addEventListener('resize', buildKeyboard);

// ─── Key hints ───
const hints = document.getElementById('keyhints');
const HINT_PAIRS = [['A', 'C'], ['W', 'C#'], ['S', 'D'], ['E', 'D#'], ['D', 'E'], ['F', 'F'], ['T', 'F#'], ['G', 'G'], ['Y', 'G#'], ['H', 'A'], ['U', 'A#'], ['J', 'B'], ['K', 'C\'']];
HINT_PAIRS.forEach(([k, n]) => {
    const h = document.createElement('div');
    h.className = 'hint';
    h.innerHTML = `<span>${k}</span>${n}`;
    hints.appendChild(h);
});

// ─── Keyboard input ───
const keyMap = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };
const playing = {};
document.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (ctx.state === 'suspended') ctx.resume();
    const semi = keyMap[e.key];
    if (semi !== undefined && !playing[e.key]) {
        const notes = getNotesForOctave();
        playing[e.key] = play(notes[semi]);
    }
});
document.addEventListener('keyup', e => {
    if (playing[e.key]) {
        playing[e.key]();
        delete playing[e.key];
    }
});

// ─── Waveform buttons ───
document.querySelectorAll('.wavebtn[data-wave]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.wavebtn[data-wave]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        waveform = btn.dataset.wave;
    });
});

// ─── Octave buttons ───
document.getElementById('oct-down').addEventListener('click', () => {
    if (octave > 1) { octave--; document.getElementById('oct-display').textContent = octave; buildStrip(); buildKeyboard(); }
});
document.getElementById('oct-up').addEventListener('click', () => {
    if (octave < 7) { octave++; document.getElementById('oct-display').textContent = octave; buildStrip(); buildKeyboard(); }
});

// ─── Sliders ───
const delayInput = document.getElementById('delay');
const delayVal = document.getElementById('delay-val');
delayInput.addEventListener('input', e => {
    delayNode.delayTime.value = parseFloat(e.target.value);
    delayVal.textContent = parseFloat(e.target.value).toFixed(2);
});

const filterInput = document.getElementById('filter');
const filterVal = document.getElementById('filter-val');
filterInput.addEventListener('input', e => {
    bpFilter.frequency.value = parseFloat(e.target.value);
    filterVal.textContent = Math.round(e.target.value);
});

const reverbInput = document.getElementById('reverb');
const reverbValEl = document.getElementById('reverb-val');
reverbInput.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    reverbGain.gain.value = v;
    dryGain.gain.value = 1 - v * 0.5;
    reverbValEl.textContent = Math.round(v * 100) + '%';
});