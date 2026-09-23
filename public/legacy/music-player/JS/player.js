/**
 * player.js
 * Audio engine - wraps the native <audio> element.
 * All actual DOM updates are delegated back to ui.js via callbacks.
 * Author: adil12hassan
 */

import { getCurrentSong, nextTrack, prevTrack, goToTrack, removeSong, setPlaying, isPlaying } from './playlist.js';
import { renderNowPlaying, renderEmptyNowPlaying, renderPlaylist, updateProgress, setPlayBtnState } from './ui.js';

const audio = document.getElementById('audio-player');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Load a song into the audio element & optionally auto-play */
function loadSong(song, autoPlay = false) {
  if (!song) return;
  audio.src = song.src;
  audio.load();

  renderNowPlaying(song);
  renderPlaylist();            // re-render so .active class moves

  if (autoPlay) {
    playSong();
  } else {
    setPlaying(false);
    setPlayBtnState(false);
  }
}

/** Start playback */
function playSong() {
  audio.play()
    .then(() => {
      setPlaying(true);
      setPlayBtnState(true);
    })
    .catch((err) => {
      console.warn('[Player] play() blocked or failed:', err);
    });
}

/** Pause playback */
function pauseSong() {
  audio.pause();
  setPlaying(false);
  setPlayBtnState(false);
}

/** Format seconds → "m:ss" */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Toggle play / pause */
export function togglePlay() {
  if (!getCurrentSong()) return;
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

/** Skip to the next track */
export function skipNext() {
  const song = nextTrack();
  loadSong(song, true);        // always auto-play on skip
}

/** Go back to the previous track */
export function skipPrev() {
  // If more than 3 s have played, restart current track instead
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const song = prevTrack();
  loadSong(song, true);
}

/** Select a specific song by index (called from playlist click) */
export function selectSong(index) {
  const song = goToTrack(index);
  loadSong(song, true);
}

/** Remove a track and update the audio element if it was selected. */
export async function removeTrack(index) {
  const result = await removeSong(index);
  if (!result) return;

  if (result.wasCurrent) {
    const shouldPlay = isPlaying();
    audio.pause();
    if (result.song) {
      loadSong(result.song, shouldPlay);
    } else {
      audio.removeAttribute('src');
      setPlaying(false);
      setPlayBtnState(false);
      renderEmptyNowPlaying();
      renderPlaylist();
    }
  } else {
    renderPlaylist();
  }
}

/** Seek to position when user drags the progress bar */
export function seek(value) {
  if (!isNaN(audio.duration)) {
    audio.currentTime = (value / 100) * audio.duration;
  }
}

/** Set volume (0 – 1) */
export function setVolume(value) {
  audio.volume = value;
}

/** Bootstrap - wire up all audio events & load first song */
export function initPlayer() {
  // ── Progress updates ────────────────────────────────────────────────────
  audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      const current = formatTime(audio.currentTime);
      const total = formatTime(audio.duration);
      updateProgress(pct, current, total);
    }
  });

  // ── Auto-advance when track ends ────────────────────────────────────────
  audio.addEventListener('ended', () => {
    skipNext();
  });

  // ── Reset UI when a new src starts buffering ────────────────────────────
  audio.addEventListener('loadstart', () => {
    updateProgress(0, '0:00', '0:00');
  });

  // ── Progress bar (seek) ────────────────────────────────────────────────
  progressBar.addEventListener('input', (e) => {
    seek(Number(e.target.value));
  });

  // ── Volume bar ─────────────────────────────────────────────────────────
  volumeBar.addEventListener('input', (e) => {
    setVolume(Number(e.target.value));
  });

  // ── Play / Pause button ────────────────────────────────────────────────
  document.getElementById('play-btn').addEventListener('click', togglePlay);

  // ── Previous / Next buttons ───────────────────────────────────────────
  document.getElementById('previous-btn').addEventListener('click', skipPrev);
  document.getElementById('next-btn').addEventListener('click', skipNext);

  window.addEventListener('songadded', () => {
    loadSong(getCurrentSong(), false);
  });

  // ── Load the first song (without auto-play - browsers block it) ────────
  loadSong(getCurrentSong(), false);
}
