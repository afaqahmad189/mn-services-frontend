import React, { useState, useRef, useEffect } from 'react';

/**
 * SearchableSelect — A searchable dropdown replacement for <select>
 * Props:
 *   options: Array<{ value, label }> | Array<string>
 *   value: current selected value
 *   onChange: (value) => void
 *   placeholder?: string
 *   disabled?: boolean
 *   required?: boolean
 *   id?: string
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  required = false,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize options to { value, label }
  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const selectedOption = normalized.find((o) => String(o.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : '';

  const filtered = normalized.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`ss-container${open ? ' ss-open' : ''}${disabled ? ' ss-disabled' : ''}`} ref={containerRef} id={id}>
      {/* Trigger */}
      <div className="ss-trigger form-control" onClick={handleOpen} tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}>
        <span className={`ss-value${!displayLabel ? ' ss-placeholder' : ''}`}>
          {displayLabel || placeholder}
        </span>
        <div className="ss-icons">
          {value !== '' && value !== null && value !== undefined && (
            <span className="ss-clear" onClick={handleClear} title="Clear">✕</span>
          )}
          <span className="ss-arrow">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="ss-dropdown">
          <div className="ss-search-wrap">
            <span className="ss-search-icon">🔍</span>
            <input
              ref={inputRef}
              className="ss-search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
                if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0]);
              }}
            />
          </div>
          <div className="ss-list">
            {filtered.length === 0 ? (
              <div className="ss-no-results">No results found</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`ss-option${String(opt.value) === String(value) ? ' ss-selected' : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  {String(opt.value) === String(value) && <span className="ss-check">✓</span>}
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value || ''}
          onChange={() => {}}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          tabIndex={-1}
        />
      )}
    </div>
  );
}
