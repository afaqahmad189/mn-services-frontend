import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ from: '', to: '', entityName: '' });
  const [page, setPage] = useState(1);

  const load = async () => {
    const { data } = await api.get('/audit-logs', { params: { ...filters, page, limit: 50 } });
    setLogs(data.data); setTotal(data.total);
  };
  useEffect(() => { load(); }, [page, filters]);

  const ACTION_COLOR = { CREATE: 'badge-success', UPDATE: 'badge-info', DELETE: 'badge-danger', LOGIN: 'badge-primary', LOGOUT: 'badge-gray' };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🔍 Audit Logs</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{total} activity records</p>
      </div>
      <div className="page-content">
        <div className="filter-bar mb-6">
          <input type="date" className="form-control" style={{ width: '160px' }} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
          <span>→</span>
          <input type="date" className="form-control" style={{ width: '160px' }} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
          <input className="form-control" style={{ width: '160px' }} placeholder="Entity (Invoice...)" value={filters.entityName} onChange={e => setFilters(f => ({ ...f, entityName: e.target.value }))} />
          <button className="btn btn-primary btn-sm" onClick={load}>Apply</button>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>IP</th></tr></thead>
              <tbody>
                {logs.length === 0 ? <tr><td colSpan={6}><div className="empty-state" style={{ padding: '30px' }}><div className="empty-state-icon">🔍</div><h3>No logs found</h3></div></td></tr>
                : logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(l.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 500 }}>{l.user?.fullName || 'System'}</td>
                    <td><span className={`badge ${ACTION_COLOR[l.action] || 'badge-gray'}`}>{l.action}</span></td>
                    <td>{l.entityName}</td>
                    <td style={{ fontSize: '0.8rem' }}>{l.entityId}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
