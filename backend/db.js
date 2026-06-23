import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Schema Migration: If db is a flat array (old format), wrap it
    if (Array.isArray(parsed)) {
      return {
        generations: parsed,
        feedback: []
      };
    }
    
    // Ensure both collections exist
    if (!parsed.generations) parsed.generations = [];
    if (!parsed.feedback) parsed.feedback = [];
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { generations: [], feedback: [] };
    }
    throw error;
  }
}

async function writeDb(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function saveGeneration(record) {
  const id = crypto.randomUUID();
  const newRecord = {
    id,
    ...record,
    timestamp: record.timestamp || new Date().toISOString()
  };
  const db = await readDb();
  db.generations.push(newRecord);
  await writeDb(db);
  return newRecord;
}

export async function getHistory() {
  const db = await readDb();
  // Sort generations by timestamp (newest first), ensuring safety against missing/invalid dates
  return [...db.generations].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp) : null;
    const dateB = b.timestamp ? new Date(b.timestamp) : null;
    const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
    const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
    return timeB - timeA;
  });
}

export async function getGenerationById(id) {
  const db = await readDb();
  const generation = db.generations.find(record => record.id === id) || null;
  
  if (generation) {
    const copiedGeneration = { ...generation };
    // Attach feedback details if available
    const feedbackList = db.feedback.filter(fb => fb.generationId === id);
    if (feedbackList.length > 0) {
      copiedGeneration.feedback = feedbackList[feedbackList.length - 1]; // Return latest feedback
    }
    return copiedGeneration;
  }
  
  return null;
}

export async function saveFeedback({ generationId, rating, comment }) {
  const db = await readDb();
  
  // Verify generation exists
  const generationExists = db.generations.some(gen => gen.id === generationId);
  if (!generationExists) {
    throw new Error(`Generation record with ID ${generationId} does not exist.`);
  }

  const id = crypto.randomUUID();
  const newFeedback = {
    id,
    generationId,
    rating: parseInt(rating, 10),
    comment: comment || '',
    timestamp: new Date().toISOString()
  };

  db.feedback.push(newFeedback);
  await writeDb(db);
  return newFeedback;
}

export async function getQualityAnalytics() {
  const db = await readDb();
  const totalGenerations = db.generations.length;
  
  // 1. Calculate Average Rating
  const totalFeedbackCount = db.feedback.length;
  let averageRating = 0;
  if (totalFeedbackCount > 0) {
    const sum = db.feedback.reduce((acc, curr) => acc + curr.rating, 0);
    averageRating = Math.round((sum / totalFeedbackCount) * 10) / 10;
  }

  // 2. Average Latency (Response Time)
  let averageLatencyMs = 0;
  if (totalGenerations > 0) {
    const sumLatency = db.generations.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0);
    averageLatencyMs = Math.round(sumLatency / totalGenerations);
  }

  // 3. Daily Generations counts
  const dailyCounts = {};
  db.generations.forEach(gen => {
    const timestamp = gen.timestamp || new Date().toISOString();
    const date = new Date(timestamp);
    const dateKey = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
  });

  // 4. Quality trend (Daily average rating)
  const dailyFeedbackSum = {};
  const dailyFeedbackCount = {};
  db.feedback.forEach(fb => {
    const timestamp = fb.timestamp || new Date().toISOString();
    const date = new Date(timestamp);
    const dateKey = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    dailyFeedbackSum[dateKey] = (dailyFeedbackSum[dateKey] || 0) + fb.rating;
    dailyFeedbackCount[dateKey] = (dailyFeedbackCount[dateKey] || 0) + 1;
  });

  const allDates = new Set([
    ...Object.keys(dailyCounts),
    ...Object.keys(dailyFeedbackSum)
  ]);

  const dailyTrend = Array.from(allDates).map(date => {
    const count = dailyCounts[date] || 0;
    const ratingSum = dailyFeedbackSum[date] || 0;
    const ratingCount = dailyFeedbackCount[date] || 0;
    return {
      date,
      count,
      average_rating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    total_generations: totalGenerations,
    total_feedback: totalFeedbackCount,
    average_rating: averageRating,
    average_latency_ms: averageLatencyMs,
    daily_trend: dailyTrend
  };
}

export async function getAdminAnalytics() {
  const db = await readDb();
  const totalGenerations = db.generations.length;
  
  // 1. Calculate General Metrics (Averages & Latencies)
  const totalFeedbackCount = db.feedback.length;
  let averageRating = 0;
  if (totalFeedbackCount > 0) {
    const sum = db.feedback.reduce((acc, curr) => acc + curr.rating, 0);
    averageRating = Math.round((sum / totalFeedbackCount) * 10) / 10;
  }

  let averageLatencyMs = 0;
  if (totalGenerations > 0) {
    const sumLatency = db.generations.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0);
    averageLatencyMs = Math.round(sumLatency / totalGenerations);
  }

  // 2. Dialect and Tone Distributions
  const dialectCounts = { Standard: 0, Hyderabadi: 0, Warangal: 0 };
  const toneCounts = { Standard: 0, Colloquial: 0, Formal: 0 };
  
  db.generations.forEach(gen => {
    const dialect = gen.dialect || 'Standard';
    const tone = gen.tone || 'Standard';
    
    if (dialectCounts[dialect] !== undefined) {
      dialectCounts[dialect]++;
    } else {
      dialectCounts[dialect] = 1;
    }
    
    if (toneCounts[tone] !== undefined) {
      toneCounts[tone]++;
    } else {
      toneCounts[tone] = 1;
    }
  });

  // 3. Top Journalists (Contributions count)
  const journalistCounts = {};
  db.generations.forEach(gen => {
    const name = gen.journalist || 'Unknown';
    journalistCounts[name] = (journalistCounts[name] || 0) + 1;
  });
  
  const topJournalists = Object.keys(journalistCounts).map(name => ({
    name,
    count: journalistCounts[name]
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Limit to top 5

  // 4. Daily Generation trend
  const dailyCounts = {};
  db.generations.forEach(gen => {
    const timestamp = gen.timestamp || new Date().toISOString();
    const date = new Date(timestamp);
    const dateKey = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
  });

  const dailyFeedbackSum = {};
  const dailyFeedbackCount = {};
  db.feedback.forEach(fb => {
    const timestamp = fb.timestamp || new Date().toISOString();
    const date = new Date(timestamp);
    const dateKey = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    dailyFeedbackSum[dateKey] = (dailyFeedbackSum[dateKey] || 0) + fb.rating;
    dailyFeedbackCount[dateKey] = (dailyFeedbackCount[dateKey] || 0) + 1;
  });

  const allDates = new Set([
    ...Object.keys(dailyCounts),
    ...Object.keys(dailyFeedbackSum)
  ]);

  const dailyTrend = Array.from(allDates).map(date => {
    const count = dailyCounts[date] || 0;
    const ratingSum = dailyFeedbackSum[date] || 0;
    const ratingCount = dailyFeedbackCount[date] || 0;
    return {
      date,
      count,
      average_rating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // 5. Detailed Feedback Log (latest feedback items first, joined with generation details)
  const feedbackLogs = db.feedback.map(fb => {
    const generation = db.generations.find(g => g.id === fb.generationId) || {};
    return {
      id: fb.id,
      generationId: fb.generationId,
      rating: fb.rating,
      comment: fb.comment,
      timestamp: fb.timestamp,
      journalist: generation.journalist || 'Unknown',
      english: generation.english || '',
      telugu_translation: generation.telugu_translation || '',
      tone: generation.tone || 'Standard',
      dialect: generation.dialect || 'Standard'
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    total_generations: totalGenerations,
    total_feedback: totalFeedbackCount,
    average_rating: averageRating,
    average_latency_ms: averageLatencyMs,
    distributions: {
      dialects: dialectCounts,
      tones: toneCounts
    },
    top_journalists: topJournalists,
    daily_trend: dailyTrend,
    feedback_logs: feedbackLogs
  };
}

export async function clearHistory() {
  const emptyDb = { generations: [], feedback: [] };
  await writeDb(emptyDb);
  return emptyDb;
}

