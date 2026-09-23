# 🎵 CodeAlpha Music Player

A responsive music player built as part of the **CodeAlpha Frontend Development Internship**.

The project is developed using **HTML, CSS, and Vanilla JavaScript**, with no backend or database.

## Features

* Play and pause music
* Previous and next song controls
* Song title and artist information
* Song duration
* Progress bar and seek control
* Volume control
* Playlist
* Import songs directly from your computer
* Add a cover from an image file or URL
* Search and sort the playlist
* Rename songs inline
* Remove songs from the playlist
* Autoplay
* Responsive design
* Smooth UI interactions

## Technologies

* HTML5
* CSS3
* JavaScript
* HTML5 Audio API

## Project Structure

 text
CodeAlpha_MusicPlayer/
│
├── index.html
│
├── styles/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── script.js
│   ├── player.js
│   ├── playlist.js
│   └── ui.js
│
├── assets/
│   ├── images/
│   │   ├── covers/
│   │   └── logo.svg
│   │
│   └── audio/
│
├── README.md
└── .gitignore
 

## Installation

No backend server or build step is required. Because the app uses JavaScript modules, open it through a local HTTP server instead of opening `index.html` directly. Imported audio and cover files are kept in browser memory for the current session; refresh the page to import them again.

1. Clone or download the repository.
2. From the project directory, run `python -m http.server 8000`.
3. Open `http://localhost:8000` in a modern web browser.
4. Start playing music.

## Internship Task

**CodeAlpha - Frontend Development**

Task: **Music Player using JavaScript**

The project implements the required music-player functionality using frontend technologies only.

## Author

**Adil Hassan (adil12hassan)**

## License

This project was created for educational and internship purposes.