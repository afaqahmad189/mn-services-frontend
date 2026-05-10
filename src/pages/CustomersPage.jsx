import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', cnic: '', email: '', address: '' });
  const [editId, setEditId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/customers', { params: { page, limit: 20, search } });
    setCustomers(data.data); setTotal(data.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (c) => { setForm(c); setEditId(c.id); setModal(true); };
  const openNew = () => { setForm({ name: '', phone: '', cnic: '', email: '', address: '' }); setEditId(null); setModal(true); };

  const save = async () => {
    if (editId) await api.put(`/customers/${editId}`, form);
    else await api.post('/customers', form);
    setModal(false); load();
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>👥 Customers</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{total} customers registered</p></div>
          <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={openNew}>+ New Customer</button>
        </div>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          <div className="header-search" style={{ flex: 1 }}>
            <span>🔍</span>
            <input placeholder="Search name, phone, CNIC..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} autoFocus />
          </div>
          <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>CNIC</th><th>Total Invoiced</th><th>Paid</th><th>Balance</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
                : customers.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">👥</div><h3>No customers found</h3></div></td></tr>
                : customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.cnic || '—'}</td>
                    <td>Rs. {(+c.totalDebit || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--success)' }}>Rs. {(+c.totalCredit || 0).toLocaleString()}</td>
                    <td><span className={`badge ${+c.balance > 0 ? 'badge-danger' : 'badge-success'}`}>Rs. {(+c.balance || 0).toLocaleString()}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/customers/${c.id}`)}>View</button>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editId ? 'Edit Customer' : 'New Customer'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid">
                {[['Name', 'name', true], ['Phone', 'phone', true], ['CNIC', 'cnic'], ['Email', 'email'], ['Address', 'address']].map(([label, field, req]) => (
                  <div key={field} className="form-group">
                    <label className={`form-label${req ? ' required' : ''}`}>{label}</label>
                    <input className="form-control" value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required={req} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
