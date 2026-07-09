/**
 * Shared application-wide constants.
 * Import from here instead of redefining in each page.
 */

// ----- Status Badge Classes -----
export const STATUS_COLORS = {
  PENDING: 'badge-warning',
  ACTIVE: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  RECEIVED: 'badge-success',
  PAID: 'badge-success',
  DELIVERED: 'badge-success',
};

// ----- Payment Method Options (used in Invoice, VendorLedger, Expenses) -----
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH',   label: 'Cash (Physical Hand)' },
  { value: 'BANK',   label: 'Bank Transfer (Digital)' },
  { value: 'CHEQUE', label: 'Cheque' },
];

// ----- Page Header Gradient (repeated on every page) -----
export const PAGE_HEADER_STYLE = {
  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
  color: '#fff',
  padding: '24px',
};
