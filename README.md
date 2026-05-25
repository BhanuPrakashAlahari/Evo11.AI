# Evo11 Console Dashboard 🚀

Evo11 Console is a premium, high-fidelity, enterprise-grade operations and diagnostics dashboard. Designed with modern web aesthetics (vibrant dark theme, subtle micro-animations, and glassmorphism layouts), it integrates real-time analytical insights, task management, live news feeds, and secure GitHub developer telemetry.

This project is structured as a robust **monorepo** dividing client-side interfaces from the server-side microservices, fully optimized for both local development and instant **Vercel serverless deployments**.

---

## 🛠️ Core Technology Stack

### 💻 Frontend (Client)
- **Vite & React (v19)**: Hot-reloading module bundler with the latest React concurrency features.
- **TailwindCSS (v4)**: Curated custom HSL color systems, sleek glow-effects, and highly responsive grid designs.
- **Axios**: Standardized client interface with global error handlers and interceptors.
- **Recharts & Lucide React**: Beautiful data visualizations and premium, unified SVG iconography.

### 🔌 Backend (API Engine)
- **Node.js & Express**: High-performance HTTP server engine.
- **Mongoose & MongoDB**: Production-grade ODM providing persistence boundaries for operational tasks.
- **Helmet & CORS**: Enterprise-standard HTTP security headers and strictly validated cross-origin origin bindings.
- **Serverless Integration**: Out-of-the-box support for Vercel's zero-config Serverless Functions with dynamic lazy-loading database connections.

---

## ⭐️ Key Features

1. **System Diagnostics Console (Dashboard)**
   - Displays real-time operational widgets including live weather tracking (with local caching boundaries) and cryptocurrency price tickers.
   - Live rendering of host metrics (CPU cores, platform architectures, and real-time Memory allocation percentage).

2. **Database-Backed Task Manager**
   - High-fidelity TODO organizer supporting CRUD operations with persistent storage in MongoDB.
   - Leverages **Optimistic UI Updates** to render additions, priority shifts, and deletions instantly on the screen before backend confirmation, maximizing user responsiveness.
   - Smart fallback screens that seamlessly detect and handle offline database states.

3. **Live Technical News Feed**
   - Renders curated software engineering breakthroughs, tech articles, and open-source updates.
   - Dynamically categorizes articles by source (TechCrunch, Wired, The Verge, Google DeepMind) using customized color-coded badges and publishing time tags.

4. **GitHub Workspace Diagnostic Telemetry**
   - **Instant Connection**: Bypasses local browser logins, binding telemetry safely to the developer's pre-configured GitHub workspace (`BhanuPrakashAlahari`).
   - Retrieves active repositories, stars count, primary coding languages, and compiles chronological commits history log (up to 10 latest push events).
   - Tailored, highly responsive fallback mock analytics in case of public API rate-limiting.

---

## 📂 Project Directory Structure

```text
Evo11.AI/
├── backEnd/                 # Express API Engine
│   ├── api/                 # Serverless Entry Points (Vercel)
│   ├── src/
│   │   ├── config/          # Environment & Mongoose Settings
│   │   ├── controllers/     # Request Route Handlers
│   │   ├── middleware/      # CORS, Loggers, and Error Boundaries
│   │   ├── routes/          # API Express Routing Nodes
│   │   ├── services/        # External APIs integrations (GitHub, News, Weather)
│   │   └── app.js           # Server Core Setup
│   ├── vercel.json          # Vercel Serverless Routing
│   └── package.json
├── frontEnd/                # React / Vite Client Application
│   ├── src/
│   │   ├── components/      # Global Layout components (Sidebar, Topbar)
│   │   ├── pages/           # Pages (Dashboard, Tasks, TechNews, GitHubConsole)
│   │   ├── services/        # Centralized Axios services configuration
│   │   └── widgets/         # Diagnostic widgets
│   ├── vercel.json          # Vercel Single-Page-App Routing
│   ├── .npmrc               # Dependency installer override
│   └── package.json
└── README.md                # Evaluation & Documentation Core
```

---

## ⚡ Local Installation & Run Guide

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) and a running [MongoDB instance](https://www.mongodb.com/cloud/atlas) (such as a free MongoDB Atlas cluster).

### 2. Backend Setup
1. Navigate into the backend folder:
   ```bash
   cd backEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment file `.env` inside the `backEnd/` folder and populate it:
   ```env
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_connection_string_here
   GITHUB_USERNAME=BhanuPrakashAlahari
   GITHUB_TOKEN=your_github_personal_access_token
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   NEWS_API_KEY=your_news_api_key_here
   ```
4. Start the backend development server (with nodemon reload):
   ```bash
   npm run dev
   ```
   The backend will bootstrap and start listening at `http://localhost:5001`.

### 3. Frontend Setup
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

To deploy both segments successfully in a live production environment, follow these steps:

### 1. Deploy the Backend (`evo11-backend`)
1. Create a new project on the **Vercel Dashboard** and select your repository.
2. Edit **Root Directory** settings to target `backEnd`.
3. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Connection String>`
   - `GITHUB_USERNAME`: `BhanuPrakashAlahari`
   - `GITHUB_TOKEN`: `<Your GitHub Access Token>`
   - `OPENWEATHER_API_KEY`: `<Your OpenWeather API Key>`
   - `NEWS_API_KEY`: `<Your News API Key>`
   - `CLIENT_URL`: `https://<your-frontend-vercel-domain>.vercel.app` *(add this after deploying your frontend)*
4. Click **Deploy**. Copy the backend deployment domain (e.g. `https://evo11-backend.vercel.app`).

### 2. Deploy the Frontend (`evo11-frontend`)
1. Import the same repository on Vercel as a new project.
2. Edit **Root Directory** to target `frontEnd` (Vercel will auto-detect "Vite").
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-backend-vercel-domain>.vercel.app/api`
4. Click **Deploy**. Copy this frontend URL and paste it back into your backend's `CLIENT_URL` settings.

*Note: The frontend contains a custom `.npmrc` with `legacy-peer-deps=true` which guarantees npm resolves peer conflicts automatically on React 19.*

---

## 📐 Verification & Testing Status

- **Code Quality**: Completely verified using strict ESLint standards via `npm run lint`. Passes with **zero errors and zero warnings**.
- **Production Readiness**: Build validated via standard production compilation pipelines using `npm run build` resulting in optimized chunks.
- **Security Check**: CORS binds strictly to configured environment origins in production while automatically allowing developer console pings (`localhost`) in development mode.
