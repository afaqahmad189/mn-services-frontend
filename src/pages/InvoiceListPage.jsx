import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';

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
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
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
          <button className="btn btn-primary" style={{ background: '#fff', color: 'var(--primary)' }} onClick={() => navigate('/invoices/new')}>
            ➕ New Invoice
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="filter-bar">
          <div className="header-search" style={{ flex: 1, minWidth: '220px' }}>
            <span>🔍</span>
            <input
              type="text" placeholder="Search by invoice no, reg no, customer..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={fetchInvoices}>🔄 Refresh</button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨️ Print</button>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Reg. No.</th>
                  <th>Excise Office</th>
                  <th>Status</th>
                  <th>Challan</th>
                  <th>Plate</th>
                  <th>Bill Amt</th>
                  <th>Balance</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={11}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📄</div>
                      <h3>No invoices found</h3>
                      <p>Create your first invoice to get started</p>
                      <button className="btn btn-primary mt-4" onClick={() => navigate('/invoices/new')}>➕ Create Invoice</button>
                    </div>
                  </td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{inv.invoiceNumber}</strong></td>
                    <td>{inv.customer?.name || '—'}</td>
                    <td>{inv.registrationNo || '—'}</td>
                    <td>{inv.exciseOffice || '—'}</td>
                    <td><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                    <td><span className={`badge ${CHALLAN_BADGE[inv.challanStatus]}`}>{inv.challanStatus}</span></td>
                    <td><span className={`badge ${PLATE_BADGE[inv.numberPlateStatus] || 'badge-gray'}`}>{inv.numberPlateStatus?.replace(/_/g,' ')}</span></td>
                    <td style={{ fontWeight: 600 }}>Rs. {(+inv.totalAmount || 0).toLocaleString()}</td>
                    <td style={{ color: +inv.remainingBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                      Rs. {(+inv.remainingBalance || 0).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/invoices/${inv.id}`)}>View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-sm btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="btn btn-sm btn-outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
