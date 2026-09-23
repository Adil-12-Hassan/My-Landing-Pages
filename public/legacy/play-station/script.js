// Global Variables
let audioContext;
let audioBuffer;
let sourceNode;
let analyser;
let isPlaying = false;
let isPaused = false;
let isPitchAnalyzing = false;
let animationId;
let startTime = 0;
let pauseTime = 0;
let currentTime = 0;
let isDragging = false;
let originalFileName = '';
let ffmpeg = null;
let ffmpegLoaded = false;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const audioFile = document.getElementById('audioFile');
const fileName = document.getElementById('fileName');
const waveformCanvas = document.getElementById('waveformCanvas');
const ctx = waveformCanvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const convertBtn = document.getElementById('convertBtn');
const trimBtn = document.getElementById('trimBtn');
const applyEffectsBtn = document.getElementById('applyEffectsBtn');
const pitchDisplay = document.getElementById('pitchDisplay');
const pitchValue = document.getElementById('pitchValue');
const pitchNote = document.getElementById('pitchNote');
const timelineWrapper = document.getElementById('timelineWrapper');
const timelineProgress = document.getElementById('timelineProgress');
const timelineHandle = document.getElementById('timelineHandle');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const totalTimeDisplay = document.getElementById('totalTimeDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const progressBarLoading = document.getElementById('progressBarLoading');

// Initialize Audio Context
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            alert('Web Audio API is not supported in this browser. Please use a modern browser.');
            return false;
        }
    }
    return true;
}

// Initialize FFmpeg
async function loadFFmpeg() {
    if (ffmpegLoaded) return true;

    showLoading('Initializing FFmpeg (first time only)...', 0);

    try {
        const { FFmpeg } = FFmpegWASM;
        ffmpeg = new FFmpeg();

        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            const percentage = Math.round(progress * 100);
            updateProgress(percentage);
        });

        await ffmpeg.load();
        ffmpegLoaded = true;
        hideLoading();
        return true;
    } catch (error) {
        console.error('FFmpeg loading error:', error);
        hideLoading();
        alert('Failed to load FFmpeg. Please refresh the page.');
        return false;
    }
}

// Show Loading Overlay
function showLoading(text, progress = 0) {
    loadingOverlay.classList.add('active');
    loadingText.textContent = text;
    progressBarLoading.style.width = progress + '%';
}

// Hide Loading Overlay
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Update Progress Bar
function updateProgress(percentage) {
    progressBarLoading.style.width = percentage + '%';
}

// Upload Area Events
uploadArea.addEventListener('click', () => audioFile.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

audioFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Handle File Upload
async function handleFileUpload(file) {
    originalFileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    fileName.textContent = file.name;

    if (!initAudioContext()) {
        return;
    }

    showLoading('Loading audio file...', 10);

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            updateProgress(50);
            audioBuffer = await audioContext.decodeAudioData(e.target.result);
            updateProgress(90);
            drawWaveform(audioBuffer);
            enableControls();

            document.getElementById('trimEnd').value = audioBuffer.duration.toFixed(2);
            totalTimeDisplay.textContent = formatTime(audioBuffer.duration);

            updateProgress(100);
            hideLoading();
        } catch (error) {
            hideLoading();
            alert('Error loading audio file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Draw Waveform
function drawWaveform(buffer) {
    const width = waveformCanvas.width = waveformCanvas.offsetWidth * 2;
    const height = waveformCanvas.height = 400;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }

        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(123, 44, 191, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.3)');
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
}

// Enable Controls
function enableControls() {
    playBtn.disabled = false;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    analyzeBtn.disabled = false;
    convertBtn.disabled = false;
    trimBtn.disabled = false;
    applyEffectsBtn.disabled = false;
}

// Play Audio
playBtn.addEventListener('click', () => {
    if (!audioBuffer) return;

    if (isPaused) {
        playFromTime(pauseTime);
        isPaused = false;
    } else {
        playFromTime(pauseTime);
    }
});

function playFromTime(time) {
    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) {
            // Ignore errors
        }
    }

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    startTime = audioContext.currentTime - time;
    sourceNode.start(0, time);
    isPlaying = true;
    isPaused = false;

    sourceNode.onended = () => {
        if (isPlaying && !isDragging) {
            isPlaying = false;
            isPaused = false;
            pauseTime = 0;
            updateTimeline(0);
        }
    };

    updateProgress();
}

// Pause Audio
pauseBtn.addEventListener('click', () => {
    if (sourceNode && isPlaying) {
        const elapsed = audioContext.currentTime - startTime;
        pauseTime = Math.min(elapsed, audioBuffer.duration);

        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) {
            // Ignore errors
        }

        isPlaying = false;
        isPaused = true;

        cancelAnimationFrame(animationId);
        updateTimeline(pauseTime);
    }
});

// Stop Audio
stopBtn.addEventListener('click', () => {
    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) {
            // Ignore errors
        }
        isPlaying = false;
        isPaused = false;
        pauseTime = 0;
        cancelAnimationFrame(animationId);
        updateTimeline(0);
    }
});

// Update Progress
function updateProgress() {
    if (!isPlaying) return;

    currentTime = audioContext.currentTime - startTime;
    const duration = audioBuffer.duration;

    if (currentTime < duration) {
        updateTimeline(currentTime);
        animationId = requestAnimationFrame(updateProgress);
    } else {
        isPlaying = false;
        isPaused = false;
        pauseTime = 0;
        updateTimeline(0);
    }
}

// Update Timeline Display
function updateTimeline(time) {
    if (!audioBuffer) return;

    const duration = audioBuffer.duration;
    const percentage = (time / duration) * 100;

    timelineProgress.style.width = percentage + '%';
    timelineHandle.style.left = percentage + '%';
    currentTimeDisplay.textContent = formatTime(time);
}

// Timeline Interaction
timelineWrapper.addEventListener('mousedown', (e) => {
    if (!audioBuffer) return;

    isDragging = true;
    const wasPlaying = isPlaying;

    if (isPlaying) {
        pauseBtn.click();
    }

    seekToPosition(e);

    const handleMouseMove = (e) => {
        if (isDragging) {
            seekToPosition(e);
        }
    };

    const handleMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        if (wasPlaying) {
            playBtn.click();
        }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
});

function seekToPosition(e) {
    const rect = timelineWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * audioBuffer.duration;

    pauseTime = newTime;
    updateTimeline(newTime);
}

// Touch Support
timelineWrapper.addEventListener('touchstart', (e) => {
    if (!audioBuffer) return;
    e.preventDefault();

    isDragging = true;
    const wasPlaying = isPlaying;

    if (isPlaying) {
        pauseBtn.click();
    }

    seekToPositionTouch(e.touches[0]);

    const handleTouchMove = (e) => {
        if (isDragging) {
            seekToPositionTouch(e.touches[0]);
        }
    };

    const handleTouchEnd = () => {
        isDragging = false;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);

        if (wasPlaying) {
            playBtn.click();
        }
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
});

function seekToPositionTouch(touch) {
    const rect = timelineWrapper.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * audioBuffer.duration;

    pauseTime = newTime;
    updateTimeline(newTime);
}

// Format Time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Pitch Analysis
analyzeBtn.addEventListener('click', () => {
    if (!audioBuffer) return;

    isPitchAnalyzing = !isPitchAnalyzing;

    if (isPitchAnalyzing) {
        pitchDisplay.style.display = 'block';
        analyzeBtn.textContent = '⏹️ Stop Analysis';

        if (!isPlaying) {
            playBtn.click();
        }

        analyzePitch();
    } else {
        pitchDisplay.style.display = 'none';
        analyzeBtn.textContent = '📊 Analyze Pitch';
    }
});

function analyzePitch() {
    if (!isPitchAnalyzing || !analyser) {
        return;
    }

    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(buffer);

    const pitch = autoCorrelate(buffer, audioContext.sampleRate);

    if (pitch > 0) {
        const note = getNoteFromPitch(pitch);
        pitchValue.textContent = pitch.toFixed(2) + ' Hz';
        pitchNote.textContent = note;
    } else {
        pitchValue.textContent = '--';
        pitchNote.textContent = '--';
    }

    if (isPitchAnalyzing) {
        requestAnimationFrame(analyzePitch);
    }
}

// Auto-correlation for pitch detection
function autoCorrelate(buffer, sampleRate) {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }

    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] += buffer[j] * buffer[j + i];
        }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }

    let T0 = maxpos;
    if (T0 === 0) return -1;

    return sampleRate / T0;
}

// Get Note from Pitch
function getNoteFromPitch(frequency) {
    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const note = Math.round(noteNum) + 69;
    const octave = Math.floor(note / 12) - 1;
    return noteStrings[note % 12] + octave;
}

// Format Conversion with FFmpeg
convertBtn.addEventListener('click', async () => {
    if (!audioBuffer) return;

    // Load FFmpeg if not already loaded
    if (!ffmpegLoaded) {
        const loaded = await loadFFmpeg();
        if (!loaded) return;
    }

    const format = document.getElementById('outputFormat').value;
    const bitrate = document.getElementById('bitrate').value + 'k';

    showLoading(`Converting to ${format.toUpperCase()}...`, 0);

    try {
        // Convert AudioBuffer to WAV
        const wavBuffer = audioBufferToWav(audioBuffer);
        const inputName = 'input.wav';
        const outputName = `output.${format}`;

        // Write input file
        await ffmpeg.writeFile(inputName, new Uint8Array(wavBuffer));

        // Build FFmpeg command
        let args = ['-i', inputName, '-b:a', bitrate];

        // Format-specific options
        if (format === 'mp3') {
            args.push('-codec:a', 'libmp3lame');
        } else if (format === 'aac' || format === 'm4a') {
            args.push('-codec:a', 'aac');
        } else if (format === 'ogg') {
            args.push('-codec:a', 'libvorbis');
        } else if (format === 'flac') {
            args.push('-codec:a', 'flac');
        }

        args.push(outputName);

        // Execute conversion
        await ffmpeg.exec(args);

        // Read output file
        const data = await ffmpeg.readFile(outputName);

        // Create download
        const blob = new Blob([data.buffer], {
            type: `audio/${format}`
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalFileName || 'converted'}.${format}`;
        a.click();

        URL.revokeObjectURL(url);

        // Cleanup
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        hideLoading();
        alert(`Successfully converted to ${format.toUpperCase()}!`);

    } catch (error) {
        hideLoading();
        console.error('Conversion error:', error);
        alert('Conversion failed: ' + error.message);
    }
});

// Audio Buffer to WAV
function audioBufferToWav(buffer) {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return arrayBuffer;
}

// Trim Audio
trimBtn.addEventListener('click', () => {
    if (!audioBuffer) return;

    const start = parseFloat(document.getElementById('trimStart').value);
    const end = parseFloat(document.getElementById('trimEnd').value);

    if (start >= end) {
        alert('Start time must be less than end time!');
        return;
    }

    if (end > audioBuffer.duration) {
        alert('End time cannot exceed audio duration!');
        return;
    }

    showLoading('Trimming audio...', 50);

    const startSample = Math.floor(start * audioBuffer.sampleRate);
    const endSample = Math.floor(end * audioBuffer.sampleRate);
    const duration = endSample - startSample;

    const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        duration,
        audioBuffer.sampleRate
    );

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const trimmedData = trimmedBuffer.getChannelData(i);
        for (let j = 0; j < duration; j++) {
            trimmedData[j] = channelData[startSample + j];
        }
    }

    audioBuffer = trimmedBuffer;
    drawWaveform(audioBuffer);

    document.getElementById('trimEnd').value = audioBuffer.duration.toFixed(2);
    document.getElementById('trimStart').value = '0';
    totalTimeDisplay.textContent = formatTime(audioBuffer.duration);

    stopBtn.click();

    hideLoading();
    alert('Audio trimmed successfully!');
});

// Sliders
document.getElementById('bitrate').addEventListener('input', (e) => {
    document.getElementById('bitrateValue').textContent = e.target.value + ' kbps';
});

document.getElementById('volume').addEventListener('input', (e) => {
    document.getElementById('volumeValue').textContent = e.target.value + '%';
});

document.getElementById('speed').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + 'x';
});

// Effect Buttons
document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
    });
});

// Apply Effects
applyEffectsBtn.addEventListener('click', () => {
    if (!audioBuffer) return;

    if (isPlaying) {
        stopBtn.click();
    }

    showLoading('Applying effects...', 30);

    setTimeout(() => {
        const newBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            const channelData = audioBuffer.getChannelData(i);
            const newChannelData = newBuffer.getChannelData(i);
            newChannelData.set(channelData);
        }

        audioBuffer = newBuffer;

        updateProgress(50);

        // Apply volume
        const volume = document.getElementById('volume').value / 100;
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            const channelData = audioBuffer.getChannelData(i);
            for (let j = 0; j < channelData.length; j++) {
                channelData[j] *= volume;
            }
        }

        updateProgress(70);

        // Apply active effects
        document.querySelectorAll('.effect-btn.active').forEach(btn => {
            const effect = btn.dataset.effect;
            applyEffect(effect);
        });

        updateProgress(90);

        drawWaveform(audioBuffer);

        document.getElementById('volume').value = 100;
        document.getElementById('volumeValue').textContent = '100%';
        document.querySelectorAll('.effect-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });

        updateProgress(100);
        hideLoading();
        alert('Effects applied successfully!');
    }, 100);
});

function applyEffect(effect) {
    if (!audioBuffer) return;

    switch (effect) {
        case 'normalize':
            normalizeAudio();
            break;
        case 'fadeIn':
            fadeIn();
            break;
        case 'fadeOut':
            fadeOut();
            break;
        case 'reverse':
            reverseAudio();
            break;
        case 'bassBoost':
            bassBoost();
            break;
        case 'trebleBoost':
            trebleBoost();
            break;
    }
}

function normalizeAudio() {
    let max = 0;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        for (let j = 0; j < data.length; j++) {
            if (Math.abs(data[j]) > max) max = Math.abs(data[j]);
        }
    }

    if (max === 0) return;

    const scale = 0.95 / max;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        for (let j = 0; j < data.length; j++) {
            data[j] *= scale;
        }
    }
}

function fadeIn() {
    const fadeLength = Math.min(audioBuffer.sampleRate * 2, audioBuffer.length);
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        for (let j = 0; j < fadeLength; j++) {
            data[j] *= (j / fadeLength);
        }
    }
}

function fadeOut() {
    const fadeLength = Math.min(audioBuffer.sampleRate * 2, audioBuffer.length);
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        const start = Math.max(0, data.length - fadeLength);
        for (let j = start; j < data.length; j++) {
            data[j] *= (1 - ((j - start) / fadeLength));
        }
    }
}

function reverseAudio() {
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        Array.prototype.reverse.call(data);
    }
}

function bassBoost() {
    // Simple bass boost by amplifying lower frequencies
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        for (let j = 0; j < data.length - 1; j++) {
            // Low-pass filter approximation
            data[j] = (data[j] + data[j + 1]) / 2 * 1.5;
        }
    }
}

function trebleBoost() {
    // Simple treble boost by amplifying differences
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const data = audioBuffer.getChannelData(i);
        for (let j = 1; j < data.length; j++) {
            // High-pass filter approximation
            data[j] = (data[j] - data[j - 1]) * 1.5 + data[j];
        }
    }
}

// Canvas resize
window.addEventListener('resize', () => {
    if (audioBuffer) {
        drawWaveform(audioBuffer);
    }
});

// Initialize
window.addEventListener('load', () => {
    waveformCanvas.width = waveformCanvas.offsetWidth * 2;
    waveformCanvas.height = 400;
});