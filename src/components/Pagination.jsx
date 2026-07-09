import React from 'react';

/**
 * Reusable pagination control.
 * Replaces the identical pagination block repeated across InvoiceListPage,
 * Ledger, VendorLedger (implicit), ReportsPage, and CustomersPage.
 *
 * Props:
 *   page      {number}   — current page (1-indexed)
 *   total     {number}   — total number of records
 *   limit     {number}   — records per page
 *   onChange  {function} — called with new page number
 *   label     {string}   — item noun for the counter (default: 'records')
 */
export default function Pagination({ page, total, limit, onChange, label = 'records' }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <button
        className="btn btn-sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ← Previous
      </button>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Page <strong>{page}</strong> of {totalPages} ({total} {label})
      </span>
      <button
        className="btn btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
