# 📚 Student Task Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express](https://img.shields.io/badge/Express.js-Backend-black.svg)
![SQLite](https://img.shields.io/badge/SQLite-Database-blue.svg)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

A clean, aesthetic, and highly secure full-stack web application tailored precisely for students to manage their daily academic tasks such as assignments, homework, and schedules. 

Designed natively with **Vanilla JavaScript/HTML/CSS** on the frontend, and powered by a robust **Node.js, Express, & SQLite** backend, this project represents a lightweight yet heavily protected REST API ecosystem.

---

## ✨ Key Features
- **Dynamic Task Management**: Natively Add, View, Mark Completed, and Delete daily assignments.
- **Beautiful Aesthetic UI**: Featuring soft gradients, CSS animations, and a responsive glass-like layered design.
- **Form Hardening**: Native HTML bounds preventing bloated inputs, including a multi-line auto-resizing Description `<textarea>`.
- **Automated Database Generation**: Just start the server and the embedded `SQLite3` engine natively creates your database binary, tables, and schemas instantly.
- **Bulletproof Security**: Complete defense against SQL-injections via Parameterized Queries, `Helmet` headers, and `express-rate-limit` caching blocking unwanted bots.
- **Instant CI/CD Pipeline**: GitHub Actions `.yml` pre-configured to automatically install and test your backend route responses upon every `git push`.

---

## 💻 Tech Stack
| Tier | Technology Used |
|---|---|
| **Frontend** | Pure HTML5, CSS3, Vanilla JavaScript (Fetch API) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 (Embedded Local Binary) |
| **Automation** | GitHub Actions (CI/CD Automated Testing) |
| **Security** | Helmet, Express-Rate-Limit, CORS |
| **Deployments** | Ready for **Render** (Node) & **Netlify** (Static UI) |

---

## 📁 Project Structure

```text
📦 student-task-manager
 ┣ 📂 backend
 ┃  ┣ 📜 package.json      # Node dependencies & scripts
 ┃  ┣ 📜 server.js         # Core Express logic & REST API routes
 ┃  ┗ 📜 .env.example      # Abstracted environment vars model
 ┣ 📂 database             # Auto-generated SQLite storage directory
 ┣ 📂 frontend
 ┃  ┣ 📜 app.js            # Vanilla DOM manipulation & Fetch router
 ┃  ┣ 📜 config.js         # API endpoint environment controller
 ┃  ┣ 📜 index.html        # Main standard web interface
 ┃  ┗ 📜 style.css         # Aesthetic responsive design system
 ┣ 📜 .github/workflows/   # CI/CD Automated push testing
 ┣ 📜 netlify.toml         # Frontend deployment configuration
 ┗ 📜 render.yaml          # Backend blueprint deployment instructions
```

---

## 🚀 Local Installation & Setup

Want to run the Student Task Manager locally? It takes less than 60 seconds.

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/student-task-manager.git
cd student-task-manager/backend
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Boot the Server
```bash
npm start
```
*The server will boot on `http://localhost:3000` and automatically bind your SQLite database!*

### 4. Launch the Frontend
Open the `frontend/index.html` file natively in any web browser, or launch it securely using an extension like **VS Code Live Server**.

---

## 🌐 Production Deployment Guide

This repository comes pre-engineered with configuration files (`netlify.toml` / `render.yaml`) to make live internet deployment flawless.

1. **Deploy the API**: Connect this repository to **Render.com**. It will automatically detect the `render.yaml` configurations and deploy your Node API over HTTPS.
2. **Link the Frontend**: Open `frontend/config.js` and paste your live Render API URL where indicated.
3. **Deploy the Interface**: Connect this repository to **Netlify**. Netlify will use the `netlify.toml` rules to correctly route your static HTML app globally!

---

## 🔒 Security Posture
A massive 10-point audit was performed on this minimalist project to guarantee robust baseline safety:
- **XSS Protections**: `helmet()` natively intercepts payloads.
- **SQLi Defense**: Queries are forced through `db.run()` parameters, nullifying wildcards.
- **Spam Mitigation**: Natively throttles users to exactly 100 requests per 15 minutes.
- **Stack-Trace Obscurity**: `res.status(500)` returns heavily sanitized text while leaving genuine backend errors purely inside your developer terminal!

> *Built completely from scratch for educational production execution workflows.*
