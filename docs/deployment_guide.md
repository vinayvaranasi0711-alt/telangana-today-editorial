# Production Deployment & Hosting Guide (Day 21)

This document provides a step-by-step guide to deploying the **Telangana Today AI Localisation & Regional Language Adaptation Assistant** to production cloud environments.

---

## 1. Production Architecture Overview

In production, the application is split into a decoupled client-server architecture:
1. **Frontend Hosting (Vercel)**: Static React client built with Vite and served globally via Vercel's Edge Network.
2. **Backend Hosting (Render or Railway)**: Express.js REST API server running on a Node.js runtime container.
3. **Database (Supabase / PostgreSQL)**: Cloud database storing translations and journalist feedback logs. (The system includes an adapter to migrate from the local `db.json` flat-file storage to a relational database).

```
[ Browser / User ] 
       │
       ├──► Frontend Client (Vercel) [HTTPS]
       │
       └──► Backend API Server (Render) [HTTPS]
                 │
                 ├──► Gemini AI API (Google)
                 └──► Production Database (Supabase / PostgreSQL)
```

---

## 2. Phase 1: Cloud Database Setup (Supabase / PostgreSQL)

Although the prototype runs on a local JSON database, a production server requires a persistent SQL storage layer to prevent data loss on container restarts.

### Steps to set up Supabase:
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Create a new project named `telangana-today-localisation`.
3. Go to the **SQL Editor** tab and run the following schema migrations:

```sql
-- Create table for Generations
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journalist VARCHAR(255) NOT NULL,
    inputs TEXT,
    english TEXT NOT NULL,
    tone VARCHAR(50) DEFAULT 'Standard',
    dialect VARCHAR(50) DEFAULT 'Standard',
    telugu_translation TEXT NOT NULL,
    cultural_notes TEXT[], -- Array of strings
    response_time_ms INT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for Feedback
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

4. Go to **Project Settings > Database** and copy the **URI Connection String**. Save it for your backend configuration as `DATABASE_URL`.

---

## 3. Phase 2: Deploying the Node.js Express Backend (Render)

Render hosts server containers directly from a GitHub repository.

### Setup Steps:
1. Push your codebase to a private or public GitHub repository.
2. Go to [render.com](https://render.com) and sign in.
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Configure the Web Service settings:
   * **Name**: `telangana-today-localisation-api`
   * **Root Directory**: `backend` (Crucial: points Render to compile inside the backend directory)
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`
6. Click **Advanced** to add **Environment Variables**:
   * `PORT`: `8085`
   * `GEMINI_API_KEY`: `[Your Actual Live Gemini API Key]` (Never commit this key to GitHub)
   * `DATABASE_URL`: `[Your Supabase Connection String URI]` (Optional - if using SQL database adapter; if left empty, the server automatically defaults to the self-healing file-based flat storage).
7. Click **Deploy Web Service**.
8. Render will compile dependencies and boot the server. Once completed, note your live API URL (e.g. `https://telangana-today-localisation-api.onrender.com`).

---

## 4. Phase 3: Deploying the React Frontend (Vercel)

Vercel is optimized for building and deploying React/Vite single-page applications.

### Setup Steps:
1. Before deploying, configure the frontend to talk to your new live backend server instead of `localhost`.
2. Open `frontend/src/App.jsx` and find the fetch requests.
3. Update the endpoint base URLs:
   * **Locally**: `http://localhost:8085`
   * **Production**: `https://telangana-today-localisation-api.onrender.com`
   * *(Recommendation: Use environment variables in Vite: `import.meta.env.VITE_API_URL`)*
4. Go to [vercel.com](https://vercel.com) and sign in.
5. Click **Add New** and select **Project**.
6. Import your GitHub repository.
7. Configure the Vercel Project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend` (Crucial: points Vercel to compile inside the frontend directory)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
8. In the **Environment Variables** panel, add:
   * `VITE_API_URL`: `https://telangana-today-localisation-api.onrender.com`
9. Click **Deploy**.
10. Vercel will build the React bundles and provide a live URL (e.g., `https://telangana-today-localisation.vercel.app`).

---

## 5. Phase 4: Production Verification Checklist

To verify that the deployed system is fully functional:
1. Navigate to your live Vercel frontend URL.
2. Select a preset (e.g., *GHMC Park Cleanup*) and click **Adapt to Telugu**.
3. Check the network tab in browser developer tools to verify the request is successfully routing to the Render API endpoint.
4. Verify the translation renders correctly with cultural editor notes.
5. Submit a 5-star rating feedback and confirm the success animation appears.
6. Toggle to the **Admin Dashboard** and verify the real-time SVG charts update using analytics fetched directly from the database.
