# Telangana Today AI Localisation & Regional Language Adaptation Assistant

An advanced AI-powered localization and translation system designed specifically for the **Telangana Today** newspaper. This tool enables journalists to seamlessly adapt English news drafts into regional Telugu dialects (Standard Telugu, Hyderabadi Telugu, and Warangal/Rural Telugu) with customized tone controls (Formal, Conversational, and Editorial).

---

## 🚀 Key Features

*   **Dialect & Tone Customization**: Translate English text into localized Telugu while selecting target dialects and editorial tones.
*   **Real-time Word & Character Counters**: Visual limits and counts on input and output fields to respect print/column constraints.
*   **Star-Rating & Feedback Collection**: Localized rating system allowing journalists to score translations and leave comments.
*   **Admin Analytics Dashboard**: Glassmorphic analytics panel visualizing:
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
    Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment

### Backend (Render)
1.  Create a **Web Service** on [Render](https://render.com).
2.  Select the root directory as `backend`.
3.  Set the start command to `node server.js` and build command to `npm install`.
4.  Configure the `GEMINI_API_KEY` environment variable.

### Frontend (Vercel)
1.  Create a project on [Vercel](https://vercel.com).
2.  Select the root directory as `frontend`.
3.  Configure the environment variable `VITE_API_URL` pointing to your Render backend web service.

---

## 📄 License
This project is proprietary software developed for **Telangana Today**.
