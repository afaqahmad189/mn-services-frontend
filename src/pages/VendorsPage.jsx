import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', phone: '', email: '', address: '' });
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/vendors').then(r => setVendors(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: '', city: '', phone: '', email: '', address: '' }); setEditId(null); setModal(true); };
  const openEdit = (v) => { setForm(v); setEditId(v.id); setModal(true); };
  const save = async () => {
    if (editId) await api.put(`/vendors/${editId}`, form);
    else await api.post('/vendors', form);
    setModal(false); load();
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🏢 Vendors / Excise Offices</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{vendors.length} offices configured</p></div>
          <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={openNew}>+ New Vendor</button>
        </div>
      </div>
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {vendors.map(v => (
            <div key={v.id} className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{v.name}</div>
                  <span className="badge badge-primary">{v.city}</span>
                </div>
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(v)}>✏️</button>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {v.phone && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>📞 {v.phone}</div>}
                {v.email && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>✉️ {v.email}</div>}
                {v.address && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>📍 {v.address}</div>}
              </div>
            </div>
          ))}
          {vendors.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state"><div className="empty-state-icon">🏢</div><h3>No vendors added yet</h3><button className="btn btn-primary mt-4" onClick={openNew}>+ Add First Vendor</button></div>
            </div>
          )}
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editId ? 'Edit Vendor' : 'New Vendor'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid">
                {[['Name', 'name', true], ['City', 'city', true], ['Phone', 'phone'], ['Email', 'email'], ['Address', 'address']].map(([label, field, req]) => (
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
