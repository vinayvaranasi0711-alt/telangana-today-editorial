# Telangana Today AI Localisation & Regional Language Adaptation Assistant

An advanced AI-powered localization and translation system designed specifically for the **Telangana Today** newspaper. This tool enables journalists to seamlessly adapt English news drafts into regional Telugu dialects (Standard Telugu, Hyderabadi Telugu, and Warangal/Rural Telugu) with customized tone controls (Formal, Conversational, and Editorial).

---

## 🚀 Key Features

*   **Dialect & Tone Customization**: Translate English text into localized Telugu while selecting target dialects and editorial tones.
*   **Real-time Word & Character Counters**: Visual limits and counts on input and output fields to respect print/column constraints.
*   **Star-Rating & Feedback Collection**: Localized rating system allowing journalists to score translations and leave comments.
*   **Separated Admin Analytics Dashboard**: Isolated glassmorphic analytics panel (accessible via `/#/admin` route) visualizing:
    *   System quality score trends.
    *   Dialect and tone preference distributions.
    *   Top active journalists (leaderboard).
    *   Live review feeds of feedback.
*   **Robust Backend & Rate Limiting**: Built with Express and secured with traffic throttling (**15 requests/min per IP**) to prevent API abuse.
*   **Free Translation Fallback**: Uses a resilient web scraping fallback for translations when no API keys are provided.
*   **Light/Dark Theme Toggle**: Seamless interface themes customized for visual comfort.

---

## 📁 Directory Structure

```text
├── backend/
│   ├── db.js              # Flat JSON database manager for history and analytics
│   ├── db.json            # Local JSON database storage
│   ├── promptEngine.js    # Gemini LLM instruction sets & Google Translation API scrapers
│   ├── server.js          # Express app, middleware, and route handlers
│   └── test.js            # Comprehensive 11-step integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsDashboard.jsx  # Glassmorphic stats and trend charts
│   │   │   ├── HistoryList.jsx         # Sidebar history selection and search bar
│   │   │   ├── InputForm.jsx           # Editorial parameters form
│   │   │   └── OutputDisplay.jsx        # Translation output, notes, and feedback panel
│   │   ├── App.jsx                     # Main application logic and state
│   │   └── index.css                   # Custom design system and themes (Vanilla CSS)
└── docs/                  # Project reports, presentation slide deck, and logs
```

---

## 🛠️ Local Setup

### Prerequisites
*   [Node.js](https://nodejs.org) (v18 or higher)
*   An active Google Gemini API Key (optional; a free scraper fallback is integrated)

### Setup & Run
1.  **Clone or Open the project directory**
2.  **Configure Environment Variables (Backend)**:
    Create a `backend/.env` file:
    ```env
    PORT=8085
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
3.  **Start the Backend API Server**:
    ```bash
    cd backend
    npm install
    npm start
    ```
    The server will run on `http://localhost:8085`.
4.  **Start the Frontend React Client**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    Open `http://localhost:5173` in your browser for the Translator, or `http://localhost:5173/#/admin` for the Admin Dashboard.

---

## ☁️ Deployment

Both the frontend static client and backend API server are deployed on **Render** (render.com):

### A. Backend Deployment (Web Service)
1. Create a **Web Service** on Render.
2. Select the repository `telangana-today-editorial`.
3. Set the following configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
5. Deploy and copy your backend service URL (e.g., `https://telangana-today-backend.onrender.com`).

### B. Frontend Deployment (Static Site)
1. Create a **Static Site** on Render.
2. Select the same repository `telangana-today-editorial`.
3. Set the following configuration:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: *(Your Render backend Web Service URL, without trailing slash)*
5. Deploy the Static Site.

### 🌐 Accessing Deployed Views
Once deployed, the views are separated cleanly:
* **Journalist Translator View:** `https://your-frontend.onrender.com` (Main root URL)
* **Admin Dashboard View:** `https://your-frontend.onrender.com/#/admin` (Append `#/admin` to the URL to access stats)


---

## 📄 License
This project is proprietary software developed for **Telangana Today**.
