import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../context/AuthContext';
import SearchableSelect from '../components/SearchableSelect';

export default function ExpensesPage() {
  const [heads, setHeads] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState('records');
  const [headModal, setHeadModal] = useState(false);
  const [recModal, setRecModal] = useState(false);
  const [headForm, setHeadForm] = useState({ name: '', description: '' });
  const [recForm, setRecForm] = useState({ headId: '', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0], paymentMethod: 'CASH' });
  const [filters, setFilters] = useState({ from: '', to: '', headId: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, r, s] = await Promise.all([
        api.get('/expenses/heads'),
        api.get('/expenses', { params: filters }),
        api.get('/expenses/summary', { params: { from: filters.from, to: filters.to } }),
      ]);
      setHeads(h.data);
      setRecords(r.data.data || []);
      setTotal(r.data.totalAmount || 0);
      setSummary(s.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const saveHead = async () => { await api.post('/expenses/heads', headForm); setHeadModal(false); setHeadForm({ name: '', description: '' }); load(); };
  const saveRecord = async () => { await api.post('/expenses', recForm); setRecModal(false); setRecForm(f => ({ ...f, amount: '', description: '' })); load(); };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>💸 Daily Expenses</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Total shown: Rs. {total.toLocaleString()}</p></div>
          <div className='expenseBtn' style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setHeadModal(true)}>+ Expense Head</button>
            <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={() => setRecModal(true)}>+ Add Expense</button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          {['records', 'heads'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'records' ? '📋 Expense Records' : '🗂️ Expense Heads'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton-container">
            <div className="stat-grid mb-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-stat" />)}
            </div>
            <div className="card">
              <div className="skeleton skeleton-title" />
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '48px' }} />)}
            </div>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="stat-grid mb-6">
              {summary.map(s => (
                <div key={s.headName} className="stat-card">
                  <div className="stat-icon orange">💸</div>
                  <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>Rs. {(+s.total || 0).toLocaleString()}</div><div className="stat-label">{s.headName}</div></div>
                </div>
              ))}
            </div>

            {tab === 'records' && (
              <>
                <div className="filter-bar">
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input type="date" className="form-control" style={{ width: '160px' }} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} placeholder="From" />
                    <span>→</span>
                    <input type="date" className="form-control" style={{ width: '160px' }} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
                  </div>
                  <div style={{ width: '200px' }}>
                    <SearchableSelect
                      options={[{ value: '', label: 'All Heads' }, ...heads.map(h => ({ value: String(h.id), label: h.name }))]}
                      value={String(filters.headId)}
                      onChange={(v) => setFilters(f => ({ ...f, headId: v }))}
                      placeholder="All Heads"
                    />
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨️ Print</button>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Date</th><th>Head</th><th>Description</th><th>Method</th><th>Amount</th><th>Added By</th></tr></thead>
                      <tbody>
                        {records.length === 0 ? <tr><td colSpan={6}><div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">💸</div><h3>No expenses recorded</h3></div></td></tr>
                          : records.map(r => (
                            <tr key={r.id}>
                              <td style={{ fontSize: '0.8rem' }}>{r.expenseDate}</td>
                              <td><span className="badge badge-primary">{r.head?.name}</span></td>
                              <td>{r.description}</td>
                              <td><span className="badge badge-gray">{r.paymentMethod}</span></td>
                              <td style={{ fontWeight: 700, color: 'var(--danger)' }}>Rs. {(+r.amount).toLocaleString()}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.createdBy?.fullName}</td>
                            </tr>
                          ))}
                      </tbody>
                      {records.length > 0 && (
                        <tfoot>
                          <tr style={{ background: 'var(--primary-50)' }}>
                            <td colSpan={4} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>TOTAL</td>
                            <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--danger)', fontSize: '1rem' }}>Rs. {total.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </>
            )}

            {tab === 'heads' && (
              <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Description</th><th>Status</th></tr></thead>
                    <tbody>
                      {heads.map(h => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 600 }}>{h.name}</td>
                          <td>{h.description || '—'}</td>
                          <td><span className={`badge ${h.isActive ? 'badge-success' : 'badge-gray'}`}>{h.isActive ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* HEAD MODAL */}
      {headModal && (
        <div className="modal-overlay" onClick={() => setHeadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">🗂️ New Expense Head</div><button className="btn-icon" onClick={() => setHeadModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group mb-4"><label className="form-label required">Head Name</label><input className="form-control" value={headForm.name} onChange={e => setHeadForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Office Rent" /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={headForm.description} onChange={e => setHeadForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setHeadModal(false)}>Cancel</button><button className="btn btn-primary" onClick={saveHead}>Save Head</button></div>
          </div>
        </div>
      )}

      {/* RECORD MODAL */}
      {recModal && (
        <div className="modal-overlay" onClick={() => setRecModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">💸 Add Expense</div><button className="btn-icon" onClick={() => setRecModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label required">Expense Head</label>
                  <SearchableSelect
                    options={[{ value: '', label: 'Select Head...' }, ...heads.map(h => ({ value: String(h.id), label: h.name }))]}
                    value={String(recForm.headId)}
                    onChange={(v) => setRecForm(f => ({ ...f, headId: v }))}
                    placeholder="Select Head..."
                  />
                </div>
                <div className="form-group"><label className="form-label required">Amount (Rs.)</label><input type="number" className="form-control" value={recForm.amount} onChange={e => setRecForm(f => ({ ...f, amount: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label required">Date</label><input type="date" className="form-control" value={recForm.expenseDate} onChange={e => setRecForm(f => ({ ...f, expenseDate: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Payment Method</label>
                  <SearchableSelect
                    options={[
                      { value: 'CASH', label: 'Cash' },
                      { value: 'BANK', label: 'Bank' },
                      { value: 'CHEQUE', label: 'Cheque' },
                    ]}
                    value={recForm.paymentMethod}
                    onChange={(v) => setRecForm(f => ({ ...f, paymentMethod: v }))}
                    placeholder="Select method..."
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-control" rows={2} value={recForm.description} onChange={e => setRecForm(f => ({ ...f, description: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setRecModal(false)}>Cancel</button><button className="btn btn-primary" onClick={saveRecord}>Save Expense</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
