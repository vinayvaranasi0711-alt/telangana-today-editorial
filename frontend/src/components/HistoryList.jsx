import { useState } from 'react';

export default function HistoryList({ history, onSelectRecord, activeId }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search query (by author, text, dialect, tone)
  const filteredHistory = history.filter(item => {
    const journalist = (item.journalist || '').toLowerCase();
    const english = (item.english || '').toLowerCase();
    const telugu = (item.telugu_translation || '').toLowerCase();
    const dialect = (item.dialect || '').toLowerCase();
    const tone = (item.tone || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return journalist.includes(query) || 
           english.includes(query) || 
           telugu.includes(query) ||
           dialect.includes(query) ||
           tone.includes(query);
  });

  return (
    <aside className="glass-panel history-sidebar" id="history-sidebar">
      <h3 className="history-sidebar-title">Translation History</h3>
      
      {/* Search Input Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <input
          type="text"
          placeholder="🔍 Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
          id="history-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="history-empty" id="history-empty-placeholder">
          <span className="history-empty-icon">📂</span>
          <p>{history.length === 0 ? "No history yet" : "No matches found"}</p>
          <span className="history-empty-sub">
            {history.length === 0 
              ? "Your generated adaptations will appear here." 
              : "Try adjusting your search keywords."}
          </span>
        </div>
      ) : (
        <div className="history-list" id="history-list">
          {filteredHistory.map((item) => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            }) + ' ' + date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });

            // English preview text
            const previewText = item.english
              ? item.english.substring(0, 60) + (item.english.length > 60 ? '...' : '')
              : '';

            const isActive = item.id === activeId;

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className={`history-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectRecord(item.id)}
              >
                <div className="history-item-header">
                  <span className="history-item-author">{item.journalist}</span>
                  <span className="history-item-time">{formattedDate}</span>
                </div>
                <p className="history-item-preview">{previewText}</p>
                <div className="history-item-meta">
                  <span className="history-meta-tag">{item.dialect || 'Standard'}</span>
                  <span className="history-meta-tag">{item.tone || 'Standard'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
