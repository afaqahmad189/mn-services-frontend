import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import toast from "react-hot-toast";

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', url: '' });
  const [editId, setEditId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/websites', { params: { page, limit: 20, search } });
    setWebsites(data.data); setTotal(data.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (c) => { setForm(c); setEditId(c.id); setModal(true); };
  const openNew = () => { setForm({ name: '', phone: '', cnic: '', email: '', address: '' }); setEditId(null); setModal(true); };

  const save = async () => {
    if (editId) await api.put(`/websites/${editId}`, form);
    else await api.post('/websites', form);
    setModal(false); load();
  };

  const fields = [
    { label: "Name", field: "name", type: "text", required: true },
    { label: "Url", field: "url", type: "text", required: true },
  ]

  const deleteWebsite = async (id) => {
    if (!window.confirm("Delete this website?")) return;
    try {
      await api.delete(`/websites/${id}`);
      toast.success("Website deleted");
      load();
    } catch {
      toast.error("Failed to delete website");
    }
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🌐 Websites</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{total} Websites</p></div>
          <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={openNew}>+ New Website</button>
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
              <thead><tr><th>#</th><th>Name</th><th>Url</th><th>Actions</th></tr></thead>
              <tbody>
                {loading && page === 1 ? (
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <tr key={i}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div className="skeleton" style={{ height: '52px', margin: '4px 12px', borderRadius: '4px' }} />
                      </td>
                    </tr>
                  ))
                ) : websites.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">🌐 </div><h3>No Websites found</h3></div></td></tr>
                ) : (
                  websites.map(w => (
                    <tr key={w.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{w.id}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{w.name}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}><a href={w.url} target="_blank" rel="noopener noreferrer">{w.url}</a></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(w)}>Edit</button>
                          <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteWebsite(w.id)}>Delete</button>

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
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={websites.length < 20}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editId ? 'Edit Website' : 'New Website'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
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
                        <option value="">Select {label}</option>

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
