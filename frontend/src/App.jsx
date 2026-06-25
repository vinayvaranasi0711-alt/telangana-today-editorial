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
  const [viewMode, setViewMode] = useState(window.location.hash === '#/admin' ? 'analytics' : 'translator'); // 'translator' or 'analytics'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [analyticsLastUpdated, setAnalyticsLastUpdated] = useState(null);
  const [presets, setPresets] = useState([]); // Dynamic Highlight News Presets
  const [isAdminAuthed, setIsAdminAuthed] = useState(
    sessionStorage.getItem('admin_authed') === 'true' && !!sessionStorage.getItem('admin_password')
  );

  // Fetch detailed admin metrics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('admin_password') || ''}`
        }
      });
      if (response.status === 401) {
        sessionStorage.removeItem('admin_authed');
        sessionStorage.removeItem('admin_password');
        setIsAdminAuthed(false);
        throw new Error("Unauthorized: Admin password is incorrect or session expired.");
      }
      const data = await response.json();
      if (response.ok) {
        setAnalyticsData(data);
        setAnalyticsLastUpdated(new Date().toLocaleTimeString());
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

  // Hash-based Routing Listener (Day 25 requirement modification)
  useEffect(() => {
    const handleHashChange = () => {
      const isDashboard = window.location.hash === '#/admin';
      setViewMode(isDashboard ? 'analytics' : 'translator');
      if (isDashboard) {
        fetchAnalytics();
      }
    };

    if (window.location.hash === '#/admin') {
      fetchAnalytics();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
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

  // Fetch dynamic presets list from Backend API
  const fetchPresets = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/presets`);
      const data = await response.json();
      if (response.ok) {
        setPresets(data);
      } else {
        console.error("Failed to load presets list:", data.error);
      }
    } catch (err) {
      console.error("Failed to connect to presets endpoint:", err);
    }
  };

  // Load History & Presets on Mount
  useEffect(() => {
    fetchHistory();
    fetchPresets();
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

  // Handle Clearing Database History (Wipe out all records)
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all translation history and analytics? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/history/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('admin_password') || ''}`
        }
      });
      if (response.status === 401) {
        sessionStorage.removeItem('admin_authed');
        sessionStorage.removeItem('admin_password');
        setIsAdminAuthed(false);
        alert("Unauthorized: Admin password is incorrect or session expired.");
        return;
      }
      if (response.ok) {
        setHistory([]);
        setOutput(null);
        setSelectedRecord(null);
        setActiveHistoryId(null);
        setAnalyticsData({
          total_generations: 0,
          total_feedback: 0,
          average_rating: 0,
          average_latency_ms: 0,
          distributions: { dialects: { Standard: 0, Hyderabadi: 0, Warangal: 0 }, tones: { Standard: 0, Colloquial: 0, Formal: 0 } },
          top_journalists: [],
          daily_trend: [],
          feedback_logs: []
        });
        alert("Translation history cleared successfully!");
      } else {
        alert("Failed to clear history from database.");
      }
    } catch (err) {
      console.error("Clear history connection error:", err);
      alert("Unable to connect to backend to clear history.");
    }
  };

  // Handle creating a new highlight news preset (Admin only)
  const handleCreatePreset = async (presetData) => {
    try {
      const response = await fetch(`${API_BASE}/api/presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_password') || ''}`
        },
        body: JSON.stringify(presetData)
      });
      if (response.status === 401) {
        sessionStorage.removeItem('admin_authed');
        sessionStorage.removeItem('admin_password');
        setIsAdminAuthed(false);
        alert("Unauthorized: Admin password is incorrect or session expired.");
        return false;
      }
      const data = await response.json();
      if (response.ok) {
        setPresets(prev => [...prev, data]);
        return true;
      } else {
        alert(data.error || "Failed to create preset.");
        return false;
      }
    } catch (err) {
      console.error("Create preset connection error:", err);
      alert("Unable to connect to backend to create preset.");
      return false;
    }
  };

  // Handle deleting a preset (Admin only)
  const handleDeletePreset = async (id) => {
    if (!window.confirm("Are you sure you want to delete this highlight news preset?")) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/presets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('admin_password') || ''}`
        }
      });
      if (response.status === 401) {
        sessionStorage.removeItem('admin_authed');
        sessionStorage.removeItem('admin_password');
        setIsAdminAuthed(false);
        alert("Unauthorized: Admin password is incorrect or session expired.");
        return;
      }
      if (response.ok) {
        setPresets(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Failed to delete preset from database.");
      }
    } catch (err) {
      console.error("Delete preset connection error:", err);
      alert("Unable to connect to backend to delete preset.");
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
            presets={presets}
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
            lastUpdated={analyticsLastUpdated}
            onClearHistory={handleClearHistory}
            presets={presets}
            onCreatePreset={handleCreatePreset}
            onDeletePreset={handleDeletePreset}
            isAdminAuthed={isAdminAuthed}
            setIsAdminAuthed={setIsAdminAuthed}
          />
        </main>
      )}

    </div>
  );
}
