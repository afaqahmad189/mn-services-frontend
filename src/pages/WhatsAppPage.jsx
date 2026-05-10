import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', body: '', description: '' });
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/whatsapp/templates').then(r => setTemplates(r.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: '', body: '', description: '' }); setEditId(null); setModal(true); };
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
            <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={openNew}>+ New Template</button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="alert-banner info mb-6">
          ℹ️ Available variables: {VARS.map(v => <code key={v} style={{ background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px', margin: '0 4px', fontSize: '0.8rem' }}>{v}</code>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {templates.map(t => (
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
          ))}

          {templates.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>No templates yet</h3>
                <p>Click "Seed Defaults" to load 6 pre-built templates</p>
                <button className="btn btn-primary mt-4" onClick={seedDefaults}>⚡ Seed Default Templates</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editId ? '✏️ Edit Template' : '➕ New Template'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group mb-4"><label className="form-label required">Template Name (KEY)</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. FILE_RECEIVED" /></div>
              <div className="form-group mb-4"><label className="form-label">Description</label><input className="form-control" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="form-group mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label required">Message Body</label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {VARS.map(v => <button key={v} type="button" className="btn btn-sm btn-secondary" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => setForm(f => ({ ...f, body: (f.body || '') + v }))}>{v}</button>)}
                  </div>
                </div>
                <textarea className="form-control" rows={5} value={form.body || ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Dear {{customer_name}}, ..." />
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Template</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
