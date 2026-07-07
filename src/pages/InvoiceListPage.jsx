import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/SearchableSelect';

const STATUS_BADGE = {
  DRAFT: 'badge-gray', ACTIVE: 'badge-info',
  COMPLETED: 'badge-success', CANCELLED: 'badge-danger',
};
const CHALLAN_BADGE = {
  PENDING: 'badge-warning', RECEIVED: 'badge-info', PAID: 'badge-success',
};
const PLATE_BADGE = {
  PENDING: 'badge-warning', RECEIVED_IN_OFFICE: 'badge-info',
  CUSTOMER_INFORMED: 'badge-primary', DELIVERED: 'badge-success',
};

export default function InvoiceListPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || '';
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/invoices', { params: { page, limit, search, status } });
      setInvoices(data.data);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📄 Invoice / Cases</h1>
            <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '4px' }}>
              {total} total cases in the system
            </p>
          </div>
          {can('create') && (
            <button className="btn btn-primary" style={{ background: '#fff', color: 'var(--primary)' }} onClick={() => navigate('/invoices/new')}>
              ➕ New Invoice
            </button>
          )}
        </div>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          <div className="header-search" style={{ flex: 1, minWidth: '220px' }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search registration, customer, invoice..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <SearchableSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              placeholder="All Statuses"
            />
          </div>
        </div>

        {loading && page === 1 ? (
          <div className="skeleton-container">
            <div className="card">
              <div className="skeleton skeleton-title" />
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Organization</th>
                    <th>Customer Name</th>
                    <th>Registration No.</th>
                    <th>Challan</th>
                    <th>Plate</th>
                    <th>Status</th>
                    <th>Total Bill</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>No invoices found</td></tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{inv.invoiceNumber}</td>
                        <td>
                          {inv.customer?.name}
                        </td>
                        <td>
                          {inv.customerName}
                        </td>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.registrationNo}</span></td>
                        <td><span className={`badge ${CHALLAN_BADGE[inv.challanStatus]}`}>{inv.challanStatus}</span></td>
                        <td><span className={`badge ${PLATE_BADGE[inv.plateStatus]}`}>{inv.plateStatus}</span></td>
                        <td><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                        <td>Rs. {(+inv.totalAmount).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                            onClick={() => navigate(`/invoices/${inv.id}`)}
                          >
                            👁️ View Details
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Page <strong>{page}</strong> of {totalPages}</span>
                <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
