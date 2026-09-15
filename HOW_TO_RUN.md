# HITNEXT Quiz Platform — Portable Export

This folder contains the complete, ready-to-run HITNEXT 2026 Quiz Platform (React 19 + Vite + Supabase).
All `node_modules` have been stripped out to keep the archive lightweight and portable across any device.

---

## Prerequisites
- **Node.js**: Version 18 or higher (Download from [nodejs.org](https://nodejs.org))
- **npm**: Included with Node.js

---

## How to Run on Any Device (Windows / Mac / Linux)

### Step 1: Open Terminal in this folder
Open your terminal (PowerShell, Command Prompt, Terminal, or VS Code) in this exact folder.

### Step 2: Install Dependencies
Run the following command to download clean, platform-specific dependencies:
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to the local URL shown in your terminal (usually `http://localhost:5173`).

---

## Project Structure Overview
- `src/` — React frontend application (Landing, Login, Quiz, Winners pages, components, CSS).
- `public/` — Static assets (videos, clue images, interactive Jigsaw iframe, redirects).
- `supabase/` — Supabase migrations, database seeds, and Deno Edge Functions.
- `.env` — Supabase connection configuration (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
- `vercel.json` & `public/_redirects` — Pre-configured single-page application (SPA) routing rules for Vercel, Netlify, and Cloudflare Pages.

---

## How to Build for Production Deployment
To create a production-ready web build:
```bash
npm run build
```
This will compile the optimized files into the `dist/` directory, ready to be hosted on Vercel, Netlify, Cloudflare Pages, or any web server.
