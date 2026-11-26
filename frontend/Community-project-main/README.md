# TRACE COMMUNITY – Sri Lanka Ecosystem Directory Platform

> The official interactive directory platform for **TRACE Sri Lanka**, showcasing 59 partner organizations across 6 sectors: Corporate Partners, Startups, Local Partners, International Partners, Government Partners, and University Partners.

---

## 🚀 Instant Hosting Guide (Vercel & Netlify)

This project is a standalone, blazing-fast, static React + TypeScript + Vite web application. It requires **zero backend servers and zero database maintenance**, and can be hosted 100% free with 1 click.

### Method 1: Deploy to Vercel (Recommended - 2 Minutes)
1. Push this project to your **GitHub** account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of TRACE Community Directory"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel will automatically detect `vercel.json`:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or select `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site is now live with an SSL HTTPS URL!

---

### Method 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Connect your GitHub repository.
3. Netlify will automatically read `netlify.toml`.
4. Click **Deploy Site**.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Run Locally
```bash
# Install dependencies
npm run build

# Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 📁 Project Structure

```
Community/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets & partner logos
│   │   ├── coparate/           # Corporate partner logos
│   │   ├── startup/            # Startup logos
│   │   ├── local-partners/     # Local partner logos
│   │   ├── international-partners/ # International partner logos
│   │   ├── government-partners/# Government partner logos
│   │   ├── university-partners/# University partner logos
│   │   └── trace-logo.png      # Official TRACE Sri Lanka logo
│   └── src/
│       ├── components/         # Header, HeroSection, Footer, Card, Grid
│       ├── data/               # All 59 partner organizations catalog
│       ├── hooks/              # Active section tracking & smooth scroll
│       ├── sections/           # 6 community category sectors
│       └── types/              # Organization TypeScript interfaces
├── vercel.json                 # Zero-config Vercel deployment configuration
├── netlify.toml                # Zero-config Netlify deployment configuration
├── .gitignore                  # Git ignore rules
└── package.json                # Project root scripts
```

---

## 🏛️ Built for TRACE Sri Lanka
- **Official Site:** [https://trace.lk](https://trace.lk)
- **Directory:** TRACE Sri Lanka Community Directory Platform
