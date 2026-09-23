# My Landing Pages

A single, unified React + Vite site that hosts a growing collection of standalone landing pages, mini web apps, and experiments — consolidated from a dozen+ separate repositories into one clean, easy-to-maintain project.

> Built by [Adil Hassan](https://github.com/) — IT undergraduate, founder of [SkyeVault](https://github.com/), and freelance web developer.

---

## ✨ Why this exists

Previously, every small project (a calculator, a music player, a portfolio, a landing page for a fictional dental clinic, etc.) lived in its own GitHub repo with its own Vercel deployment. That meant:

- 10+ separate hosting slots cluttering the Vercel dashboard
- 10+ repos to maintain, most of which were never touched again
- No single place to showcase everything together

This project fixes that: one repo, one deployment, one home page linking out to every project — old and new.

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router |
| Backend | Vercel Serverless Functions (Express) |
| Email | Nodemailer over SMTP |
| WebAssembly | C/C++ compiled via Emscripten *(in progress)* |
| Hosting | Vercel |
| Legacy projects | Vanilla HTML / CSS / JS (served as static passthrough) |

---

## 📁 Project Structure

```
.
├── api/
│   └── contact.js          # Serverless contact form endpoint (Express + Nodemailer)
├── public/
│   ├── assets/              # Global static assets (fonts, icons, images)
│   ├── wasm/
│   │   └── hub.wasm         # Compiled WebAssembly module
│   └── legacy/               # All old standalone projects, served as-is
│       ├── currency-converter/
│       ├── designed-search-bar/
│       ├── doctor-dental/
│       ├── guitar-studio/
│       ├── hassan-calculator/
│       ├── hassan-portfolio/
│       ├── music-player/
│       ├── play-station/
│       ├── portfolio-frontend/
│       ├── stylophone-studio/
│       ├── todo-app/
│       ├── vocal-void/
│       └── website-updater/
├── src/
│   ├── components/
│   │   ├── ContactForm.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── ProjectCard.jsx
│   ├── data/
│   │   └── projects.js       # Single source of truth for the project grid
│   ├── pages/
│   │   └── Home.jsx
│   ├── styles/
│   │   ├── global.css
│   │   └── components.css
│   ├── wasm/
│   │   └── loader.js         # JS glue for hub.wasm
│   ├── App.jsx
│   └── Main.jsx
├── vercel.json                # Routing rules (API / legacy passthrough / SPA fallback)
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/my-landing-pages.git
cd my-landing-pages
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root (never commit this — it's already in `.gitignore`):

```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
CONTACT_RECEIVER_EMAIL=your@email.com
```

Set the same variables in **Vercel → Project Settings → Environment Variables** for production.

### 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173` — the home page lists every legacy project, each linking to `/legacy/<project-name>/`, served untouched.

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 📬 Contact Form

The contact form (`src/components/ContactForm.jsx`) posts to `/api/contact`, a Vercel serverless function that validates the input and sends an email via Nodemailer over SMTP. No third-party form service, no database — just a direct, self-hosted email pipeline.

---

## 🗂️ Legacy Projects

Every project under `public/legacy/` is a fully self-contained static site, untouched from its original repo, just relocated and normalized to kebab-case. They're served as raw static files — no React, no bundling — so each one loads and behaves exactly as it always did.

| Project | Description |
|---|---|
| Currency Converter | Real-time currency conversion tool |
| Designed Search Bar | Styled, animated search bar UI |
| Doctor Dental | Dental clinic landing page |
| Guitar Studio | Guitar lessons landing page |
| Hassan Calculator | Functional calculator app |
| Hassan Portfolio | Earlier personal portfolio |
| Music Player | Web-based music player with playlists |
| Play Station | Gaming-themed landing page |
| Portfolio Frontend | Frontend-only portfolio build |
| Stylophone Studio | Interactive virtual stylophone |
| Todo App | Task management app |
| Vocal Void | Music/vocal-themed landing page |
| Website Updater | Website content update tool/demo |

---

## 🛣️ Roadmap

- [ ] WebAssembly image-filter demo (grayscale/blur), compiled from C via Emscripten
- [ ] Legacy project asset-path audit (absolute vs. relative paths)
- [ ] Lazy-loading and code-splitting for faster initial load
- [ ] Dedicated `/contact` route

---

## 📄 License

This project is open source. Individual legacy projects may carry their own licenses — check each project's folder for details.

---

## 👤 Author

**Adil Hassan**
Founder, [SkyeVault](https://github.com/) · Freelance web developer at **Fix & Build | Web Solutions**