import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1565C0', '#42A5F5', '#2E7D32', '#E65100', '#C62828', '#6A1B9A'];

export default function ReportsPage() {
  const { hasPermission } = useAuth();
  const [tab, setTab] = useState('financial');
  const [financial, setFinancial] = useState(null);
  const [cases, setCases] = useState([]);
  const [pending, setPending] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [cashBook, setCashBook] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', status: '', search: '', cashBookDate: new Date().toISOString().split('T')[0] });

  const load = async () => {
    const [f, c, p, m, cb] = await Promise.all([
      api.get('/reports/financial', { params: filters }),
      api.get('/reports/cases', { params: filters }),
      api.get('/reports/pending-balances'),
      api.get('/reports/monthly-revenue'),
      api.get('/reports/cash-book', { params: { date: filters.cashBookDate } }),
    ]);
    setFinancial(f.data); setCases(c.data); setPending(p.data); setMonthly(m.data); setCashBook(cb.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📊 Reports</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Analytics & operational insights</p></div>
          {hasPermission('report:print') && (
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => window.print()}>🖨️ Print Report</button>
          )}
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="filter-bar mb-6">
          <input type="text" className="form-control" style={{ width: '200px' }} placeholder="Search invoice/customer..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} autoFocus />
          <input type="date" className="form-control" style={{ width: '160px' }} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
          <span>→</span>
          <input type="date" className="form-control" style={{ width: '160px' }} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
          <select className="form-control" style={{ width: '160px' }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={load}>Apply Filters</button>
        </div>

        {/* FINANCIAL SUMMARY */}
        {financial && (
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

        <div className="tabs">
          {['financial', 'cases', 'pending', 'cashbook'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'financial' ? '💰 Financial' : t === 'cases' ? '📄 Case Report' : t === 'pending' ? '⚠️ Pending Balances' : '📒 Daily Cash Book'}
            </button>
          ))}
        </div>

        {tab === 'financial' && monthly.length > 0 && (
          <div className="card mb-6">
            <div className="card-header"><div className="card-title">📈 Monthly Revenue vs Invoiced</div></div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `Rs. ${(+v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="invoiced" name="Invoiced" fill="var(--primary)" radius={[4,4,0,0]} />
                <Bar dataKey="received" name="Received" fill="var(--success)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 'cases' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead><tr><th>Invoice No.</th><th>Customer</th><th>Reg. No.</th><th>Excise Office</th><th>Status</th><th>Challan</th><th>Total</th><th>Balance</th><th>Date</th></tr></thead>
                <tbody>
                  {cases.length === 0 ? <tr><td colSpan={9}><div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">📊</div><h3>No data</h3></div></td></tr>
                  : cases.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{inv.customer?.name}</td>
                      <td>{inv.registrationNo}</td>
                      <td>{inv.exciseOffice}</td>
                      <td><span className={`badge ${inv.status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>{inv.status}</span></td>
                      <td><span className={`badge ${inv.challanStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{inv.challanStatus}</span></td>
                      <td>Rs. {(+inv.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ color: +inv.remainingBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>Rs. {(+inv.remainingBalance || 0).toLocaleString()}</td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'pending' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead><tr><th>Invoice No.</th><th>Customer</th><th>Phone</th><th>Total</th><th>Received</th><th>Balance</th><th>Days Open</th></tr></thead>
                <tbody>
                  {pending.length === 0 ? <tr><td colSpan={7}><div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">✅</div><h3>No pending balances!</h3></div></td></tr>
                  : pending.map(inv => {
                    const days = Math.floor((Date.now() - new Date(inv.createdAt)) / 86400000);
                    return (
                      <tr key={inv.id}>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td style={{ fontWeight: 600 }}>{inv.customer?.name}</td>
                        <td>{inv.customer?.phone}</td>
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily Expenses</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Category / کیٹیگری</th>
                          <th>Description / تفصیل</th>
                          <th>Amount / رقم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashBook.cashOut.map(item => (
                          <tr key={item.id}>
                            <td>{item.category}</td>
                            <td>{item.description}</td>
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
      </div>
    </div>
  );
}
