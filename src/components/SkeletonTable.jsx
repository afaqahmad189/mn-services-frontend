import React from 'react';

/**
 * Reusable skeleton table placeholder shown while data is loading.
 * Replaces the repeated pattern of mapping over an array to produce skeleton rows.
 *
 * Props:
 *   rows     {number} — number of skeleton rows to render (default: 8)
 *   height   {number} — height in px for each skeleton row (default: 48)
 *   hasTitle {boolean} — whether to show a skeleton title row above the rows (default: true)
 */
export default function SkeletonTable({ rows = 8, height = 48, hasTitle = true }) {
  return (
    <div className="skeleton-container">
      <div className="card">
        {hasTitle && <div className="skeleton skeleton-title" />}
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="skeleton-row skeleton" style={{ height: `${height}px` }} />
        ))}
      </div>
    </div>
  );
}
