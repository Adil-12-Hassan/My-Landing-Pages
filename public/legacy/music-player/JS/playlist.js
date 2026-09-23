/**
 * playlist.js
 * Song data + playlist state management
 * Author: adil12hassan
 */

export const songs = [
  {
    id: 1,
    title: "Midnight Groove",
    artist: "The Night Owls",
    src: "assets/audios/Song1.mpeg",
    cover: "assets/images/covers/cover1.jpg",
    duration: null, // resolved at runtime by the Audio API
  },
  // ─── Add more songs here ──────────────────────────────────────────────────
  // {
  //   id: 2,
  //   title: "Summer Vibes",
  //   artist: "Solar Beats",
  //   src: "assets/audios/Song2.mp3",
  //   cover: "assets/images/covers/cover2.jpg",
  //   duration: null,
  // },
];

/** Playlist state - single source of truth */
const state = {
  currentIndex: 0,
  isPlaying: false,
  isShuffled: false,
  shuffledOrder: [],
};

const databaseName = 'music-player';
const databaseVersion = 1;
const songStoreName = 'songs';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(songStoreName, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStoredSongs(database) {
  return new Promise((resolve, reject) => {
    const request = database.transaction(songStoreName, 'readonly')
      .objectStore(songStoreName)
      .getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storeSong(song) {
  openDatabase().then((database) => {
    const transaction = database.transaction(songStoreName, 'readwrite');
    transaction.objectStore(songStoreName).put(song);
    transaction.oncomplete = () => database.close();
  }).catch((error) => console.warn('[Playlist] Could not save song:', error));
}

function deleteStoredSong(song) {
  if (!song.audioBlob) return Promise.resolve();
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(songStoreName, 'readwrite');
    transaction.objectStore(songStoreName).delete(song.id);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  })).catch((error) => console.warn('[Playlist] Could not remove saved song:', error));
}

/** Restore imported songs and recreate their temporary object URLs. */
export async function hydrateSongs() {
  if (!('indexedDB' in window)) return;

  try {
    const database = await openDatabase();
    const storedSongs = await getStoredSongs(database);
    database.close();
    storedSongs.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    storedSongs.forEach((song) => {
      songs.push({
        ...song,
        src: song.audioBlob ? URL.createObjectURL(song.audioBlob) : song.src,
        cover: song.coverBlob ? URL.createObjectURL(song.coverBlob) : song.cover,
      });
    });
  } catch (error) {
    console.warn('[Playlist] Could not restore saved songs:', error);
  }
}

/** Returns the currently selected song object */
export function getCurrentSong() {
  return songs[state.currentIndex];
}

/** Returns a copy of the whole state (read-only outside this module) */
export function getState() {
  return { ...state };
}

/** Advance to next track; wraps around */
export function nextTrack() {
  if (!songs.length) return undefined;
  state.currentIndex = (state.currentIndex + 1) % songs.length;
  return getCurrentSong();
}

/** Go back to previous track; wraps around */
export function prevTrack() {
  if (!songs.length) return undefined;
  state.currentIndex =
    (state.currentIndex - 1 + songs.length) % songs.length;
  return getCurrentSong();
}

/** Jump directly to a track by its index */
export function goToTrack(index) {
  if (index < 0 || index >= songs.length) return getCurrentSong();
  state.currentIndex = index;
  return getCurrentSong();
}

/** Add a track imported from the user's computer. */
export function addSong(song) {
  const addedSong = {
    ...song,
    id: Date.now() + Math.random(),
    addedAt: Date.now(),
  };
  songs.push(addedSong);
  state.currentIndex = songs.length - 1;
  storeSong(addedSong);
  return addedSong;
}

/** Remove a track and keep the current index valid. */
export async function removeSong(index) {
  if (index < 0 || index >= songs.length) return null;
  const removedSong = songs[index];
  const wasCurrent = index === state.currentIndex;
  songs.splice(index, 1);
  await deleteStoredSong(removedSong);

  if (!songs.length) {
    state.currentIndex = 0;
  } else if (index < state.currentIndex) {
    state.currentIndex -= 1;
  } else if (index === state.currentIndex) {
    state.currentIndex = Math.min(state.currentIndex, songs.length - 1);
  }

  return { wasCurrent, song: getCurrentSong() };
}

/** Sort tracks while keeping the selected track selected. */
export function sortSongs(sortBy) {
  const currentId = getCurrentSong()?.id;
  const direction = sortBy.endsWith('-desc') ? -1 : 1;
  const field = sortBy.startsWith('artist') ? 'artist' : 'title';

  if (sortBy === 'added') {
    songs.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  } else {
    songs.sort((a, b) => a[field].localeCompare(b[field]) * direction);
  }
  state.currentIndex = Math.max(0, songs.findIndex((song) => song.id === currentId));
}

/** Set playing state */
export function setPlaying(value) {
  state.isPlaying = Boolean(value);
}

/** Returns true if music is currently playing */
export function isPlaying() {
  return state.isPlaying;
}
