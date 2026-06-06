import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    section: 'Main', items: [
      { path: '/', icon: '📊', label: 'Dashboard' },
    ]
  },
  {
    section: 'Cases', items: [
      { path: '/invoices', icon: '📄', label: 'Invoice / Cases' },
      { path: '/customers', icon: '👥', label: 'Customers' },
      { path: '/ledger', icon: '📒', label: 'Customer Ledger' },
      { path: '/vendor-ledger', icon: '📔', label: 'Vendor Ledger' },
    ]
  },
  {
    section: 'Tracking', items: [
      { path: '/vendors', icon: '🏢', label: 'Vendors / Offices' },
    ]
  },
  {
    section: 'Finance', items: [
      { path: '/expenses', icon: '💸', label: 'Daily Expenses' },
      { path: '/reports', icon: '📈', label: 'Reports' },
    ]
  },
  {
    section: 'Communication', items: [
      { path: '/whatsapp', icon: '💬', label: 'WhatsApp Templates' },
    ]
  },
  {
    section: 'Admin', items: [
      { path: '/users', icon: '👤', label: 'User Management' },
      { path: '/forms', icon: '📝', label: 'Forms' },
      { path: '/cars', icon: '🚗', label: 'Cars' },
      { path: '/audit-logs', icon: '🔍', label: 'Audit Logs' },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]
  },
];

export default function Sidebar({ stats }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">MN</div>
        <div className="sidebar-logo-text">
          <div className="brand">MN Services</div>
          <div className="tagline">Excise Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => {
          // Hide Admin section for non-admins
          const userRoles = user.roles?.map(r => r.toUpperCase()) || [];
          const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
          if (section.section === 'Admin' && !isAdmin) return null;

          return (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <div
                  key={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.path === '/invoices' && stats?.pendingChallan > 0 && (
                    <span className="nav-badge">{stats.pendingChallan}</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div className="header-avatar">{initials}</div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{user?.roles?.[0]}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
