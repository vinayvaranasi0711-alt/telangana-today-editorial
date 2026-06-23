import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { generateLocalisedTranslation } from './promptEngine.js';
import { saveGeneration, getHistory, getGenerationById, saveFeedback, getQualityAnalytics, getAdminAnalytics } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON payloads (limit size to 2MB to prevent large attacks)
app.use(express.json({ limit: '2mb' }));

// Rate limiting middleware to protect translation and feedback endpoints from abuse (Day 19)
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: 'draft-7', // combined RateLimit headers
  legacyHeaders: false, // disable X-RateLimit-* headers
  message: {
    error: "Too many requests. Please wait a minute before submitting again."
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root endpoint returning API metadata
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Welcome to the Telangana Today AI Localisation & Regional Adaptation API',
    endpoints: {
      health: 'GET /api/health',
      generate: 'POST /api/generate',
      history: 'GET /api/history',
      history_detail: 'GET /api/history/:id'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Telangana Today Backend is operational' });
});

// GET /api/history endpoint
app.get('/api/history', async (req, res) => {
  try {
    const history = await getHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// GET /api/history/:id endpoint
app.get('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const record = await getGenerationById(id);
    if (!record) {
      return res.status(404).json({ error: "Generation record not found." });
    }
    res.status(200).json(record);
  } catch (error) {
    console.error("Failed to fetch generation record:", error);
    res.status(500).json({ error: "Failed to fetch generation record." });
  }
});

// GET /api/analytics/quality endpoint
app.get('/api/analytics/quality', async (req, res) => {
  try {
    const analytics = await getQualityAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Failed to fetch quality analytics:", error);
    res.status(500).json({ error: "Failed to fetch quality analytics." });
  }
});

// GET /api/admin/analytics endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const analytics = await getAdminAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    res.status(500).json({ error: "Failed to fetch admin analytics." });
  }
});

// POST /api/feedback endpoint
app.post('/api/feedback', apiRateLimiter, async (req, res) => {
  const { generationId, rating, comment } = req.body;

  // Feedback parameters validation
  if (typeof generationId !== 'string' || !generationId.trim()) {
    return res.status(400).json({ error: "generationId is required and must be a string." });
  }
  
  const ratingInt = parseInt(rating, 10);
  if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  try {
    const feedback = await saveFeedback({
      generationId,
      rating: ratingInt,
      comment: comment || ''
    });
    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(400).json({ error: error.message });
  }
});

// AI Generation Endpoint
app.post('/api/generate', apiRateLimiter, async (req, res) => {
  const { journalist, inputs, english, tone, dialect, regenerate } = req.body;
  const startTime = Date.now();

  // Basic Validation (Day 10 Requirement)
  if (typeof journalist !== 'string' || !journalist.trim()) {
    return res.status(400).json({ error: "Journalist field is required and must be a string." });
  }
  if (typeof english !== 'string' || !english.trim()) {
    return res.status(400).json({ error: "English story draft is required and must be a string." });
  }

  try {
    // Generate localization
    const response = await generateLocalisedTranslation({
      journalist,
      inputs,
      english,
      tone,
      dialect,
      regenerate
    });

    const durationMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    const record = {
      journalist,
      inputs: inputs || '',
      english,
      tone: tone || 'Standard',
      dialect: dialect || 'Standard',
      telugu_translation: response.telugu_translation,
      cultural_notes: response.cultural_notes,
      response_time_ms: durationMs,
      timestamp
    };

    const savedRecord = await saveGeneration(record);

    res.status(200).json({
      success: true,
      ...savedRecord
    });

  } catch (error) {
    console.error("Endpoint generation error:", error);
    res.status(500).json({
      error: "Failed to generate localized Telugu translation.",
      details: error.message
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Telangana Today Localisation Server started!`);
  console.log(`Running on: http://localhost:${PORT}`);
  const isMock = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE';
  console.log(`Mode: ${isMock ? 'Mock Mode (No API key found)' : 'Live AI'}`);
  console.log(`===============================================`);
});
