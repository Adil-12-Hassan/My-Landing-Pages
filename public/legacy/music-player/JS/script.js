/**
 * script.js
 * App entry point - runs after the DOM is ready.
 * Imports player (which imports playlist + ui) and fires up initPlayer().
 * Author: adil12hassan
 */

import { initPlayer } from './player.js';
import { renderPlaylist } from './ui.js';
import { hydrateSongs } from './playlist.js';

document.addEventListener('DOMContentLoaded', async () => {
  await hydrateSongs();
  renderPlaylist();   // Paint the playlist first so it isn't blank
  initPlayer();       // Wire up audio + events + load first song
});
