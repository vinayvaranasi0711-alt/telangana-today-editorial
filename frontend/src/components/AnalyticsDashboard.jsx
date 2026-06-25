import React, { useState } from 'react';

export default function AnalyticsDashboard({ 
  data, 
  isLoading, 
  error, 
  onRefresh, 
  lastUpdated, 
  onClearHistory, 
  presets = [], 
  onCreatePreset, 
  onDeletePreset,
  isAdminAuthed,
  setIsAdminAuthed
}) {
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Form states for adding dynamic highlight news presets
  const [presetLabel, setPresetLabel] = useState('');
  const [presetJournalist, setPresetJournalist] = useState('');
  const [presetInputs, setPresetInputs] = useState('');
  const [presetEnglish, setPresetEnglish] = useState('');
  const [presetTone, setPresetTone] = useState('Standard');
  const [presetDialect, setPresetDialect] = useState('Standard');
  const [presetError, setPresetError] = useState('');
  const [presetSuccess, setPresetSuccess] = useState('');

  const handleAuthenticate = async (e) => {
    e.preventDefault();
    setAuthError('');
    const success = await onRefresh(password);
    if (success) {
      sessionStorage.setItem('admin_authed', 'true');
      sessionStorage.setItem('admin_password', password);
      setAuthError('');
      setIsAdminAuthed(true);
    } else {
      setAuthError('Incorrect Admin Password. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed');
    sessionStorage.removeItem('admin_password');
    setIsAdminAuthed(false);
    window.location.hash = '#/';
  };

  const handleSubmitPreset = async (e) => {
    e.preventDefault();
    setPresetError('');
    setPresetSuccess('');
    if (!presetLabel.trim() || !presetJournalist.trim() || !presetEnglish.trim()) {
      setPresetError("Preset Title, Journalist Name, and English Story Draft are required.");
      return;
    }
    const success = await onCreatePreset({
      label: presetLabel,
      journalist: presetJournalist,
      inputs: presetInputs,
      english: presetEnglish,
      tone: presetTone,
      dialect: presetDialect
    });
    if (success) {
      setPresetSuccess("Highlight Preset added successfully!");
      // Reset fields
      setPresetLabel('');
      setPresetJournalist('');
      setPresetInputs('');
      setPresetEnglish('');
      setPresetTone('Standard');
      setPresetDialect('Standard');
      // Clear success message after 3 seconds
      setTimeout(() => setPresetSuccess(''), 3000);
    }
  };

  if (!isAdminAuthed) {
    return (
      <div className="glass-panel dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', maxWidth: '440px', margin: '4rem auto', padding: '2.5rem' }}>
        <form onSubmit={handleAuthenticate} style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Admin Verification Required</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.8rem' }}>Please enter the administrator password to view metrics.</p>
          
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" htmlFor="admin-pin">Admin Password</label>
            <input 
              id="admin-pin"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ backgroundColor: 'rgba(11, 19, 41, 0.4)' }}
              required
            />
            {authError && <p className="form-error" style={{ marginTop: '0.5rem', color: 'var(--accent-coral)' }}>{authError}</p>}
          </div>

          <button className="btn btn-primary" type="submit" style={{ marginTop: '1rem', width: '100%' }}>
            Verify Access
          </button>
          
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={() => { window.location.hash = '#/'; }}
            style={{ marginTop: '0.8rem', width: '100%' }}
          >
            ⬅️ Cancel & Go Back
          </button>
        </form>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="glass-panel dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <div className="pulse-loader">
          <div className="output-placeholder-icon">📊</div>
          <h3>Aggregating Editorial Metrics...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Calculating distributions, feedback ratios, and daily trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <div style={{ textAlign: 'center', color: 'var(--accent-coral)' }}>
          <div className="output-placeholder-icon" style={{ color: 'var(--accent-coral)' }}>⚠️</div>
          <h3>Failed to Load Analytics</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={onRefresh}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    total_generations = 0,
    total_feedback = 0,
    average_rating = 0,
    average_latency_ms = 0,
    distributions = { dialects: {}, tones: {} },
    top_journalists = [],
    daily_trend = [],
    feedback_logs = []
  } = data;

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!feedback_logs || feedback_logs.length === 0) {
      alert("No logs available to export.");
      return;
    }

    const headers = ["Timestamp", "Journalist", "English Draft", "Telugu Translation", "Style Tone", "Regional Dialect", "Rating", "Comments"];
    const rows = feedback_logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      `"${(log.journalist || '').replace(/"/g, '""')}"`,
      `"${(log.english || '').replace(/"/g, '""')}"`,
      `"${(log.telugu_translation || '').replace(/"/g, '""')}"`,
      log.tone || 'Standard',
      log.dialect || 'Standard',
      log.rating,
      `"${(log.comment || '').replace(/"/g, '""')}"`
    ]);

    const csvString = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `editorial_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Dynamic SVG Chart Calculations ---
  const chartHeight = 150;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Find max value in trend for scaling
  const maxGenerationsCount = Math.max(...daily_trend.map(d => d.count), 5); // Default min peak to 5 for aesthetics

  // Generate SVG Points for Daily Count Trend
  let pathD = '';
  let areaD = '';
  let points = [];

  if (daily_trend.length > 0) {
    daily_trend.forEach((item, index) => {
      const x = paddingLeft + (index / Math.max(daily_trend.length - 1, 1)) * graphWidth;
      const y = chartHeight - paddingBottom - (item.count / maxGenerationsCount) * graphHeight;
      
      points.push({ x, y, date: item.date, count: item.count, rating: item.average_rating });

      if (index === 0) {
        pathD = `M ${x} ${y}`;
        areaD = `M ${x} ${chartHeight - paddingBottom} L ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        areaD += ` L ${x} ${y}`;
      }

      if (index === daily_trend.length - 1) {
        areaD += ` L ${x} ${chartHeight - paddingBottom} Z`;
      }
    });
  }

  // Helper to render stars
  const renderStars = (score) => {
    const rounded = Math.round(score);
    return (
      <span style={{ color: 'var(--accent-teal)', fontSize: '1.05rem' }}>
        {'★'.repeat(rounded) + '☆'.repeat(5 - rounded)}
      </span>
    );
  };

  // Safe percentage helper for progress bars
  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="dashboard-container" id="admin-dashboard-view">
      
      {/* Top Banner */}
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Editorial Quality & Usage Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time analytics and editor feedback ratings overview</p>
        </div>
        <div className="dashboard-header-actions">
          {lastUpdated && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', animation: 'fadeIn 0.3s ease' }}>
              Last updated: {lastUpdated}
            </span>
          )}
          <button className="btn-copy" onClick={onRefresh} style={{ height: '38px', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
            🔄 Refresh Stats
          </button>
          <button className="btn-copy" onClick={handleExportCSV} style={{ height: '38px', borderColor: 'rgba(0, 245, 212, 0.3)', color: 'var(--accent-teal)' }}>
            📥 Export Excel
          </button>
          <button className="btn-copy" onClick={onClearHistory} style={{ height: '38px', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--accent-coral)', backgroundColor: 'rgba(239,68,68,0.08)' }}>
            🗑️ Clear History
          </button>
          <button 
            className="btn-copy" 
            onClick={() => { window.location.hash = '#/'; }} 
            style={{ height: '38px', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)' }}
          >
            ⬅️ Back to Translator
          </button>
          <button 
            className="btn-copy" 
            onClick={handleLogout} 
            style={{ height: '38px', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--accent-coral)', backgroundColor: 'rgba(239,68,68,0.05)' }}
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="dashboard-metrics-grid">
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <span className="metric-label">Total Localisations</span>
          <h3 className="metric-value" style={{ color: 'var(--accent-cyan)' }}>{total_generations}</h3>
          <span className="metric-subtext">Total adaptations executed</span>
        </div>
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <span className="metric-label">Editorial Ratings</span>
          <h3 className="metric-value" style={{ color: 'var(--accent-emerald)' }}>{total_feedback}</h3>
          <span className="metric-subtext">Assessed translations log</span>
        </div>
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <span className="metric-label">Average Quality Score</span>
          <h3 className="metric-value" style={{ color: 'var(--accent-teal)' }}>
            {average_rating > 0 ? `${average_rating} / 5.0` : 'N/A'}
          </h3>
          <span className="metric-subtext">
            {average_rating > 0 ? renderStars(average_rating) : 'No reviews logged'}
          </span>
        </div>
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
          <span className="metric-label">Avg AI Latency</span>
          <h3 className="metric-value" style={{ color: '#d8b4fe' }}>
            {average_latency_ms > 0 ? `${(average_latency_ms / 1000).toFixed(2)}s` : 'N/A'}
          </h3>
          <span className="metric-subtext">Gemini response latency</span>
        </div>
      </div>

      {/* Grid: Charts & Distributions */}
      <div className="dashboard-sections-grid">
        
        {/* Daily Volume Trend Line Chart */}
        <div className="glass-panel dashboard-card">
          <h4 className="dashboard-card-title">Daily Localisation Volume</h4>
          
          {daily_trend.length === 0 ? (
            <div className="dashboard-empty-state">
              <span>📈</span>
              <p>Not enough trend data to render chart.</p>
            </div>
          ) : (
            <div className="chart-wrapper">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-teal)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent-teal)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingTop + ratio * graphHeight;
                  const label = Math.round(maxGenerationsCount * (1 - ratio));
                  return (
                    <g key={i}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        fill="var(--text-dim)"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {points.map((pt, i) => {
                  if (points.length > 5 && i % 2 !== 0) return null; // Reduce labels count if long
                  const dateStr = new Date(pt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  return (
                    <text
                      key={i}
                      x={pt.x}
                      y={chartHeight - 12}
                      fill="var(--text-dim)"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {dateStr}
                    </text>
                  );
                })}

                {/* Glowing Area under curve */}
                {areaD && <path d={areaD} fill="url(#chart-area-grad)" />}

                {/* Main Trend Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--accent-teal)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0px 2px 6px rgba(0, 245, 212, 0.3))' }}
                  />
                )}

                {/* Data Points hover handles */}
                {points.map((pt, i) => (
                  <g key={i} className="chart-dot-group">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="var(--bg-primary)"
                      stroke="var(--accent-teal)"
                      strokeWidth="2"
                    />
                    {/* Tooltip trigger or label */}
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      fill="var(--accent-teal)"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="chart-dot-label"
                    >
                      {pt.count}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Tone & Dialect Preferences */}
        <div className="glass-panel dashboard-card">
          <h4 className="dashboard-card-title">Preference Breakdowns</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '100%', alignItems: 'center' }}>
            
            {/* Tone Distribution */}
            <div>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tone Styles
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Standard', 'Colloquial', 'Formal'].map((tone) => {
                  const val = distributions.tones[tone] || 0;
                  const pct = getPercentage(val, total_generations);
                  return (
                    <div key={tone}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <span>{tone}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{val} ({pct}%)</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill fill-cyan" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dialect Distribution */}
            <div>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Regional Dialects
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Standard', 'Hyderabadi', 'Warangal'].map((dialect) => {
                  const val = distributions.dialects[dialect] || 0;
                  const pct = getPercentage(val, total_generations);
                  return (
                    <div key={dialect}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <span>{dialect}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{val} ({pct}%)</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill fill-teal" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Grid: Journalist Leaderboard & Recent Feedback Logs */}
      <div className="dashboard-sections-grid" style={{ gridTemplateColumns: '280px 1fr' }}>
        
        {/* Top Contributors */}
        <div className="glass-panel dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 className="dashboard-card-title">Top Editorial Contributors</h4>
          {top_journalists.length === 0 ? (
            <div className="dashboard-empty-state">
              <p>No editor logs recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'center' }}>
              {top_journalists.map((j, i) => (
                <div key={i} className="leaderboard-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="leaderboard-rank">{i + 1}</span>
                    <span className="leaderboard-name">{j.name}</span>
                  </div>
                  <span className="leaderboard-count">{j.count} drafts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Feedback Logs Table */}
        <div className="glass-panel dashboard-card">
          <h4 className="dashboard-card-title">Recent Editor Feedback Reviews</h4>
          
          {feedback_logs.length === 0 ? (
            <div className="dashboard-empty-state">
              <span>💬</span>
              <p>No editorial ratings or feedback reviews logged yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Editor</th>
                    <th>Score</th>
                    <th>Review comments</th>
                    <th>Dialect/Tone</th>
                    <th>Draft Preview</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback_logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{log.journalist}</td>
                      <td>{renderStars(log.rating)}</td>
                      <td style={{ fontStyle: log.comment ? 'normal' : 'italic', color: log.comment ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                        {log.comment || 'No comment added'}
                      </td>
                      <td>
                        <span className="history-meta-tag" style={{ marginRight: '0.3rem' }}>{log.dialect}</span>
                        <span className="history-meta-tag">{log.tone}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} title={log.english}>
                        {log.english.substring(0, 45)}...
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Highlight News Presets Form Section (Admin only) */}
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
          📢 Manage Highlight News Presets
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="form-selectors-grid">
          
          {/* Create Preset Form */}
          <form onSubmit={handleSubmitPreset}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-teal)', fontSize: '1rem' }}>Add New Highlight Story</h4>
            {presetError && <p className="form-error" style={{ color: 'var(--accent-coral)', marginBottom: '1rem' }}>{presetError}</p>}
            {presetSuccess && <p style={{ color: 'var(--accent-emerald)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{presetSuccess}</p>}
            
            <div className="form-group">
              <label className="form-label" htmlFor="preset-title">Preset Title *</label>
              <input 
                id="preset-title"
                type="text"
                className="form-input"
                placeholder="e.g. Bonalu Festival"
                value={presetLabel}
                onChange={(e) => setPresetLabel(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }} className="form-selectors-grid">
              <div>
                <label className="form-label" htmlFor="preset-journalist">Journalist Name *</label>
                <input 
                  id="preset-journalist"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh K."
                  value={presetJournalist}
                  onChange={(e) => setPresetJournalist(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="preset-context">Phrasing Context (Optional)</label>
                <input 
                  id="preset-context"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Highlight festive energy"
                  value={presetInputs}
                  onChange={(e) => setPresetInputs(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }} className="form-selectors-grid">
              <div>
                <label className="form-label" htmlFor="preset-select-tone">Style Tone</label>
                <select
                  id="preset-select-tone"
                  className="form-select"
                  value={presetTone}
                  onChange={(e) => setPresetTone(e.target.value)}
                >
                  <option value="Standard">Standard (News Style)</option>
                  <option value="Colloquial">Colloquial (Conversational)</option>
                  <option value="Formal">Formal (High Literary)</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="preset-select-dialect">Regional Dialect</label>
                <select
                  id="preset-select-dialect"
                  className="form-select"
                  value={presetDialect}
                  onChange={(e) => setPresetDialect(e.target.value)}
                >
                  <option value="Standard">Standard (Universal)</option>
                  <option value="Hyderabadi">Hyderabadi (Deccani Influence)</option>
                  <option value="Warangal">Warangal (Telangana Regional)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="preset-english">English Story Draft *</label>
              <textarea 
                id="preset-english"
                className="form-textarea"
                placeholder="Paste the English draft that this preset will load..."
                value={presetEnglish}
                onChange={(e) => setPresetEnglish(e.target.value)}
                style={{ minHeight: '100px' }}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              ➕ Create Highlight Preset
            </button>
          </form>

          {/* Existing Presets List */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>Active Highlight News ({presets.length})</h4>
            {presets.length === 0 ? (
              <div className="dashboard-empty-state" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2rem' }}>
                <p>No custom highlight presets added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '440px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {presets.map((preset) => (
                  <div key={preset.id} className="leaderboard-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{preset.label}</span>
                      <button 
                        onClick={() => onDeletePreset(preset.id)}
                        className="btn-copy"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--accent-coral)', backgroundColor: 'rgba(239,68,68,0.05)' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>By {preset.journalist}</span> • <span>{preset.dialect} / {preset.tone}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {preset.english}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
