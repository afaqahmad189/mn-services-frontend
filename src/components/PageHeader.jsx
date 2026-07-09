import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGE_HEADER_STYLE } from '../utils/constants';

/**
 * Reusable gradient page header used across all pages.
 *
 * Props:
 *   title    {string|ReactNode} — main heading text (can include emoji)
 *   subtitle {string|ReactNode} — smaller text below the title (optional)
 *   actions  {ReactNode}        — buttons / controls on the right side (optional)
 *   backTo   {string}           — if provided, shows a "← Back" button navigating to this path (optional)
 *   backLabel {string}          — custom label for the back button (default: "← Back")
 */
export default function PageHeader({ title, subtitle, actions, backTo, backLabel = '← Back' }) {
  const navigate = useNavigate();

  return (
    <div style={PAGE_HEADER_STYLE}>
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            marginBottom: '8px',
            fontSize: '0.8rem',
          }}
        >
          {backLabel}
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h1>
          {subtitle && (
            <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{actions}</div>}
      </div>
    </div>
  );
}
