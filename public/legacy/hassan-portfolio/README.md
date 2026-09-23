# Hassan - Personal Portfolio 🚀

A clean, responsive personal portfolio website built with pure **HTML, CSS & JavaScript** - no frameworks, no dependencies.

---

## 🌐 Live Demo

| Project | URL |
|---------|-----|
| 🖥️ Frontend | [Client Side](https://hassan-porfolio-web.vercel.app) |
| ⚙️ Backend API | [Use Your Own Backend Link]() |

---

## ✨ Features

- 🎨 **Modern UI** - clean light design with blue accent theme
- 📱 **Fully Responsive** - works on all screen sizes with hamburger menu
- 🎯 **Smooth Scroll Navigation** - sticky navbar with active link tracking
- 📊 **Animated Skill Bars** - triggered on scroll using Intersection Observer
- 📬 **Working Contact Form** - sends real emails via Node.js backend
- 🔔 **Toast Notifications** - user feedback on form submit

---

## 📁 Project Structure

```
Project/
├── .env                  ← local secrets (never push to GitHub)
├── .gitignore
│
├── api/                  ← Backend (deployed separately)
│   ├── server.js
│   ├── package.json
│   └── vercel.json
│
└── frontend/             ← Frontend (this project)
    ├── index.html
    ├── styles.css
    ├── script.js
    └── img1.jpeg
```

---

## 🛠️ Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| HTML5 | Structure & semantics |
| CSS3 | Styling, animations, responsive layout |
| JavaScript (Vanilla) | Interactivity, form handling, scroll effects |
| Font Awesome 6 | Icons |
| Google Fonts (Syne + DM Sans) | Typography |

### Backend
| Tech | Usage |
|------|-------|
| Node.js | Runtime |
| Express.js | API server |
| Nodemailer | Email sending via Gmail SMTP |
| dotenv | Environment variable management |
| CORS | Cross-origin request handling |

---

## ⚙️ How It Works

1. User fills the **contact form** on the frontend
2. On submit, JavaScript sends a `POST` request to the backend API
3. The backend receives the data and sends an **email via Gmail SMTP**
4. User sees a success or error message

```
Frontend (Vercel)  →  POST /send-email  →  Backend API (Vercel)  →  Gmail SMTP  →  📧 Email
```

---

## 🚀 Deployment

Both frontend and backend are deployed **separately** on Vercel.

### Backend
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** → `api`
4. Add Environment Variables:
   ```
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASS = your_gmail_app_password
   ```
5. Deploy → copy the URL

### Frontend
1. Go to Vercel → New Project
2. Same GitHub repo
3. Set **Root Directory** → `frontend`
4. Deploy ✅

> **Note:** After deploying backend, update the fetch URL in `index.html`:
> ```js
> const res = await fetch("https://your-backend.vercel.app/send-email", { ... });
> ```

---

## 🔐 Environment Variables

Create a `.env` file in the root for local development:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> ⚠️ Never push `.env` to GitHub. Set these in the **Vercel dashboard** for production.

To get a Gmail App Password:
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate a password for "Mail"
3. Use it as `EMAIL_PASS`

---

## 📬 Contact

**Syed Adil Hassan**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adil-hassan-a08115325)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/adil-12-hassan)
[![Behance](https://img.shields.io/badge/Behance-1769FF?style=flat&logo=behance&logoColor=white)](https://www.behance.net/adilhassan19)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/adilhassan107/)

📧 syedadilhassan06@gmail.com  
📍 Faisalabad, Pakistan

---

## 📄 License

This project is open source and available under the [License](LICENSE).

---

<p align="center">Designed & built with ❤️ by <strong>Hassan</strong> · © 2026</p>
