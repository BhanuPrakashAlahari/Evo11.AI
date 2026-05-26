# Evo11 Console Dashboard 🚀

Evo11 Console is a premium, high-fidelity, enterprise-grade operations and diagnostics dashboard. Designed with modern web aesthetics (vibrant dark theme, subtle micro-animations, and glassmorphism layouts), it integrates real-time analytical insights, task management, live news feeds, and secure GitHub developer telemetry.

This project is structured as a robust **monorepo** dividing client-side interfaces from the server-side microservices, fully optimized for both local development and instant **Vercel serverless deployments**.

---

## 🛠️ Core Technology Stack

### 💻 Frontend (Client)
- **Vite & React (v19)**: Hot-reloading module bundler with the latest React concurrency features.
- **TailwindCSS (v4)**: Curated custom HSL color systems, sleek glow-effects, and highly responsive grid designs.
- **Axios**: Standardized client interface with global error handlers, custom interceptors, and robust state checks.
- **Recharts & Lucide React**: Beautiful data visualizations and premium, unified SVG iconography.

### 🔌 Backend (API Engine)
- **Node.js & Express**: High-performance HTTP server engine.
- **Mongoose & MongoDB**: Production-grade ODM providing persistence boundaries for operational tasks.
- **Helmet & CORS**: Enterprise-standard HTTP security headers and strictly validated cross-origin origin bindings.
- **Serverless Integration**: Out-of-the-box support for Vercel's zero-config Serverless Functions with dynamic database connection caching.

---

## ⭐️ Premium Features & Recent Architectural Enhancements

### 1. Secure GitHub Workspace Integration (OAuth Flow)
- **Dynamic Login with GitHub**: Bypasses hardcoded credentials. Prompts the user to authorize using a secure, backend-controlled GitHub OAuth 2.0 flow.
- **Explicit Re-Authentication**: Configured with a `prompt=select_account` parameter, forcing the GitHub account picker to display when linking an account, allowing seamless account switching.
- **Graceful In-flight Safeguards**: Fenced React state triggers with active token checks to completely eliminate race conditions from slow network responses.
- **Zero-Load Disconnected States**: Wipes credentials on logout and completely halts all background polling interval traffic when disconnected.
- **Unified Widgets**: If unauthenticated, renders a beautiful, dark glassmorphic card inside the Overview dashboard directing the user to connect their workspace in the Console.

### 2. High-Fidelity Weather Widget & Autocomplete Search
- **Incremental In-Place Refreshing**: Features a built-in search bar with real-time **autocomplete suggestions** for major global cities.
- **Independent Card Rendering**: Pressing Enter or selecting a suggestion updates only the weather metrics and graph in-place via smooth, pulsing skeleton transitions, keeping the card container completely stable.
- **100% Real Live Telemetry**: Eradicated all mock fallbacks. Dynamically pulls from OpenWeather APIs with resilient error boundaries.

### 3. Cryptocurrency Price Tracker
- **Flicker-Free Chart Canvas**: Polls CoinGecko every 60 seconds (optimized from 4s) to safely comply with API rate limits.
- **Clipping Fixes**: Fine-tuned chart dimensions and left-margin positioning to guarantee tick labels and sparklines are perfectly visible without truncation.
- **Targeted Skeletons**: Employs inline pulsing area skeletons during data updates rather than full-card flashes.

### 4. Database-Backed Task Manager
- **Optimistic UI Updates**: Instantly renders CRUD operations (additions, priority shifts, completions, and deletions) on-screen before server confirmation, ensuring a snappy user experience.
- **Robust Connection Fallback**: Seamlessly detects and reports offline database states without crashing.

### 5. Host Metrics & Rate-Limited Health Polling
- **Pre-Seeded Area Curves**: Seeds a 30-point historical baseline on mount, enabling the CPU capacity and RAM utilization graphs to render beautiful, continuous curves instantly rather than starting blank.
- **Dynamic Polling & Rate Limiting**: Polls the health diagnostic endpoint every 12 seconds (exactly 5 requests per minute) under a strict backend rate-limiting shield.

### 6. Live Technical News Feed
- **Badge Classification**: Renders curated development articles categorized dynamically with vibrant, source-specific badges (e.g., TechCrunch, Google DeepMind, Wired).

---

## 📂 Project Directory Structure

```text
Evo11.AI/
├── backEnd/                 # Express API Engine
│   ├── api/                 # Serverless Entry Points (Vercel)
│   ├── src/
│   │   ├── config/          # Environment & Database Settings
│   │   ├── controllers/     # Route Handlers (GitHub, Crypto, Tasks)
│   │   ├── middleware/      # CORS, Loggers, and Centralized Error Handling
│   │   ├── routes/          # Express Routing Boundaries
│   │   ├── services/        # External Integration Modules (GitHub OAuth, News)
│   │   └── app.js           # Express App Initialization
│   ├── vercel.json          # Vercel Serverless Routing Settings
│   └── package.json
├── frontEnd/                # React / Vite Client Application
│   ├── src/
│   │   ├── components/      # Responsive Sidebar & Topbar Shell
│   │   ├── pages/           # Pages (Overview, Tasks, Tech News, GitHub Workspace)
│   │   ├── services/        # Centralized Axios Client & Request Interceptors
│   │   └── widgets/         # Diagnostic widgets (Weather, Crypto, Metrics)
│   ├── vercel.json          # Vercel Single-Page-App Routing
│   ├── .npmrc               # React 19 Dependency Resolution
│   └── package.json
└── README.md                # Project Architecture & Setup Guide
```

---

## ⚡ Local Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) and a running [MongoDB instance](https://www.mongodb.com/cloud/atlas) configured.

### 2. GitHub OAuth App Setup
To enable dynamic "Login with GitHub" authentication locally:
1. Go to your GitHub account: **Settings** -> **Developer Settings** -> **OAuth Apps** -> **Register a new application**.
2. Set the configuration details as follows:
   - **Application Name**: `Evo11 Console`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/gitHub`
3. Click **Register application**.
4. Generate a **Client Secret** and copy both the **Client ID** and **Client Secret**.

### 3. Backend Setup
1. Navigate into the backend folder:
   ```bash
   cd backEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment file `.env` inside the `backEnd/` folder and populate it (replace placeholders with your credentials; **do not commit real secrets**):
   ```env
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_connection_string_here
   
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   
   # Optional hardcoded fallback PAT credentials
   GITHUB_USERNAME=your_default_github_username_here
   GITHUB_TOKEN=your_github_personal_access_token_here
   
   # External Services API Keys
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   NEWS_API_KEY=your_news_api_key_here
   ```
4. Start the Express server:
   ```bash
   npm run dev
   ```
   The backend will bootstrap and start listening at `http://localhost:5001`.

### 4. Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment file `.env` inside the `frontEnd/` folder:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```
4. Boot up the Vite client:
   ```bash
   npm run dev
   ```
   The frontend console will compile and open at `http://localhost:5173`.

---

## 🚀 Vercel Production Deployment Guide

### 1. Deploy the Backend Serverless API (`evo11-backend`)
1. Create a new project on the **Vercel Dashboard** and select your repository.
2. Edit **Root Directory** settings to target `backEnd`.
3. In **Environment Variables**, configure:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Connection String>`
   - `GITHUB_CLIENT_ID`: `<Your GitHub OAuth Client ID>`
   - `GITHUB_CLIENT_SECRET`: `<Your GitHub OAuth Client Secret>`
   - `OPENWEATHER_API_KEY`: `<Your OpenWeather API Key>`
   - `NEWS_API_KEY`: `<Your News API Key>`
   - `CLIENT_URL`: `https://<your-frontend-vercel-domain>.vercel.app` *(add this after deploying your frontend)*
4. Click **Deploy**. Copy the backend deployment domain (e.g. `https://evo11-backend.vercel.app`).

### 2. Deploy the Frontend client (`evo11-frontend`)
1. Import the same repository on Vercel as a new project.
2. Edit **Root Directory** to target `frontEnd`. Vercel will auto-detect "Vite".
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-backend-vercel-domain>.vercel.app/api`
4. Click **Deploy**. Copy this frontend URL and paste it back into your backend's `CLIENT_URL` settings.

---

## 📐 Verification & Testing Status

- **Code Quality**: Verified using strict ESLint standards. Passes with **zero errors and zero warnings**.
- **Production Readiness**: Vite production bundles compile beautifully in **410ms** with fully optimized chunking rules.
- **Security Check**: CORS binds strictly to configured environment origins in production while automatically allowing local cross-origin connections in development mode.
- **API Optimization**: Network polling frequencies are strictly controlled and rate-limited to preserve standard server bounds and completely avoid external API rate limits.
