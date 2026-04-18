export default function FilterBar({ mode, onModeChange, onDownload, matchCount, hasSelection }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 500 }}>Filter mode:</span>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input
          type="radio"
          value="OR"
          checked={mode === 'OR'}
          onChange={() => onModeChange('OR')}
        />
        OR <span style={{ color: '#aaa', fontSize: '0.8rem' }}>(any selected person)</span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input
          type="radio"
          value="AND"
          checked={mode === 'AND'}
          onChange={() => onModeChange('AND')}
        />
        AND <span style={{ color: '#aaa', fontSize: '0.8rem' }}>(all selected people together)</span>
      </label>

      <button
        onClick={onDownload}
        disabled={!hasSelection || matchCount === 0}
        style={{
          marginLeft: 'auto',
          padding: '10px 24px',
          background: hasSelection && matchCount > 0 ? '#4f8ef7' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: hasSelection && matchCount > 0 ? 'pointer' : 'not-allowed',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}
      >
        ⬇ Download {matchCount} photo{matchCount !== 1 ? 's' : ''} as ZIP
      </button>
    </div>
  );
}