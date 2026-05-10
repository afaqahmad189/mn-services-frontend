import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  ACTIVE: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  RECEIVED: 'badge-success',
  PAID: 'badge-success',
  DELIVERED: 'badge-success',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [delayed, setDelayed] = useState(null);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/invoices/dashboard/stats'),
      api.get('/invoices/dashboard/delayed'),
      api.get('/customers/pending-balance'),
    ]).then(([s, d, c]) => {
      setStats(s.data);
      setDelayed(d.data);
      setPendingCustomers(c.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--primary-100)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const statCards = [
    { icon: '📄', label: 'Total Cases', value: stats?.total || 0, cls: 'blue' },
    { icon: '🔄', label: 'Active Cases', value: stats?.active || 0, cls: 'blue' },
    { icon: '✅', label: 'Completed', value: stats?.completed || 0, cls: 'green' },
    { icon: '⚠️', label: 'Vendor Delays', value: stats?.delayedByVendor || 0, cls: 'orange' },
    { icon: '💰', label: 'Pending Payments', value: stats?.pendingBalances || 0, cls: 'red' },
    { icon: '📋', label: 'Challan Pending', value: stats?.pendingChallan || 0, cls: 'orange' },
    { icon: '🤚', label: 'Biometric Pending', value: stats?.pendingBiometric || 0, cls: 'orange' },
    { icon: '🪪', label: 'Plate Pending', value: stats?.pendingPlate || 0, cls: 'orange' },
  ];

  return (
    <div>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: '#fff', padding: '24px', marginBottom: '0' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Good day! 👋</h1>
        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Here's what's happening with MN Services today.</p>
      </div>

      <div className="page-content">
        {/* STAT CARDS */}
        <div className="stat-grid mb-6">
          {statCards.map(s => (
            <div key={s.label} className="stat-card" onClick={() => navigate('/invoices')} style={{ cursor: 'pointer' }}>
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ALERTS SECTION */}
        <div className="grid-2 gap-6">
          <div>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">🚨 Active Alerts</div>
                  <div className="card-subtitle">Cases requiring immediate attention</div>
                </div>
              </div>

              {delayed?.delayedByVendor?.length > 0 && (
                <>
                  <div className="section-divider">⏰ Delayed by Vendor</div>
                  {delayed.delayedByVendor.slice(0, 3).map(inv => (
                    <div key={inv.id} className="alert-banner warning" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                      <span>⚠️</span>
                      <div>
                        <strong>{inv.customer?.name || 'N/A'}</strong> — {inv.invoiceNumber}<br />
                        <small>Number plate pending 15+ days after biometric completion</small>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {delayed?.delayedByCustomer?.length > 0 && (
                <>
                  <div className="section-divider">👤 Waiting on Customer</div>
                  {delayed.delayedByCustomer.slice(0, 3).map(inv => (
                    <div key={inv.id} className="alert-banner info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                      <span>ℹ️</span>
                      <div>
                        <strong>{inv.customer?.name || 'N/A'}</strong> — {inv.invoiceNumber}<br />
                        <small>Challan received but payment pending 3+ days</small>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {delayed?.fileCollectionPending?.length > 0 && (
                <>
                  <div className="section-divider">📁 File Collection Pending</div>
                  {delayed.fileCollectionPending.slice(0, 3).map(inv => (
                    <div key={inv.id} className="alert-banner danger" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                      <span>📁</span>
                      <div>
                        <strong>{inv.customer?.name || 'N/A'}</strong> — {inv.invoiceNumber}<br />
                        <small>File received 5+ days ago, customer not collected</small>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!delayed?.delayedByVendor?.length && !delayed?.delayedByCustomer?.length && !delayed?.fileCollectionPending?.length && (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-state-icon">✅</div>
                  <h3>All Clear!</h3>
                  <p>No alerts at the moment</p>
                </div>
              )}
            </div>
          </div>

          <div>
            {/* PENDING BALANCES */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">💰 Pending Balances</div>
                  <div className="card-subtitle">Customers with outstanding dues</div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate('/customers')}>View All</button>
              </div>

              {pendingCustomers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingCustomers.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate(`/customers/${c.id}`)}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                      </div>
                      <span className="badge badge-danger">Rs. {(+c.balance).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-state-icon">💚</div>
                  <h3>No Pending Balances</h3>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="card mt-4">
              <div className="card-title mb-4">⚡ Quick Actions</div>
              <div className="grid-2 gap-2">
                <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>➕ New Invoice</button>
                <button className="btn btn-secondary" onClick={() => navigate('/customers/new')}>👤 New Customer</button>
                <button className="btn btn-outline" onClick={() => navigate('/reports')}>📊 Reports</button>
                <button className="btn btn-outline" onClick={() => navigate('/expenses')}>💸 Add Expense</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
