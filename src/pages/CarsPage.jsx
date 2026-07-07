import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', cnic: '', email: '', address: '' });
  const [editId, setEditId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/cars', { params: { page, limit: 20, search } });
    setCars(data.data); setTotal(data.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (c) => { setForm(c); setEditId(c.id); setModal(true); };
  const openNew = () => { setForm({ name: '', phone: '', cnic: '', email: '', address: '' }); setEditId(null); setModal(true); };

  const save = async () => {
    if (editId) await api.put(`/cars/${editId}`, form);
    else await api.post('/cars', form);
    setModal(false); load();
  };

  const fields = [
    { label: "Name", field: "name", type: "text", required: true },
    {
      label: "Status",
      field: "status",
      type: "select",
      required: true,
      options: [
        { value: "Active", label: "Active" },
        { value: "InActive", label: "In Active" },
      ],
    }
  ];

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}> 🚕 Cars</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{total} Cars</p></div>
          <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={openNew}>+ New Car</button>
        </div>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          <div className="header-search" style={{ flex: 1 }}>
            <span>🔍</span>
            <input placeholder="Search name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} autoFocus />
          </div>
          <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading && page === 1 ? (
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <tr key={i}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div className="skeleton" style={{ height: '52px', margin: '4px 12px', borderRadius: '4px' }} />
                      </td>
                    </tr>
                  ))
                ) : cars.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">🚕 </div><h3>No cars found</h3></div></td></tr>
                ) : (
                  cars.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.id}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.name}</td>
                      <td><span className={`badge ${c.status === 'InActive' ? 'badge-danger' : 'badge-success'}`}>{c.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }} >Page {page}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={cars.length < 20}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editId ? 'Edit Car' : 'New Car'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid">
                {fields.map(({ label, field, type, required, options }) => (
                  <div key={field} className="form-group">
                    <label className={`form-label${required ? " required" : ""}`}>
                      {label}
                    </label>

                    {type === "select" ? (
                      <select
                        className="form-control"
                        value={form[field] || ""}
                        onChange={e =>
                          setForm(f => ({ ...f, [field]: e.target.value }))
                        }
                        required={required}
                      >
                        {options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        className="form-control"
                        value={form[field] || ""}
                        onChange={e =>
                          setForm(f => ({ ...f, [field]: e.target.value }))
                        }
                        required={required}
                      />
                    )}
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
