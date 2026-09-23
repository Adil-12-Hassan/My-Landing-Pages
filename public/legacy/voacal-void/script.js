// -══════════════
//  DATA
// -══════════════

const FX_DEFS = [
    { id: 'autotune', name: 'Autotune', emoji: '🎵', desc: 'Snaps pitch to nearest musical note (T-Pain style)', default: true },
    { id: 'harmony', name: 'Harmony +5', emoji: '🎶', desc: 'Adds a harmony note a 5th above your voice', default: false },
    { id: 'robot', name: 'Robot Voice', emoji: '🤖', desc: 'Ring-modulates your voice for a robotic buzz effect', default: false },
    { id: 'chorus', name: 'Chorus', emoji: '✨', desc: 'Layers slight pitch copies to make your voice sound wider', default: false },
    { id: 'reverb', name: 'Reverb', emoji: '🌊', desc: 'Adds space/room echo - toggle Reverb Amount slider to taste', default: false },
];

const PRESETS = [
    { emoji: '🎤', name: 'T-Pain', desc: 'Hard snap, modern pop', pitch: 0, snap: 100, formant: 0, drive: 10, bit: 16, mix: 100, revSz: 40, revMx: 25, vibR: 0, vibD: 0, gain: 0, fx: { autotune: true, harmony: false, robot: false, chorus: false, reverb: true } },
    { emoji: '🌑', name: 'Travis S.', desc: 'Dark melodic trap', pitch: -2, snap: 85, formant: -1, drive: 30, bit: 16, mix: 100, revSz: 60, revMx: 35, vibR: 3, vibD: 0.3, gain: 0, fx: { autotune: true, harmony: false, robot: false, chorus: false, reverb: true } },
    { emoji: '🤖', name: 'Robot', desc: 'Full robot machine', pitch: 0, snap: 100, formant: 0, drive: 0, bit: 8, mix: 100, revSz: 20, revMx: 10, vibR: 0, vibD: 0, gain: 0, fx: { autotune: true, harmony: false, robot: true, chorus: false, reverb: false } },
    { emoji: '👾', name: 'Vocoder', desc: 'Classic electro vocoder', pitch: 0, snap: 80, formant: 2, drive: 20, bit: 12, mix: 100, revSz: 30, revMx: 15, vibR: 0, vibD: 0, gain: 0, fx: { autotune: true, harmony: true, robot: false, chorus: true, reverb: false } },
    { emoji: '🎼', name: 'Choir', desc: 'Lush angelic harmony', pitch: 0, snap: 50, formant: 0, drive: 0, bit: 16, mix: 80, revSz: 80, revMx: 50, vibR: 5, vibD: 0.4, gain: 0, fx: { autotune: false, harmony: true, robot: false, chorus: true, reverb: true } },
    { emoji: '📻', name: 'Lo-Fi', desc: 'Crushed vintage radio', pitch: 0, snap: 0, formant: 0, drive: 60, bit: 6, mix: 100, revSz: 30, revMx: 20, vibR: 2, vibD: 0.2, gain: 0, fx: { autotune: false, harmony: false, robot: false, chorus: false, reverb: false } },
    { emoji: '🔻', name: 'Octave ↓', desc: 'One octave deeper', pitch: -12, snap: 0, formant: -3, drive: 10, bit: 16, mix: 100, revSz: 50, revMx: 20, vibR: 0, vibD: 0, gain: 2, fx: { autotune: false, harmony: false, robot: false, chorus: false, reverb: true } },
    { emoji: '🐿️', name: 'Chipmunk', desc: 'Cartoon high voice', pitch: 12, snap: 0, formant: 3, drive: 0, bit: 16, mix: 100, revSz: 20, revMx: 10, vibR: 0, vibD: 0, gain: 0, fx: { autotune: false, harmony: false, robot: false, chorus: false, reverb: false } },
];

const fx = {};
FX_DEFS.forEach(f => fx[f.id] = f.default);

const params = { pitch: 0, snap: 60, formant: 0, vibR: 0, vibD: 0, mix: 100, drive: 0, bit: 16, gain: 0, revSz: 40, revMx: 20, delay: 0 };

// -══════════════
//  UI BUILD
// -══════════════
function buildFx() {
    const row = document.getElementById('fxRow');
    FX_DEFS.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'fx-card' + (f.default ? ' on' : '');
        btn.id = 'fx_' + f.id;
        btn.innerHTML = `<div class="fx-card-head"><div class="fx-dot"></div><span class="fx-name">${f.emoji} ${f.name}</span></div><div class="fx-desc">${f.desc}</div>`;
        btn.onclick = () => { fx[f.id] = !fx[f.id]; syncFxBtn(f.id); applyAudio(); };
        row.appendChild(btn);
    });
}

function syncFxBtn(id) {
    const btn = document.getElementById('fx_' + id);
    if (btn) btn.classList.toggle('on', fx[id]);
}

function buildPresets() {
    const grid = document.getElementById('presetsGrid');
    PRESETS.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.id = 'pre_' + i;
        btn.innerHTML = `<span class="emoji">${p.emoji}</span><span class="pname">${p.name}</span><span class="pdesc">${p.desc}</span>`;
        btn.onclick = () => applyPreset(i);
        grid.appendChild(btn);
    });
}

function applyPreset(idx) {
    const p = PRESETS[idx];
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('pre_' + idx).classList.add('active');
    // params
    Object.assign(params, { pitch: p.pitch, snap: p.snap, formant: p.formant, drive: p.drive, bit: p.bit, mix: p.mix, revSz: p.revSz, revMx: p.revMx, vibR: p.vibR, vibD: p.vibD, gain: p.gain });
    // fx
    Object.keys(p.fx).forEach(k => { fx[k] = p.fx[k]; syncFxBtn(k); });
    // sync sliders
    const map = { pitch: 'sPitch', snap: 'sSnap', formant: 'sFormant', drive: 'sDrive', bit: 'sBit', mix: 'sMix', revSz: 'sRevSz', revMx: 'sRevMx', vibR: 'sVibR', vibD: 'sVibD', gain: 'sGain' };
    Object.entries(map).forEach(([k, id]) => {
        const el = document.getElementById(id);
        if (el) { el.value = params[k]; displayParam(k, params[k]); }
    });
    applyAudio();
}

// param display
const FMT = {
    pitch: v => `${v > 0 ? '+' : ''}${parseFloat(v).toFixed(1)} st`,
    snap: v => `${v}%`,
    formant: v => `${v > 0 ? '+' : ''}${parseFloat(v).toFixed(1)} st`,
    vibR: v => `${parseFloat(v).toFixed(1)} Hz`,
    vibD: v => `${parseFloat(v).toFixed(2)} st`,
    mix: v => `${v}%`,
    drive: v => `${v}%`,
    bit: v => `${v} bit`,
    gain: v => `${v > 0 ? '+' : ''}${v} dB`,
    revSz: v => `${v}%`,
    revMx: v => `${v}%`,
    delay: v => `${v} ms`,
};
const IDS = { pitch: 'vPitch', snap: 'vSnap', formant: 'vFormant', vibR: 'vVibR', vibD: 'vVibD', mix: 'vMix', drive: 'vDrive', bit: 'vBit', gain: 'vGain', revSz: 'vRevSz', revMx: 'vRevMx', delay: 'vDelay' };

function displayParam(k, v) { const el = document.getElementById(IDS[k]); if (el && FMT[k]) el.textContent = FMT[k](v); }

function up(k, v) {
    params[k] = parseFloat(v);
    displayParam(k, v);
    applyAudio();
}

// -══════════════
//  AUDIO ENGINE
// -══════════════
let ctx_ = null, stream_ = null, source_ = null, analyser_ = null, pitchAn_ = null;
let dist_ = null, revNode_ = null, revGain_ = null, dryGain_ = null, delayNode_ = null, delayFB_ = null, outGain_ = null;
let vibOsc_ = null, vibGain_ = null;
let running = false, rafId = null;

async function toggleMic() {
    if (running) { stopMic(); return; }
    try {
        ctx_ = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        stream_ = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
        buildGraph();
        running = true;
        document.getElementById('micBtn').classList.add('active');
        document.getElementById('micLabel').textContent = '🔴 Live';
        document.getElementById('micLabel').classList.add('on');
        document.getElementById('micTitle').textContent = 'Mic Active - Speak or Sing!';
        document.getElementById('micDesc').textContent = 'Your voice is being processed live. Pick a preset below or adjust sliders. Wear headphones to avoid feedback!';
        document.getElementById('vizIdle').classList.add('hidden');
        startViz(); startPitch();
    } catch (e) {
        alert('Could not access microphone.\n\nPlease:\n• Click Allow when the browser asks\n• Check your browser mic permissions\n• Try Chrome or Edge if on another browser');
    }
}

function stopMic() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream_) stream_.getTracks().forEach(t => t.stop());
    if (ctx_) ctx_.close();
    ctx_ = stream_ = source_ = analyser_ = pitchAn_ = dist_ = revNode_ = revGain_ = dryGain_ = delayNode_ = delayFB_ = outGain_ = vibOsc_ = vibGain_ = null;
    document.getElementById('micBtn').classList.remove('active');
    document.getElementById('micLabel').textContent = 'Tap to Start';
    document.getElementById('micLabel').classList.remove('on');
    document.getElementById('micTitle').textContent = 'Activate Your Microphone';
    document.getElementById('micDesc').innerHTML = 'Hit the button on the left to grant mic access and start the voice engine. <strong>Wear headphones</strong> so your speakers don\'t feed back into the mic.';
    document.getElementById('vizIdle').classList.remove('hidden');
    document.getElementById('pitchNote').textContent = '-';
    document.getElementById('pitchHz').textContent = '- Hz';
    document.getElementById('pitchCents').textContent = 'Sing to detect';
    clearCanvas();
}

function buildGraph() {
    source_ = ctx_.createMediaStreamSource(stream_);
    analyser_ = ctx_.createAnalyser(); analyser_.fftSize = 2048;
    pitchAn_ = ctx_.createAnalyser(); pitchAn_.fftSize = 2048;
    dist_ = ctx_.createWaveShaper(); dist_.oversample = '4x'; dist_.curve = dCurve(0);
    outGain_ = ctx_.createGain(); outGain_.gain.value = 1;
    revNode_ = ctx_.createConvolver(); revNode_.buffer = impulse(2);
    revGain_ = ctx_.createGain(); revGain_.gain.value = 0.2;
    dryGain_ = ctx_.createGain(); dryGain_.gain.value = 0.9;
    delayNode_ = ctx_.createDelay(2); delayNode_.delayTime.value = 0;
    delayFB_ = ctx_.createGain(); delayFB_.gain.value = 0.3;
    vibOsc_ = ctx_.createOscillator(); vibOsc_.frequency.value = 0;
    vibGain_ = ctx_.createGain(); vibGain_.gain.value = 0;
    vibOsc_.connect(vibGain_); vibOsc_.start();

    source_.connect(pitchAn_);
    source_.connect(analyser_);
    source_.connect(dist_);
    dist_.connect(dryGain_); dryGain_.connect(outGain_);
    dist_.connect(revNode_); revNode_.connect(revGain_); revGain_.connect(outGain_);
    dist_.connect(delayNode_); delayNode_.connect(delayFB_); delayFB_.connect(delayNode_); delayNode_.connect(outGain_);
    outGain_.connect(ctx_.destination);
    applyAudio();
}

function applyAudio() {
    if (!ctx_ || !running) return;
    if (dist_) dist_.curve = dCurve(params.drive);
    if (outGain_) outGain_.gain.setTargetAtTime(db2lin(params.gain), ctx_.currentTime, 0.02);
    if (revGain_) revGain_.gain.setTargetAtTime(fx.reverb ? params.revMx / 100 : 0, ctx_.currentTime, 0.05);
    if (dryGain_) dryGain_.gain.setTargetAtTime(1 - (fx.reverb ? params.revMx / 200 : 0), ctx_.currentTime, 0.05);
    if (revNode_) try { revNode_.buffer = impulse(0.5 + params.revSz / 100 * 3); } catch (e) { }
    if (delayNode_) delayNode_.delayTime.setTargetAtTime(params.delay / 1000, ctx_.currentTime, 0.02);
    if (vibOsc_) vibOsc_.frequency.setTargetAtTime(params.vibR, ctx_.currentTime, 0.02);
    if (vibGain_) vibGain_.gain.setTargetAtTime(params.vibD * 50, ctx_.currentTime, 0.02);
}

function dCurve(amount) {
    const k = amount * 3, n = 256, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; c[i] = k === 0 ? x : (Math.PI + k) * x / (Math.PI + k * Math.abs(x)); }
    return c;
}
function impulse(dur) {
    const sr = ctx_.sampleRate, len = Math.floor(sr * dur), b = ctx_.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++)d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
    return b;
}
function db2lin(db) { return Math.pow(10, db / 20); }

// -══════════════
//  PITCH DETECTION
// -══════════════
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function freq2note(f) {
    const n = 12 * (Math.log(f / 440) / Math.log(2));
    const r = Math.round(n) + 69;
    const name = NOTES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1);
    const cents = Math.round((n - Math.round(n)) * 100);
    return { name, cents };
}
function autoCorr(buf, sr) {
    const sz = buf.length;
    const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / sz);
    if (rms < 0.008) return -1;
    const c = new Float32Array(sz);
    for (let lag = 0; lag < sz; lag++) { let s = 0; for (let i = 0; i < sz - lag; i++)s += buf[i] * buf[i + lag]; c[lag] = s; }
    let d = false, mx = -1, ml = -1;
    for (let i = 1; i < sz; i++) {
        if (!d && c[i] < c[i - 1]) d = true;
        if (d && c[i] > mx && c[i] > c[0] * 0.5) { mx = c[i]; ml = i; }
        if (d && c[i] < mx * 0.5 && ml !== -1) break;
    }
    if (ml < 2) return -1;
    const y1 = c[ml - 1], y2 = c[ml], y3 = c[ml + 1];
    const refined = ml - 0.5 * (y3 - y1) / (y3 - 2 * y2 + y1);
    return sr / refined;
}
function startPitch() {
    const buf = new Float32Array(pitchAn_.fftSize);
    (function loop() {
        if (!running) return;
        pitchAn_.getFloatTimeDomainData(buf);
        const f = autoCorr(buf, ctx_.sampleRate);
        if (f > 60 && f < 1200) {
            const { name, cents } = freq2note(f);
            document.getElementById('pitchNote').textContent = name;
            document.getElementById('pitchHz').textContent = f.toFixed(1) + ' Hz';
            document.getElementById('pitchCents').textContent = `${cents > 0 ? '+' : ''}${cents} cents ${Math.abs(cents) < 10 ? '✅ In tune' : Math.abs(cents) < 25 ? '⚠️ Close' : '❌ Off'}`;
            drawTuner(cents);
        }
        setTimeout(loop, 60);
    })();
}

// -══════════════
//  VISUALIZER
// -══════════════
function startViz() {
    const cv = document.getElementById('vizCanvas');
    const g = cv.getContext('2d');
    function resize() { cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio; }
    resize();
    window.addEventListener('resize', resize);
    const tArr = new Float32Array(analyser_.fftSize);
    const fArr = new Uint8Array(analyser_.frequencyBinCount);
    (function draw() {
        if (!running) return;
        rafId = requestAnimationFrame(draw);
        const W = cv.width, H = cv.height;
        g.fillStyle = '#0a0a12'; g.fillRect(0, 0, W, H);
        // freq bars
        analyser_.getByteFrequencyData(fArr);
        const bw = W / fArr.length * 2.5, nb = Math.floor(W / (bw + 1));
        for (let i = 0; i < nb; i++) { const v = fArr[i] / 255; g.fillStyle = `hsla(${260 + v * 60},80%,${50 + v * 30}%,${0.3 + v * 0.4})`; g.fillRect(i * (bw + 1), H - v * H * 0.6, bw, v * H * 0.6); }
        // waveform
        analyser_.getFloatTimeDomainData(tArr);
        g.beginPath(); g.strokeStyle = 'rgba(124,58,237,0.9)'; g.lineWidth = 1.5 * devicePixelRatio; g.shadowColor = '#7c3aed'; g.shadowBlur = 10;
        const step = W / tArr.length;
        for (let i = 0; i < tArr.length; i++) { const x = i * step, y = (1 - (tArr[i] + 1) / 2) * H; i === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.stroke(); g.shadowBlur = 0;
        // mirror
        g.beginPath(); g.strokeStyle = 'rgba(6,182,212,0.35)'; g.lineWidth = devicePixelRatio;
        for (let i = 0; i < tArr.length; i++) { const x = i * step, y = (1 - (-tArr[i] + 1) / 2) * H; i === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.stroke();
    })();
}
function clearCanvas() {
    const cv = document.getElementById('vizCanvas');
    const g = cv.getContext('2d');
    g.fillStyle = '#0a0a12'; g.fillRect(0, 0, cv.width, cv.height);
}

// ── Tuner
function drawTuner(cents) {
    const cv = document.getElementById('tunerCanvas');
    const g = cv.getContext('2d');
    const W = cv.width, H = cv.height, cx = W / 2;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#0f0f1a'; g.beginPath(); if (g.roundRect) g.roundRect(0, 0, W, H, 6); else g.rect(0, 0, W, H); g.fill();
    // ticks
    for (let t = -5; t <= 5; t++) {
        const x = cx + (t / 5) * (W / 2 - 20);
        g.strokeStyle = t === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)';
        g.lineWidth = t === 0 ? 2 : 1;
        g.beginPath(); g.moveTo(x, H * .2); g.lineTo(x, H * .8); g.stroke();
    }
    // centre label
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.font = '9px Rajdhani'; g.textAlign = 'center';
    g.fillText('♭ FLAT', cx - 40, H - 4); g.fillText('SHARP ♯', cx + 40, H - 4);
    // needle
    const cl = Math.max(-50, Math.min(50, cents));
    const nx = cx + (cl / 50) * (W / 2 - 20);
    const col = Math.abs(cents) < 10 ? '#22c55e' : Math.abs(cents) < 25 ? '#f59e0b' : '#ef4444';
    g.strokeStyle = col; g.lineWidth = 3; g.shadowColor = col; g.shadowBlur = 14;
    g.beginPath(); g.moveTo(nx, H * .1); g.lineTo(nx, H * .9); g.stroke();
    g.shadowBlur = 0;
    if (Math.abs(cents) < 10) { g.fillStyle = '#22c55e'; g.font = 'bold 10px Rajdhani'; g.textAlign = 'center'; g.fillText('IN TUNE ✓', cx, H - 4); }
}

// -══════════════
//  SPLASH
// -══════════════
function closeSplash() {
    document.getElementById('splash').classList.add('gone');
}

// -══════════════
//  INIT
// -══════════════
buildFx();
buildPresets();
Object.keys(params).forEach(k => displayParam(k, params[k]));
// draw empty tuner
drawTuner(0);
// init viz canvas
const _cv = document.getElementById('vizCanvas');
_cv.width = _cv.offsetWidth * devicePixelRatio || 800;
_cv.height = _cv.offsetHeight * devicePixelRatio || 140;
clearCanvas();