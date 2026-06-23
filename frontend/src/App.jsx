import { useState, useEffect } from 'react';
import InputForm from './components/InputForm.jsx';
import OutputDisplay from './components/OutputDisplay.jsx';
import HistoryList from './components/HistoryList.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085';

export default function App() {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Analytics/Dashboard States
  const [viewMode, setViewMode] = useState('translator'); // 'translator' or 'analytics'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Fetch detailed admin metrics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics`);
      const data = await response.json();
      if (response.ok) {
        setAnalyticsData(data);
      } else {
        throw new Error(data.error || "Failed to load analytics reports.");
      }
    } catch (err) {
      console.error("Failed to connect to analytics endpoint:", err);
      setAnalyticsError(err.message || "Unable to connect to the admin database.");
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  // History States
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch History List from Backend API
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/history`);
      const data = await response.json();
      if (response.ok) {
        setHistory(data);
      } else {
        console.error("Failed to load history list:", data.error);
      }
    } catch (err) {
      console.error("Failed to connect to history endpoint:", err);
    }
  };

  // Load History on Mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch specific history detail and update view states
  const handleSelectRecord = async (id) => {
    setActiveHistoryId(id);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/history/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch adaptation details.");
      }
      setOutput(data);
      setSelectedRecord(data);
    } catch (err) {
      console.error("Fetch record details error:", err);
      setError(err.message || "Failed to fetch adaptation details.");
    }
  };

  // Handle Form Submission - Call Backend Express API
  const handleAdaptStory = async (formData) => {
    setLastSubmittedData(formData);
    setIsLoading(true);
    setError(null);
    setOutput(null);
    setSelectedRecord(null);
    setActiveHistoryId(null);

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "API server returned an error.");
      }

      setOutput(data);
      setActiveHistoryId(data.id);
      setSelectedRecord(data);
      // Refresh sidebar list
      fetchHistory();
    } catch (err) {
      console.error("API Connection Error:", err);
      setError(err.message || "Unable to connect to the translation backend. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Regeneration of the active translation using existing params
  const handleRegenerateTranslation = async () => {
    const activeParams = output || selectedRecord;
    if (!activeParams) return;

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalist: activeParams.journalist,
          inputs: activeParams.inputs,
          english: activeParams.english,
          tone: activeParams.tone,
          dialect: activeParams.dialect,
          regenerate: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "API server returned an error.");
      }

      setOutput(data);
      setActiveHistoryId(data.id);
      setSelectedRecord(data);
      fetchHistory();
    } catch (err) {
      console.error("Regeneration Error:", err);
      setError(err.message || "Failed to regenerate translation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Retry of failed adaptation request
  const handleRetry = () => {
    if (lastSubmittedData) {
      handleAdaptStory(lastSubmittedData);
    }
  };

  // Handle Feedback Submission - POST to Backend API (Day 16)
  const handleSubmittingFeedback = async (generationId, rating, comment) => {
    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generationId, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback rating.");
      }

      // Local state update: attach feedback to output and selectedRecord to update UI instantly
      if (output && output.id === generationId) {
        setOutput(prev => ({ ...prev, feedback: data.feedback }));
      }
      if (selectedRecord && selectedRecord.id === generationId) {
        setSelectedRecord(prev => ({ ...prev, feedback: data.feedback }));
      }

      // Refresh history sidebar list
      fetchHistory();
      return true;
    } catch (err) {
      console.error("Feedback submission connection error:", err);
      return false;
    }
  };

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="app-header" style={{ position: 'relative' }}>
        {/* Floating Theme Toggle Switch */}
        <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-copy"
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: 'var(--accent-teal)',
              background: 'transparent'
            }}
            id="btn-theme-toggle"
            type="button"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <div className="app-logo">TELANGANA TODAY • EDITORIAL AI</div>
        <h1 className="app-title">
          AI Localisation & <span className="gradient-text">Regional Adaptation</span> Assistant
        </h1>
        <p className="app-subtitle" style={{ marginBottom: '1.5rem' }}>
          Translate English stories into culturally resonant, dialect-aware Telugu phrasing for regional editions.
        </p>

        {/* View Mode Selector */}
        <div className="view-selector">
          <button 
            id="nav-btn-translator"
            className={`view-btn ${viewMode === 'translator' ? 'active' : ''}`}
            onClick={() => setViewMode('translator')}
          >
            ✍️ Translator
          </button>
          <button 
            id="nav-btn-analytics"
            className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('analytics');
              fetchAnalytics();
            }}
          >
            📊 Admin Dashboard
          </button>
        </div>
      </header>

      {/* Conditional Rendering based on viewMode */}
      {viewMode === 'translator' ? (
        <main className="app-grid">
          <HistoryList
            history={history}
            onSelectRecord={handleSelectRecord}
            activeId={activeHistoryId}
          />
          <InputForm
            onSubmit={handleAdaptStory}
            isLoading={isLoading}
            selectedRecord={selectedRecord}
          />
          <OutputDisplay 
            output={output} 
            isLoading={isLoading} 
            error={error} 
            onRegenerate={handleRegenerateTranslation}
            onRetry={handleRetry}
            onSubmitFeedback={handleSubmittingFeedback}
          />
        </main>
      ) : (
        <main style={{ marginTop: '1rem' }}>
          <AnalyticsDashboard
            data={analyticsData}
            isLoading={analyticsLoading}
            error={analyticsError}
            onRefresh={fetchAnalytics}
          />
        </main>
      )}

    </div>
  );
}
