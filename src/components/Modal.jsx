import React from 'react';

/**
 * Reusable modal overlay wrapper.
 * Replaces the repeated modal-overlay > modal > modal-header/body/footer pattern.
 *
 * Props:
 *   open      {boolean}   — controls visibility
 *   onClose   {function}  — called when clicking overlay or ✕ button
 *   title     {string|ReactNode} — modal header title
 *   children  {ReactNode} — modal body content
 *   footer    {ReactNode} — modal footer content (buttons)
 *   size      {'sm'|'md'|'lg'} — optional size variant (default: 'md')
 */
export default function Modal({ open, onClose, title, children, footer, size }) {
  if (!open) return null;

  const sizeStyle = size === 'sm'
    ? { maxWidth: '420px' }
    : size === 'lg'
    ? { maxWidth: '760px' }
    : { maxWidth: '560px' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={sizeStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
