import { useState, useEffect } from 'react';

// Common Telangana Today templates to auto-fill the form
const TEMPLATE_PRESETS = [
  {
    id: "preset-ghmc",
    label: "GHMC Park Cleanup",
    journalist: "Ramesh K.",
    tone: "Colloquial",
    dialect: "Hyderabadi",
    inputs: "Ensure focus on municipal efforts and Deccani civic vernacular",
    english: "The Greater Hyderabad Municipal Corporation (GHMC) announced a new drive to clean up municipal parks starting next Monday."
  },
  {
    id: "preset-irrigation",
    label: "Irrigation Projects",
    journalist: "Sneha Reddy",
    tone: "Formal",
    dialect: "Warangal",
    inputs: "Highlight governmental promises and administrative project names",
    english: "The minister assured that irrigation projects in the district will be completed before the monsoon season."
  },
  {
    id: "preset-bonalu",
    label: "Bonalu Festival",
    journalist: "A. Kumar",
    tone: "Colloquial",
    dialect: "Standard",
    inputs: "Infuse festival terms, energy, and localized religious greetings",
    english: "People celebrated Bonalu with high energy and traditional drums across the old city."
  },
  {
    id: "preset-sports",
    label: "Sports Victory",
    journalist: "Ramesh K.",
    tone: "Standard",
    dialect: "Standard",
    inputs: "Dynamic sports reporting, focus on final-minute tension",
    english: "Hyderabad FC clinched a dramatic victory in the final minutes of the match."
  }
];

export default function InputForm({ onSubmit, isLoading, selectedRecord }) {
  const [journalist, setJournalist] = useState('');
  const [inputs, setInputs] = useState('');
  const [english, setEnglish] = useState('');
  const [tone, setTone] = useState('Standard');
  const [dialect, setDialect] = useState('Standard');
  const [errors, setErrors] = useState({});

  // Populate form fields with selected history record
  useEffect(() => {
    if (selectedRecord) {
      setJournalist(selectedRecord.journalist || '');
      setInputs(selectedRecord.inputs || '');
      setEnglish(selectedRecord.english || '');
      setTone(selectedRecord.tone || 'Standard');
      setDialect(selectedRecord.dialect || 'Standard');
      setErrors({});
    }
  }, [selectedRecord]);

  // Handle Preset Click
  const handleApplyPreset = (preset) => {
    if (isLoading) return;
    setJournalist(preset.journalist);
    setInputs(preset.inputs);
    setEnglish(preset.english);
    setTone(preset.tone);
    setDialect(preset.dialect);
    setErrors({});
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!journalist.trim()) {
      newErrors.journalist = "Journalist name is required.";
    }
    if (!english.trim()) {
      newErrors.english = "English story draft is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ journalist, inputs, english, tone, dialect });
    }
  };

  const handleClear = () => {
    if (isLoading) return;
    setJournalist('');
    setInputs('');
    setEnglish('');
    setTone('Standard');
    setDialect('Standard');
    setErrors({});
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Adapt Story Draft</h2>
      
      {/* Template Presets */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="form-label">Quick Presets</span>
        <div className="presets-container">
          {TEMPLATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              id={preset.id}
              type="button"
              className="preset-chip"
              disabled={isLoading}
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} id="localisation-form">
        {/* Journalist Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="input-journalist">Journalist Name *</label>
          <input
            id="input-journalist"
            type="text"
            className="form-input"
            placeholder="e.g. Ramesh K."
            value={journalist}
            onChange={(e) => setJournalist(e.target.value)}
            disabled={isLoading}
          />
          {errors.journalist && <p className="form-error" id="error-journalist">{errors.journalist}</p>}
        </div>

        {/* Tone and Dialect Selectors */}
        <div className="form-selectors-grid">
          <div>
            <label className="form-label" htmlFor="select-tone">Style Tone</label>
            <select
              id="select-tone"
              className="form-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isLoading}
            >
              <option value="Standard">Standard (News Style)</option>
              <option value="Colloquial">Colloquial (Conversational)</option>
              <option value="Formal">Formal (High Literary)</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="select-dialect">Regional Dialect</label>
            <select
              id="select-dialect"
              className="form-select"
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              disabled={isLoading}
            >
              <option value="Standard">Standard (Universal)</option>
              <option value="Hyderabadi">Hyderabadi (Deccani Influence)</option>
              <option value="Warangal">Warangal (Telangana Regional)</option>
            </select>
          </div>
        </div>

        {/* Translation inputs (Context Guidelines) */}
        <div className="form-group">
          <label className="form-label" htmlFor="input-context">Additional Phrasing Context (Optional)</label>
          <input
            id="input-context"
            type="text"
            className="form-input"
            placeholder="e.g. Highlight civic accountability"
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* English Story Draft Textarea */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" htmlFor="textarea-english">English Story Draft *</label>
          <textarea
            id="textarea-english"
            className="form-textarea"
            placeholder="Paste your English news draft here..."
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            maxLength={5000}
            disabled={isLoading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
            <div>
              {errors.english && <p className="form-error" id="error-english">{errors.english}</p>}
            </div>
            <div className="char-counter" id="char-counter">
              {english.trim() === '' ? 0 : english.trim().split(/\s+/).length} words | {english.length} / 5000 chars
            </div>
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <button
            id="btn-submit-generate"
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spin-icon">⏳</span>
                Generating Adaptation...
              </>
            ) : "Adapt to Telugu"}
          </button>
          <button
            id="btn-clear-form"
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
