# 🌐 Personal Portfolio Website

A clean, responsive personal portfolio website built with vanilla HTML, CSS, and JavaScript - with a Node.js/Express/Nodemailer backend for the contact form.

---

## 🚀 Live Demo

- **Frontend:** [My Website Frontend](https://hassan-porfolio-web.vercel.app)
- **Backend API:** Deployed on Vercel ([Backend Live Here](https://hassan-porfolio-backend.vercel.app/send-email))

---

## 📁 Project Structure

```
portfolio/
├── index.html          # Main HTML file
├── style.css           # All styles including responsive
├── script.js           # DOM manipulation + form handler
├── my.png              # Profile photo
└── api/                # Backend (Node.js)
    ├── server.js       # Express server + Nodemailer
    ├── .env            # Environment variables (not committed)
    ├── .gitignore      # Ignores node_modules and .env
    ├── vercel.json     # Vercel deployment config
    └── package.json    # Dependencies
```

---

## ✨ Features

- **Sticky Glassmorphism Navbar** - blur effect, active link highlight on scroll
- **Hamburger Menu** - animated X toggle for mobile
- **Smooth Scroll** - all nav links scroll smoothly to sections
- **Hero Section** - intro with CTA button
- **About Section** - bio with profile image
- **Services Section** - 3 service cards with hover effect
- **Blog Section** - 3 blog preview cards
- **Contact Form** - validated frontend + connected to backend API
- **Footer** - links, contact info, copyright
- **Fully Responsive** - mobile first at 768px breakpoint

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---------|
| HTML5 | Structure |
| CSS3 | Styling, Flexbox, Grid, Animations |
| JavaScript (ES6+) | DOM manipulation, Fetch API |

### Backend
| Technology | Purpose |
|---|---------|
| Node.js | Runtime |
| Express.js | Server framework |
| Nodemailer | Email sending |
| CORS | Cross-origin requests |
| dotenv | Environment variables |

---

## ⚙️ Setup & Installation

### Frontend
Just open `index.html` in your browser - no build step needed.

### Backend

1. Navigate to the `api` folder:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
PORT=3000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

Server runs on `http://localhost:3000`

---

## 📧 Gmail App Password Setup

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Enable **2-Step Verification**
3. Go to **Security → App Passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password into `.env`

---

## 🌍 Deployment

### Backend on Vercel
1. Push `api/` folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `EMAIL_USER`
   - `EMAIL_PASS`
4. Deploy

### Frontend on Vercel
1. Push frontend files to GitHub
2. Import project on Vercel
3. Update `fetch` URL in `script.js` to your deployed backend URL

---

## 📬 API Endpoints

| Method | Endpoint | Description |
|--------|-|----|
| GET | `/` | Health check |
| POST | `/send` | Send contact form email |

### POST `/send` - Request Body
```json
{
  "name": "John Smith",
  "email": "john@gmail.com",
  "message": "Hello Adil!"
}
```

### Success Response
```json
{ "success": "Message Send Successfully!" }
```

### Error Response
```json
{ "error": "All fields are required!" }
```

---

## 👨‍💻 Author

**Syed Adil Hassan**
- 📍 Faisalabad, Punjab, Pakistan
- 📧 syedadilhassan06@gmail.com
- 📞 +92 328 151 1293
- 🌐 [My Site](https://hassan-porfolio-web.vercel.app)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).