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
      setPendingCustomers(c.data.slice(0, 50));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-content">
      {/* Skeleton Stat Grid */}
      <div className="stat-grid mb-6">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '40%', height: '24px' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 gap-6">
        <div className="card">
          <div className="skeleton skeleton-title" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px', borderRadius: '8px' }} />
          ))}
        </div>
        <div className="card">
          <div className="skeleton skeleton-title" />
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="skeleton-row skeleton" style={{ height: '45px' }} />
          ))}
        </div>
      </div>
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

              <div style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
                {/* DELAYED BY CUSTOMER */}
                {delayed?.delayedByCustomer?.length > 0 && (
                  <>
                    <div className="section-divider">👤 Action Required by Customer</div>
                    {delayed.delayedByCustomer.map(inv => (
                      <div key={inv.id} className="alert-banner info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>ℹ️</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Challan received but payment pending for {Math.floor((Date.now() - new Date(inv.challanReceivedDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {delayed?.challanPaidPendingBiometric?.length > 0 && (
                  <>
                    <div className="section-divider">🤚 Biometric Pending</div>
                    {delayed.challanPaidPendingBiometric.map(inv => (
                      <div key={inv.id} className="alert-banner warning" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>⚠️</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Challan paid but biometric pending for {Math.floor((Date.now() - new Date(inv.challanPaidDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* NUMBER PLATE ALERTS */}
                {delayed?.plateDelayedByOffice?.length > 0 && (
                  <>
                    <div className="section-divider">🏢 Plate Pending at Office</div>
                    {delayed.plateDelayedByOffice.map(inv => (
                      <div key={inv.id} className="alert-banner warning" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>⚠️</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Biometric done but plate pending for {Math.floor((Date.now() - new Date(inv.biometricDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {delayed?.plateReceivedNotInformed?.length > 0 && (
                  <>
                    <div className="section-divider">📢 Inform Customer (Plate)</div>
                    {delayed.plateReceivedNotInformed.map(inv => (
                      <div key={inv.id} className="alert-banner info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>🔔</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Plate received but customer not informed for {Math.floor((Date.now() - new Date(inv.numberPlateReceivedDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {delayed?.plateInformedNotCollected?.length > 0 && (
                  <>
                    <div className="section-divider">🚚 Plate Collection Pending</div>
                    {delayed.plateInformedNotCollected.map(inv => (
                      <div key={inv.id} className="alert-banner info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>⏳</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Customer informed but plate not collected for {Math.floor((Date.now() - new Date(inv.numberPlateReceivedDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* INSPECTION ALERTS */}
                {delayed?.plateReceivedPendingInspection?.length > 0 && (
                  <>
                    <div className="section-divider">🔍 Inspection Pending</div>
                    {delayed.plateReceivedPendingInspection.map(inv => (
                      <div key={inv.id} className="alert-banner warning" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>ℹ️</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Inspection pending for {Math.floor((Date.now() - new Date(inv.numberPlateReceivedDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* FILE ALERTS */}
                {delayed?.inspectionDoneFilePending?.length > 0 && (
                  <>
                    <div className="section-divider">📄 File Processing Pending</div>
                    {delayed.inspectionDoneFilePending.map(inv => (
                      <div key={inv.id} className="alert-banner warning" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>⚠️</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Inspection done but file pending for {Math.floor((Date.now() - new Date(inv.inspectionPhysicalDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {delayed?.fileReceivedNotDelivered?.length > 0 && (
                  <>
                    <div className="section-divider">📁 File Delivery Pending</div>
                    {delayed.fileReceivedNotDelivered.map(inv => (
                      <div key={inv.id} className="alert-banner info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>📦</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>File received in office but not delivered for {Math.floor((Date.now() - new Date(inv.fileReceivedDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {delayed?.smartCardPending?.length > 0 && (
                  <>
                    <div className="section-divider">💳 Smart Card Pending</div>
                    {delayed.smartCardPending.map(inv => (
                      <div key={inv.id} className="alert-banner danger" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>📁</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Smart card pending for {Math.floor((Date.now() - new Date(inv.createdAt))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {delayed?.smartCardReceivedNotDelivered?.length > 0 && (
                  <>
                    <div className="section-divider">💳 Smart Card Collection Pending</div>
                    {delayed.smartCardReceivedNotDelivered.map(inv => (
                      <div key={inv.id} className="alert-banner info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <span>📩</span>
                        <div>
                          <strong>{inv.customer?.name}</strong> — {inv.invoiceNumber}<br />
                          <small>Smart card received in office but not delivered for {Math.floor((Date.now() - new Date(inv.smartCardReceivedDate))/86400000)} days</small>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {(!delayed || Object.values(delayed).every(arr => arr.length === 0)) && (
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

              <div style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
                {pendingCustomers.length === 0 ? (
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <p>No pending balances</p>
                  </div>
                ) : pendingCustomers.map(c => (
                  <div key={c.id} className="alert-banner danger mb-2" style={{ cursor: 'pointer', background: 'var(--bg)', border: '1px solid var(--border)' }} onClick={() => navigate(`/customers/${c.id}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: 'var(--text)' }}>{c.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--danger)', fontWeight: 700 }}>Rs. {(+c.balance || 0).toLocaleString()}</div>
                        <small style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7 }}>Outstanding</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
