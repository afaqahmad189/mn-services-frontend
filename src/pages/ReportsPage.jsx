import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1565C0', '#42A5F5', '#2E7D32', '#E65100', '#C62828', '#6A1B9A'];

export default function ReportsPage() {
  const [tab, setTab] = useState('financial');
  const [financial, setFinancial] = useState(null);
  const [cases, setCases] = useState([]);
  const [pending, setPending] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });

  const load = async () => {
    const [f, c, p, m] = await Promise.all([
      api.get('/reports/financial', { params: filters }),
      api.get('/reports/cases', { params: filters }),
      api.get('/reports/pending-balances'),
      api.get('/reports/monthly-revenue'),
    ]);
    setFinancial(f.data); setCases(c.data); setPending(p.data); setMonthly(m.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📊 Reports</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Analytics & operational insights</p></div>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => window.print()}>🖨️ Print Report</button>
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="filter-bar mb-6">
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
          {['financial', 'cases', 'pending'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'financial' ? '💰 Financial' : t === 'cases' ? '📄 Case Report' : '⚠️ Pending Balances'}
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
      </div>
    </div>
  );
}
