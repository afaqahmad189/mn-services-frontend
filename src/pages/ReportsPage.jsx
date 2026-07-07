import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1565C0', '#42A5F5', '#2E7D32', '#E65100', '#C62828', '#6A1B9A'];

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  ACTIVE: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  RECEIVED: 'badge-success',
  PAID: 'badge-success',
  DELIVERED: 'badge-success',
};

export default function ReportsPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('financial');
  const [financial, setFinancial] = useState(null);
  const [cases, setCases] = useState([]);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesPage, setCasesPage] = useState(1);
  const [pending, setPending] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingPage, setPendingPage] = useState(1);
  const [monthly, setMonthly] = useState([]);
  const [cashBook, setCashBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', status: '', search: '', cashBookDate: new Date().toISOString().split('T')[0] });
  const limit = 20;

  const searchRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [f, c, p, m, cb] = await Promise.all([
        api.get('/reports/financial', { params: filters }),
        api.get('/reports/cases', { params: { ...filters, page: casesPage, limit } }),
        api.get('/reports/pending-balances', { params: { page: pendingPage, limit } }),
        api.get('/reports/monthly-revenue'),
        api.get('/reports/cash-book', { params: { date: filters.cashBookDate } }),
      ]);
      setFinancial(f.data);
      setCases(c.data.data);
      setCasesTotal(c.data.total);
      setPending(p.data.data);
      setPendingTotal(p.data.total);
      setMonthly(m.data);
      setCashBook(cb.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, casesPage, pendingPage]);

  useEffect(() => {
    searchRef.current?.focus();
  }, [tab]);

  return (
    <div>
      <div className='toptab' style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📊 Reports</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Analytics & operational insights</p></div>
          {hasPermission('report:print') && (
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => window.print()}>🖨️ Print Report</button>
          )}
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS - Only show for Cases and Pending Balance tabs */}
        {(tab === 'cases') && (
          <div className="filter-bar mb-6">
            <input
              ref={searchRef}
              type="text"
              className="form-control"
              style={{ width: '250px' }}
              placeholder="🔍 Search anything..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              autoFocus
            />
            <input type="date" className="form-control" style={{ width: '160px' }} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
            <span>→</span>
            <input type="date" className="form-control" style={{ width: '160px' }} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
            <select className="form-control" style={{ width: '160px' }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option>
            </select>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
              {tab === 'cases' ? `${casesTotal} results` : `${pendingTotal} results`}
            </div>
          </div>
        )}

        <div className="tabs">
          {['financial', 'cases', 'pending', 'cashbook'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'financial' ? '💰 Financial' : t === 'cases' ? '📄 Case Report' : t === 'pending' ? '⚠️ Pending Balances' : '📒 Daily Cash Book'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton-container">
            {tab === 'financial' && (
              <>
                <div className="stat-grid mb-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton skeleton-stat" />)}
                </div>
                <div className="card mb-6" style={{ height: '350px' }}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton" style={{ height: '250px' }} />
                </div>
              </>
            )}
            {(tab === 'cases' || tab === 'pending' || tab === 'cashbook') && (
              <div className="card">
                <div className="skeleton skeleton-title" />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
              </div>
            )}
          </div>
        ) : (
          <>
            {tab === 'financial' && financial && (
              <div className="stat-grid mb-6">
                {[
                  { label: 'Total Revenue', value: `Rs. ${(+financial.totalRevenue || 0).toLocaleString()}`, icon: '💰', cls: 'blue' },
                  { label: 'Total Received', value: `Rs. ${(+financial.totalReceived || 0).toLocaleString()}`, icon: '✅', cls: 'green' },
                  { label: 'Pending Collection', value: `Rs. ${(+financial.totalPending || 0).toLocaleString()}`, icon: '⏳', cls: 'orange' },
                  { label: 'Total Expenses', value: `Rs. ${(+financial.totalExpenses || 0).toLocaleString()}`, icon: '💸', cls: 'red' },
                  { label: 'Net Profit', value: `Rs. ${(+financial.profit || 0).toLocaleString()}`, icon: '📈', cls: (+financial.profit || 0) >= 0 ? 'green' : 'red' },
                  { label: 'Total Cases', value: financial.caseCount || 0, icon: '📄', cls: 'blue' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                    <div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'financial' && monthly.length > 0 && (
              <div className="card mb-6">
                <div className="card-header"><div className="card-title">📈 Monthly Revenue vs Invoiced</div></div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => `Rs. ${(+v).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="invoiced" name="Invoiced" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="received" name="Received" fill="var(--success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {tab === 'cases' && (
              <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Invoice #</th><th>Customer</th><th>Registration</th><th>Vendor</th><th>Status</th><th>Amount</th><th>Created</th></tr>
                    </thead>
                    <tbody>
                      {cases.map(inv => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                            {inv.invoiceNumber}
                          </td>
                          <td>{inv.customer?.name}</td>
                          <td>{inv.registrationNo}</td>
                          <td>{inv.vendor?.name}</td>
                          <td><span className={`badge ${STATUS_COLORS[inv.status] || 'badge-info'}`}>{inv.status}</span></td>
                          <td>Rs. {(+inv.totalAmount || 0).toLocaleString()}</td>
                          <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {casesTotal > limit && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-sm" disabled={casesPage === 1} onClick={() => setCasesPage(p => p - 1)}>← Previous</button>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Page <strong>{casesPage}</strong> of {Math.ceil(casesTotal / limit)} ({casesTotal} cases)</span>
                    <button className="btn btn-sm" disabled={casesPage >= Math.ceil(casesTotal / limit)} onClick={() => setCasesPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </div>
            )}

            {tab === 'pending' && (
              <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Customer</th><th>Invoice #</th><th>Total Bill</th><th>Amount Received</th><th>Balance</th><th>Aging</th></tr>
                    </thead>
                    <tbody>
                      {pending.map(inv => {
                        const days = Math.floor((Date.now() - new Date(inv.createdAt)) / 86400000);
                        return (
                          <tr key={inv.id}>
                            <td>{inv.customer?.name}</td>
                            <td style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                              {inv.invoiceNumber}
                            </td>
                            <td>Rs. {(+inv.totalAmount || 0).toLocaleString()}</td>
                            <td style={{ color: 'var(--success)' }}>Rs. {(+inv.amountReceived || 0).toLocaleString()}</td>
                            <td style={{ color: 'var(--danger)', fontWeight: 700 }}>Rs. {(+inv.remainingBalance || 0).toLocaleString()}</td>
                            <td><span className={`badge ${days > 30 ? 'badge-danger' : days > 15 ? 'badge-warning' : 'badge-info'}`}>{days} days</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {pendingTotal > limit && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-sm" disabled={pendingPage === 1} onClick={() => setPendingPage(p => p - 1)}>← Previous</button>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Page <strong>{pendingPage}</strong> of {Math.ceil(pendingTotal / limit)} ({pendingTotal} entries)</span>
                    <button className="btn btn-sm" disabled={pendingPage >= Math.ceil(pendingTotal / limit)} onClick={() => setPendingPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </div>
            )}

            {tab === 'cashbook' && cashBook && (
              <div>
                <div className="filter-bar mb-6" style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: '8px' }}>
                  <label style={{ fontWeight: 600 }}>Select Date:</label>
                  <input type="date" className="form-control" style={{ width: '200px' }} value={filters.cashBookDate} onChange={e => setFilters(f => ({ ...f, cashBookDate: e.target.value }))} />
                  <button className="btn btn-primary" onClick={load}>Generate Cash Book</button>
                </div>

                <div id="cash-book-printable">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* CASH IN (Urdu & English) */}
                    <div className="card">
                      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="card-title">💰 Cash In / آمدنی</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payments Received</div>
                      </div>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Customer / کسٹمر</th>
                              <th>Invoice / انوائس</th>
                              <th>Amount / رقم</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cashBook.cashIn.map(item => (
                              <tr key={item.id}>
                                <td>{item.customer?.name}</td>
                                <td>{item.invoice?.invoiceNumber}</td>
                                <td style={{ color: 'var(--success)', fontWeight: 600 }}>Rs. {(+item.amount).toLocaleString()}</td>
                              </tr>
                            ))}
                            {cashBook.cashIn.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No income today</td></tr>}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: 'var(--success-50)', fontWeight: 700 }}>
                              <td colSpan={2}>Total Cash In / کل آمدنی</td>
                              <td style={{ color: 'var(--success)' }}>Rs. {cashBook.totalIn.toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* CASH OUT (Urdu & English) */}
                    <div className="card">
                      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="card-title">💸 Cash Out / اخراجات</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expenses & Vendor Payments</div>
                      </div>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Type / قسم</th>
                              <th>Description / تفصیل</th>
                              <th>Amount / رقم</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cashBook.cashOut.map(item => (
                              <tr key={item.id}>
                                <td>
                                  {item._source === 'VENDOR_PAYMENT' ? (
                                    <span>
                                      <span className="badge badge-warning" style={{ marginRight: '6px', fontSize: '0.7rem' }}>Vendor</span>
                                      {item.vendor?.name || 'Vendor Payment'}
                                    </span>
                                  ) : (
                                    <span>
                                      <span className="badge badge-info" style={{ marginRight: '6px', fontSize: '0.7rem' }}>Expense</span>
                                      {item.category || '—'}
                                    </span>
                                  )}
                                </td>
                                <td style={{ fontSize: '0.875rem' }}>{item.description || '—'}</td>
                                <td style={{ color: 'var(--danger)', fontWeight: 600 }}>Rs. {(+item.amount).toLocaleString()}</td>
                              </tr>
                            ))}
                            {cashBook.cashOut.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No expenses today</td></tr>}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: 'var(--danger-50)', fontWeight: 700 }}>
                              <td colSpan={2}>Total Cash Out / کل اخراجات</td>
                              <td style={{ color: 'var(--danger)' }}>Rs. {cashBook.totalOut.toLocaleString()}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY CARD */}
                  <div className="card mt-6" style={{ background: 'var(--primary)', color: '#fff', textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>NET CASH IN HAND / خالص نقد رقم</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>Rs. {cashBook.netCash.toLocaleString()}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '4px' }}>Date: {new Date(cashBook.date).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
