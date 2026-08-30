# 🌐 How to Host Your AI Chatbot on Netlify

This guide provides simple, step-by-step instructions to deploy your AI Chatbot application to **Netlify**.

---

## 🎯 Architecture Overview

Your application consists of:
1. **Frontend (React + Vite + Tailwind)**: Hosted on **Netlify** (Free, Global CDN, SSL included).
2. **Backend (Express + SQLite + Gemini API)**: Hosted on **Render.com** or **Railway.app** (Free tier with Node.js & persistent database) OR deployed alongside Netlify.

---

## 🚀 Option 1: Deploy Frontend to Netlify + Backend to Render (Recommended & 100% Free)

### Step 1: Push Code to GitHub
1. Initialize git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Complete AI Chatbot"
   ```
2. Create a new repository on [GitHub.com](https://github.com/new).
3. Link and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy Backend to Render (2 Minutes)
1. Go to [Render.com](https://render.com/) and sign in with GitHub.
2. Click **New +** ➔ **Web Service**.
3. Select your GitHub repository.
4. Fill in these settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `JWT_SECRET`: `super_secret_jwt_key_chatbot_2026`
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key starting with `AIzaSy...`)*
   - `DEFAULT_AI_MODEL`: `gemini-1.5-flash`
6. Click **Deploy Web Service**.
7. Copy your backend URL (e.g. `https://chatbot-backend-xyz.onrender.com`).

---

### Step 3: Deploy Frontend to Netlify
1. Go to [Netlify.com](https://www.netlify.com/) and sign in with GitHub.
2. Click **Add new site** ➔ **Import an existing project**.
3. Select your GitHub repository.
4. Netlify will auto-detect settings from `netlify.toml`:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. In your project code, open `client/public/_redirects` and update the API proxy to point to your Render backend:
   ```text
   /api/*  https://YOUR-RENDER-BACKEND.onrender.com/api/:splat  200
   /*      /index.html                                          200
   ```
6. Click **Deploy Site**!

---

## 💻 Option 2: Deploy Directly via Netlify CLI (Instant)

1. In your terminal inside the `client` folder:
   ```bash
   cd client
   npm run build
   npx netlify deploy --prod --dir=dist
   ```
2. Follow the prompt to authorize your Netlify account and choose a site name.
3. Your site is instantly live at `https://your-site-name.netlify.app`!
