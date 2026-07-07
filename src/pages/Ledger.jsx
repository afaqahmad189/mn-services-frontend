import React, { useEffect, useState, useRef } from 'react';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../utils/helpers';

export default function LedgerPage() {
  const [view, setView] = useState('overview'); // 'overview' or 'detail'
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ totalReceivable: 0 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const limit = 15;

  const loadOverview = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/customers', { params: { page, limit, search } }),
        api.get('/customers/stats')
      ]);
      setCustomers(cRes.data.data);
      setTotalCustomers(cRes.data.total);
      setStats(sRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'overview') {
      const timer = setTimeout(loadOverview, 500);
      return () => clearTimeout(timer);
    }
  }, [view, page, search]);

  const openLedger = (customer) => {
    setSelectedCustomer(customer);
    setView('detail');
    setLoading(true);
    api.get(`/customers/${customer.id}/ledger`).then(r => {
      // Calculate running balance: Sort by date ASC, sum up, then reverse for display
      const sorted = [...r.data].sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.createdAt);
        const dateB = new Date(b.transactionDate || b.createdAt);
        return dateA - dateB || a.id - b.id; // Use ID as secondary sort for same-day entries
      });

      let balance = 0;
      const withBalance = sorted.map(entry => {
        if (entry.type === 'DEBIT') balance += +entry.amount;
        else balance -= +entry.amount;
        return { ...entry, runningBalance: balance };
      });

      setLedger(withBalance.reverse());
    }).finally(() => setLoading(false));
  };

  if (view === 'detail') {
    return (
      <div>
        <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
          <button className="btn btn-sm mb-4" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => setView('overview')}>
            ← Back to Overview
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                📒 Ledger: {selectedCustomer?.name}
              </h1>
              <p style={{ opacity: 0.8, fontSize: "0.875rem", margin: "6px 0 0" }}>
                {selectedCustomer?.phone} • {selectedCustomer?.cnic}
              </p>
            </div>

            <button
              className="btn"
              style={{
                background: "#fff",
                color: "var(--primary)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
              onClick={() => exportToExcel(ledger)}
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        <div className="page-content">
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div className="skeleton-container" style={{ padding: '24px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Payment Method</th>
                      <th>Invoice</th>
                      <th>Debit (Rs.)</th>
                      <th>Credit (Rs.)</th>
                      <th>Balance (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No transactions found</td></tr>
                    ) : (
                      ledger.map((entry) => (
                        <tr key={entry.id}>
                          <td>{new Date(entry.transactionDate || entry.createdAt).toLocaleDateString()}</td>
                          <td>{entry.description}</td>
                          <td>{entry.paymentMethod}</td>
                          <td>
                            {entry.invoiceId ? (
                              <span
                                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => navigate(`/invoices/${entry.invoiceId}`)}
                              >
                                {entry.invoice?.invoiceNumber || `#${entry.invoiceId}`}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ color: 'var(--danger)', fontWeight: entry.type === 'DEBIT' ? 600 : 400 }}>
                            {entry.type === 'DEBIT' ? entry.amount.toLocaleString() : '—'}
                          </td>
                          <td style={{ color: 'var(--success)', fontWeight: entry.type === 'CREDIT' ? 600 : 400 }}>
                            {entry.type === 'CREDIT' ? entry.amount.toLocaleString() : '—'}
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            Rs. {entry.runningBalance?.toLocaleString() || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📒 Customer Ledger Overview</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Monitor all customer balances and transaction histories</p>
      </div>

      <div className="page-content">
        {loading && page === 1 ? (
          <div className="skeleton-container">
            <div className="stat-grid mb-6">
              <div className="skeleton skeleton-stat" />
              <div className="skeleton skeleton-stat" />
            </div>
            <div className="card">
              <div className="skeleton skeleton-title" />
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
            </div>
          </div>
        ) : (
          <>
            {/* SUMMARY CARD */}
            <div className="stat-grid mb-6">
              <div className="stat-card">
                <div className="stat-icon blue">💰</div>
                <div>
                  <div className="stat-value">Rs. {stats.totalReceivable.toLocaleString()}</div>
                  <div className="stat-label">Total Receivable</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">👥</div>
                <div>
                  <div className="stat-value">{totalCustomers}</div>
                  <div className="stat-label">Total Customers</div>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="filter-bar mb-6">
              <input
                ref={searchRef}
                type="text"
                className="form-control"
                style={{ width: '300px' }}
                placeholder="🔍 Search customer name, phone, or CNIC..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                autoFocus
              />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Showing {customers.length} of {totalCustomers} customers
              </div>
            </div>

            {/* CUSTOMER LIST TABLE */}
            <div className="card" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>CNIC</th>
                      <th>Outstanding Balance</th>
                      <th>Last Transaction</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No customers found</td></tr>
                    ) : (
                      customers.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ID: {c.id}</div>
                          </td>
                          <td>{c.phone}</td>
                          <td>{c.cnic || '—'}</td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              color: +c.balance > 0 ? 'var(--danger)' : 'var(--success)',
                              fontSize: '1rem'
                            }}>
                              Rs. {(+c.balance || 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                              onClick={() => openLedger(c)}
                            >
                              👁️ View Ledger
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalCustomers > limit && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Page <strong>{page}</strong> of {Math.ceil(totalCustomers / limit)}</span>
                  <button className="btn btn-sm" disabled={page >= Math.ceil(totalCustomers / limit)} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
