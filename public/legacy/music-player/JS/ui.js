/**
 * ui.js
 * Pure DOM rendering - zero audio logic lives here.
 * Every function receives data and paints it; nothing more.
 * Author: adil12hassan
 */

import { songs, getState, addSong, sortSongs } from './playlist.js';
import { selectSong, removeTrack } from './player.js';

// ─── Cached DOM references ────────────────────────────────────────────────────
const albumCover    = document.getElementById('album-cover');
const songTitle     = document.getElementById('song-title');
const songArtist    = document.getElementById('song-artist');
const playBtn       = document.getElementById('play-btn');
const progressBar   = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDuration = document.getElementById('total-duration');
const playlistEl    = document.getElementById('playlist');
const playlistCount = document.getElementById('playlist-count');
const searchInput = document.getElementById('playlist-search');
const sortSelect = document.getElementById('playlist-sort');
const audioFileInput = document.getElementById('audio-file');
const audioFileLabel = audioFileInput?.closest('.file-picker')?.querySelector('span');
const coverFileInput = document.getElementById('cover-file');
const coverFileLabel = coverFileInput?.closest('.file-picker')?.querySelector('span');

// ─── Now Playing ─────────────────────────────────────────────────────────────

/**
 * Update the "Now Playing" card with the given song data.
 * @param {Object} song
 */
export function renderNowPlaying(song) {
  albumCover.src = song.cover;
  albumCover.onerror = () => {
    albumCover.src = 'assets/images/covers/cover1.jpg';
  };
  albumCover.alt = `${song.title} album cover`;
  songTitle.textContent  = song.title;
  songArtist.textContent = song.artist;

  // Spin the album art once when a new song loads
  albumCover.classList.remove('spin');
  // Force reflow so the animation restarts
  void albumCover.offsetWidth;
  albumCover.classList.add('spin');

  // Update the browser tab title
  document.title = `${song.title} - ${song.artist}`;
}

export function renderEmptyNowPlaying() {
  albumCover.src = 'assets/images/covers/cover1.jpg';
  albumCover.alt = 'No song selected';
  songTitle.textContent = 'No Song Selected';
  songArtist.textContent = 'Unknown Artist';
  document.title = 'Music Player';
}

// ─── Play / Pause button label ───────────────────────────────────────────────

/**
 * Toggle the Play button between "Play" and "Pause".
 * @param {boolean} playing
 */
export function setPlayBtnState(playing) {
  playBtn.textContent = playing ? 'Pause' : 'Play';
  playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

/**
 * Reflect playback position in the UI.
 * @param {number} pct          0 – 100
 * @param {string} current      formatted "m:ss"
 * @param {string} total        formatted "m:ss"
 */
export function updateProgress(pct, current, total) {
  progressBar.value       = pct;
  currentTimeEl.textContent = current;
  totalDuration.textContent = total;

  // Paint a filled track so the user can see progress clearly
  const pctStr = `${pct}%`;
  progressBar.style.background = `linear-gradient(to right, var(--accent) ${pctStr}, rgba(245,244,237,0.14) ${pctStr})`;
}

// ─── Playlist ─────────────────────────────────────────────────────────────────

/**
 * (Re-)render the entire playlist, marking the active track.
 */
export function renderPlaylist() {
  const { currentIndex } = getState();
  const query = searchInput?.value.trim().toLowerCase() || '';
  const visibleSongs = songs
    .map((song, index) => ({ song, index }))
    .filter(({ song }) => `${song.title} ${song.artist}`.toLowerCase().includes(query));

  // Update song count badge
  const count = songs.length;
  playlistCount.textContent = `${count} Song${count !== 1 ? 's' : ''}`;

  // Clear existing items
  playlistEl.innerHTML = '';

  visibleSongs.forEach(({ song, index }) => {
    const item = document.createElement('div');
    item.className = `playlist-item${index === currentIndex ? ' active' : ''}`;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Play ${song.title} by ${song.artist}`);
    item.dataset.index = index;

    const cover = document.createElement('img');
    cover.src = song.cover;
    cover.onerror = () => {
      cover.src = 'assets/images/covers/cover1.jpg';
    };
    cover.alt = `${song.title} cover`;
    cover.loading = 'lazy';
    const info = document.createElement('div');
    info.className = 'playlist-item-info';
    const title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = song.title;
    const artist = document.createElement('div');
    artist.className = 'playlist-item-artist';
    artist.textContent = song.artist;
    info.append(title, artist);
    const renameButton = document.createElement('button');
    renameButton.type = 'button';
    renameButton.className = 'rename-btn';
    renameButton.setAttribute('aria-label', `Rename ${song.title}`);
    renameButton.textContent = 'Rename';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-btn';
    removeButton.setAttribute('aria-label', `Remove ${song.title}`);
    removeButton.textContent = 'Remove';
    item.append(cover, info, renameButton, removeButton);

    // Click handler
    item.addEventListener('click', () => selectSong(index));
    renameButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const editor = document.createElement('input');
      editor.type = 'text';
      editor.value = song.title;
      editor.className = 'rename-input';
      editor.setAttribute('aria-label', 'New song title');
      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.className = 'rename-btn';
      saveButton.textContent = 'Save';
      const save = () => {
        const nextTitle = editor.value.trim();
        if (nextTitle) song.title = nextTitle;
        renderPlaylist();
      };
      saveButton.addEventListener('click', (saveEvent) => {
        saveEvent.stopPropagation();
        save();
      });
      editor.addEventListener('keydown', (keyEvent) => {
        if (keyEvent.key === 'Enter') save();
        if (keyEvent.key === 'Escape') renderPlaylist();
      });
      title.replaceWith(editor);
      renameButton.replaceWith(saveButton);
      editor.focus();
    });
    removeButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      await removeTrack(index);
    });

    // Keyboard accessibility - Enter / Space
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectSong(index);
      }
    });

    playlistEl.appendChild(item);
  });

  // Scroll active item into view (smooth)
  const activeItem = playlistEl.querySelector('.playlist-item.active');
  activeItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getCover(file, url) {
  if (file) return URL.createObjectURL(file);
  return url.trim() || 'assets/images/covers/cover1.jpg';
}

function resetFilePickerLabels() {
  audioFileLabel.textContent = 'Choose audio';
  coverFileLabel.textContent = 'Choose cover';
}

audioFileInput?.addEventListener('change', () => {
  audioFileLabel.textContent = audioFileInput.files[0]?.name || 'Choose audio';
});

coverFileInput?.addEventListener('change', () => {
  coverFileLabel.textContent = coverFileInput.files[0]?.name || 'Choose cover';
});

document.getElementById('add-song-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const audioFile = document.getElementById('audio-file').files[0];
  if (!audioFile) return;

  const titleInput = document.getElementById('song-title-input');
  const artistInput = document.getElementById('song-artist-input');
  const coverFile = document.getElementById('cover-file').files[0];
  const coverUrl = document.getElementById('cover-url-input').value;
  const title = titleInput.value.trim() || audioFile.name.replace(/\.[^/.]+$/, '');

  addSong({
    title,
    artist: artistInput.value.trim() || 'Unknown Artist',
    src: URL.createObjectURL(audioFile),
    cover: getCover(coverFile, coverUrl),
    audioBlob: audioFile,
    coverBlob: coverFile || null,
    duration: null,
  });
  event.target.reset();
  resetFilePickerLabels();
  renderPlaylist();
  window.dispatchEvent(new CustomEvent('songadded'));
});

searchInput?.addEventListener('input', renderPlaylist);
sortSelect?.addEventListener('change', (event) => {
  sortSongs(event.target.value);
  renderPlaylist();
});
