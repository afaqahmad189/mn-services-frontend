import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', body: '', description: '' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/whatsapp/templates');
      setTemplates(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openEdit = (t) => { setForm(t); setEditId(t.id); setModal(true); };

  const save = async () => {
    if (editId) await api.put(`/whatsapp/templates/${editId}`, form);
    else await api.post('/whatsapp/templates', form);
    setModal(false); load();
  };

  const seedDefaults = async () => {
    await api.post('/whatsapp/seed-defaults');
    load();
    alert('✅ Default templates seeded!');
  };

  const VARS = ['{{customer_name}}', '{{reg_no}}', '{{balance}}', '{{days_ago}}', '{{office_phone}}'];

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>💬 WhatsApp Templates</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{templates.length} templates configured</p></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={seedDefaults}>⚡ Seed Defaults</button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="alert-banner info mb-6">
          ℹ️ Available variables: {VARS.map(v => <code key={v} style={{ background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px', margin: '0 4px', fontSize: '0.8rem' }}>{v}</code>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '120px', height: '20px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ width: '200px', height: '14px' }} />
                  </div>
                  <div className="skeleton" style={{ width: '60px', height: '32px', borderRadius: '6px' }} />
                </div>
                <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
              </div>
            ))
          ) : (
            templates.map(t => (
              <div key={t.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.description}</div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)}>✏️ Edit</button>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {t.body}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span className={`badge ${t.isActive ? 'badge-success' : 'badge-gray'}`}>{t.isActive ? '● Active' : '○ Inactive'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editId ? 'Edit Template' : 'New Template'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label required">Template Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label className="form-label required">Message Body</label><textarea className="form-control" rows="6" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}></textarea></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Changes</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
