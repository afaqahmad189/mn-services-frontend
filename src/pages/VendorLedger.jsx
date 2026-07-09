import React, { useEffect, useState, useRef } from 'react';
import { api } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportToExcel, computeRunningBalance, todayISO } from '../utils/helpers';

export default function VendorLedgerPage() {
  const [view, setView] = useState('overview'); // 'overview' or 'detail'
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [payModal, setPayModal] = useState(false);
  const [payment, setPayment] = useState({
    amount: '',
    paymentMethod: 'CASH',
    description: '',
    transactionDate: todayISO(),
  });
  const [savingPayment, setSavingPayment] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendors');
      setVendors(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await api.get('/vendors');
        const list = res.data || [];
        setVendors(list);

        const stateVendorId = location.state?.openVendorId;
        if (stateVendorId) {
          const matched = list.find(v => v.id === stateVendorId);
          if (matched) {
            setSelectedVendor(matched);
            setView('detail');
            const lRes = await api.get(`/vendors/${stateVendorId}/ledger`);

            setLedger(computeRunningBalance(lRes.data, 'vendor'));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [location.state?.openVendorId]);

  useEffect(() => {
    if (view === 'overview' && !location.state?.openVendorId) {
      loadOverview();
    }
  }, [view]);

  const openLedger = async (vendor) => {
    setSelectedVendor(vendor);
    setView('detail');
    setLoading(true);
    try {
      const [vRes, lRes] = await Promise.all([
        api.get(`/vendors`),
        api.get(`/vendors/${vendor.id}/ledger`)
      ]);
      const freshVendor = vRes.data.find(v => v.id === vendor.id);
      if (freshVendor) setSelectedVendor(freshVendor);

      setLedger(computeRunningBalance(lRes.data, 'vendor'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payment.amount || +payment.amount <= 0) return alert('Please enter a valid amount');
    setSavingPayment(true);
    try {
      await api.post(`/vendors/${selectedVendor.id}/payment`, payment);
      setPayModal(false);
      setPayment({
        amount: '',
        paymentMethod: 'CASH',
        description: '',
        transactionDate: todayISO(),
      });
      openLedger(selectedVendor);
    } catch (err) {
      alert('Error recording payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPayment(false);
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase())
  );

  const totalOwed = vendors.reduce((sum, v) => sum + (+v.balance > 0 ? +v.balance : 0), 0);
  const totalAdvance = vendors.reduce((sum, v) => sum + (+v.balance < 0 ? Math.abs(+v.balance) : 0), 0);

  if (view === 'detail') {
    return (
      <div>
        <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
          <button className="btn btn-sm mb-4" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => { setView('overview'); if (location.state) location.state.openVendorId = null; }}>
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
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                🏢 Vendor Ledger: {selectedVendor?.name}
              </h1>
              <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>
                {selectedVendor?.city} • {selectedVendor?.phone || "No phone"} •{" "}
                {selectedVendor?.email || "No email"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn"
                style={{
                  background: "#fff",
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
                onClick={() => exportToExcel(ledger)}
              >
                📊 Export Excel
              </button>

              <button
                className="btn"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  fontWeight: 600,
                }}
                onClick={() => setPayModal(true)}
              >
                💸 Record Payment
              </button>
            </div>
          </div>
        </div>

        <div className="page-content">
          {/* STATS */}
          <div className="stat-grid mb-6">
            <div className="stat-card">
              <div className="stat-icon blue">📈</div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>Rs. {(+selectedVendor?.totalCredit || 0).toLocaleString()}</div>
                <div className="stat-label">Total Owed (Charges)</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>Rs. {(+selectedVendor?.totalDebit || 0).toLocaleString()}</div>
                <div className="stat-label">Total Paid (Debits)</div>
              </div>
            </div>
            <div className="stat-card">
              <div className={`stat-icon ${+selectedVendor?.balance > 0 ? 'red' : +selectedVendor?.balance < 0 ? 'green' : 'blue'}`}>
                {+selectedVendor?.balance > 0 ? '⚠️' : '💰'}
              </div>
              <div>
                <div className="stat-value" style={{
                  fontSize: '1.25rem',
                  color: +selectedVendor?.balance > 0 ? 'var(--danger)' : +selectedVendor?.balance < 0 ? 'var(--success)' : 'inherit'
                }}>
                  Rs. {Math.abs(+selectedVendor?.balance || 0).toLocaleString()}
                </div>
                <div className="stat-label">
                  {+selectedVendor?.balance > 0 ? 'Outstanding Payable' : +selectedVendor?.balance < 0 ? 'Advance Paid (Negative Balance)' : 'Fully Settled'}
                </div>
              </div>
            </div>
          </div>

          {/* LEDGER TABLE */}
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div className="skeleton-container" style={{ padding: '24px' }}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Invoice Link</th>
                      <th>Debit / Paid (Rs.)</th>
                      <th>Credit / Owed (Rs.)</th>
                      <th>Running Balance (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No transactions found</td></tr>
                    ) : (
                      ledger.map((entry) => (
                        <tr key={entry.id}>
                          <td>{new Date(entry.transactionDate || entry.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{entry.description}</div>
                            {entry.paymentMethod && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>
                                {entry.paymentMethod}
                              </span>
                            )}
                            {entry.referenceNo && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Ref: {entry.referenceNo}
                              </span>
                            )}
                          </td>
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
                          <td style={{ color: 'var(--success)', fontWeight: entry.type === 'DEBIT' ? 600 : 400 }}>
                            {entry.type === 'DEBIT' ? entry.amount.toLocaleString() : '—'}
                          </td>
                          <td style={{ color: 'var(--danger)', fontWeight: entry.type === 'CREDIT' ? 600 : 400 }}>
                            {entry.type === 'CREDIT' ? entry.amount.toLocaleString() : '—'}
                          </td>
                          <td style={{
                            fontWeight: 700,
                            color: entry.runningBalance > 0 ? 'var(--danger)' : entry.runningBalance < 0 ? 'var(--success)' : 'inherit'
                          }}>
                            Rs. {entry.runningBalance.toLocaleString()} {entry.runningBalance > 0 ? '(Owed)' : entry.runningBalance < 0 ? '(Adv.)' : ''}
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

        {/* PAYMENT MODAL */}
        {payModal && (
          <div className="modal-overlay" onClick={() => setPayModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-header">
                  <div className="modal-title">💸 Record Vendor Payment</div>
                  <button type="button" className="btn-icon" onClick={() => setPayModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group mb-4">
                    <label className="form-label required">Amount Paid (Rs.)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={payment.amount}
                      onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))}
                      required
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="form-group mb-4">
                    <label className="form-label required">Payment Method</label>
                    <select
                      className="form-control"
                      value={payment.paymentMethod}
                      onChange={e => setPayment(p => ({ ...p, paymentMethod: e.target.value }))}
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div className="form-group mb-4">
                    <label className="form-label">Payment Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={payment.transactionDate}
                      onChange={e => setPayment(p => ({ ...p, transactionDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description / Reference</label>
                    <input
                      className="form-control"
                      value={payment.description}
                      onChange={e => setPayment(p => ({ ...p, description: e.target.value }))}
                      placeholder="e.g. Paid via mobile app / Cheque #987654"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setPayModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={savingPayment}>
                    {savingPayment ? 'Saving...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📒 Vendor Ledgers Overview</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Track accounts payable and advances paid to excise offices/vendors</p>
      </div>

      <div className="page-content">
        {loading && vendors.length === 0 ? (
          <div className="skeleton-container">
            <div className="stat-grid mb-6">
              <div className="skeleton skeleton-stat" />
              <div className="skeleton skeleton-stat" />
            </div>
            <div className="card">
              <div className="skeleton skeleton-title" />
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
            </div>
          </div>
        ) : (
          <>
            {/* STATS OVERVIEW */}
            <div className="stat-grid mb-6">
              <div className="stat-card">
                <div className="stat-icon red">💸</div>
                <div>
                  <div className="stat-value">Rs. {totalOwed.toLocaleString()}</div>
                  <div className="stat-label">Total Outstanding Payable</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">📥</div>
                <div>
                  <div className="stat-value">Rs. {totalAdvance.toLocaleString()}</div>
                  <div className="stat-label">Total Advance Paid</div>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="filter-bar mb-6">
              <input
                ref={searchRef}
                type="text"
                className="form-control"
                style={{ width: '300px' }}
                placeholder="🔍 Search vendor name or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Showing {filteredVendors.length} of {vendors.length} vendors
              </div>
            </div>

            {/* VENDORS LIST TABLE */}
            <div className="card" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Vendor / Office Name</th>
                      <th>City</th>
                      <th>Phone</th>
                      <th>Owed (Credit)</th>
                      <th>Paid (Debit)</th>
                      <th>Outstanding Balance</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>No vendors found</td></tr>
                    ) : (
                      filteredVendors.map(v => (
                        <tr key={v.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{v.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ID: {v.id}</div>
                          </td>
                          <td><span className="badge badge-primary">{v.city}</span></td>
                          <td>{v.phone || '—'}</td>
                          <td>Rs. {(+v.totalCredit || 0).toLocaleString()}</td>
                          <td>Rs. {(+v.totalDebit || 0).toLocaleString()}</td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              color: +v.balance > 0 ? 'var(--danger)' : +v.balance < 0 ? 'var(--success)' : 'inherit',
                              fontSize: '1rem'
                            }}>
                              Rs. {Math.abs(+v.balance || 0).toLocaleString()}
                              <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '4px' }}>
                                {+v.balance > 0 ? '(Owed)' : +v.balance < 0 ? '(Adv.)' : '(Settled)'}
                              </span>
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                              onClick={() => openLedger(v)}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
