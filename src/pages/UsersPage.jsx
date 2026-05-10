import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', roleIds: [] });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const [u, r] = await Promise.all([api.get('/users'), api.get('/users/roles')]);
    setUsers(u.data); setRoles(r.data);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ fullName: '', email: '', password: '', phone: '', roleIds: [] }); setEditId(null); setModal(true); };
  const openEdit = (u) => { setForm({ ...u, password: '', roleIds: u.roles?.map(r => r.id) || [] }); setEditId(u.id); setModal(true); };
  const save = async () => {
    if (editId) await api.put(`/users/${editId}`, form);
    else await api.post('/users', form);
    setModal(false); load();
  };
  const toggleRole = (id) => setForm(f => ({ ...f, roleIds: f.roleIds.includes(id) ? f.roleIds.filter(r => r !== id) : [...f.roleIds, id] }));

  const ROLE_COLOR = { SUPER_ADMIN: 'badge-danger', ADMIN: 'badge-primary', OPERATOR: 'badge-info', ACCOUNTANT: 'badge-success', VIEWER: 'badge-gray' };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>👤 User Management</h1><p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{users.length} users registered</p></div>
          <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }} onClick={openNew}>+ New User</button>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Roles</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{u.roles?.map(r => <span key={r.id} className={`badge ${ROLE_COLOR[r.name] || 'badge-gray'}`}>{r.name}</span>)}</div></td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td><button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>✏️ Edit</button></td>
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
            <div className="modal-header"><div className="modal-title">{editId ? 'Edit User' : 'New User'}</div><button className="btn-icon" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label required">Full Name</label><input className="form-control" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label required">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">{editId ? 'New Password (leave blank)' : 'Password *'}</label><input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              </div>
              <div className="section-divider" style={{ marginTop: '16px' }}>Assign Roles</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {roles.map(r => (
                  <button key={r.id} type="button"
                    className={`btn btn-sm ${form.roleIds?.includes(r.id) ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => toggleRole(r.id)}>
                    {form.roleIds?.includes(r.id) ? '✓ ' : ''}{r.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save User</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
