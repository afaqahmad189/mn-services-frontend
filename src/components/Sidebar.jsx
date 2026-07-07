import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    section: 'Main', items: [
      { path: '/', icon: '📊', label: 'Dashboard', section: 'dashboard' },
    ]
  },
  {
    section: 'Cases', items: [
      { path: '/quotations', icon: '📋', label: 'New Quotation', section: 'quotation' },
      { path: '/quotations/list', icon: '📄', label: 'Quotation List', section: 'quotation' },
      { path: '/invoices/new', icon: '➕', label: 'New Invoice', section: 'invoice' },
      { path: '/invoices', icon: '📑', label: 'Invoice List', section: 'invoice' },
      { path: '/cars', icon: '🚕', label: 'Cars', section: 'cars' },
      { path: '/websites', icon: '🌐', label: 'Websites', section: 'websites' },
      { path: '/customers', icon: '👥', label: 'Customers', section: 'customer' },
      { path: '/ledger', icon: '📒', label: 'Customer Ledger', section: 'ledger' },
      { path: '/vendor-ledger', icon: '📔', label: 'Vendor Ledger', section: 'ledger' },
    ]
  },
  {
    section: 'Tracking', items: [
      { path: '/vendors', icon: '🏢', label: 'Vendors / Offices', section: 'vendor' },
    ]
  },
  {
    section: 'Finance', items: [
      { path: '/expenses', icon: '💸', label: 'Daily Expenses', section: 'expense' },
      { path: '/reports?tab=cashbook', icon: '📒', label: 'Daily Cash Book', section: 'report' },
      { path: '/reports', icon: '📈', label: 'Reports', section: 'report' },
    ]
  },
  {
    section: 'Communication', items: [
      { path: '/whatsapp', icon: '💬', label: 'WhatsApp Templates', section: 'whatsapp' },
    ]
  },
  {
    section: 'Admin', items: [
      { path: '/users', icon: '👤', label: 'User Management', section: 'user' },
      { path: '/forms', icon: '📝', label: 'Forms', section: 'forms' },
      { path: '/settings', icon: '⚙️', label: 'Settings', section: 'settings' },
    ]
  },
];

export default function Sidebar({ stats, mobileOpen, onClose }) {
  const { user, logout, userRole, canAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    
    const [pathname, search] = path.split('?');
    if (search) {
      return location.pathname === pathname && location.search.includes(search);
    }
    
    if (path === '/reports') return location.pathname === '/reports' && (!location.search || !location.search.includes('tab=cashbook'));
    
    return location.pathname.startsWith(pathname);
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const isAdminRole = userRole === 'SUPER_ADMIN';
  const isOperator = userRole === 'OPERATOR';

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose(); // close mobile sidebar on nav
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar${mobileOpen ? ' sidebar-mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">MN</div>
          <div className="sidebar-logo-text">
            <div className="brand">MN Services</div>
            <div className="tagline">Excise Management</div>
          </div>
          {/* Mobile close button */}
          <button className="sidebar-mobile-close" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => {
            // Filter items by role
            const visibleItems = section.items.filter(item => {
              if (isAdminRole) return true;
              return canAccess(item.section);
            });

            // Hide Admin section for non-admins
            if (section.section === 'Admin' && !isAdminRole) return null;
            // Skip empty sections
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.section}>
                <div className="nav-section-label">{section.section}</div>
                {visibleItems.map(item => (
                  <div
                    key={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNav(item.path)}
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
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{userRole}</div>
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
    </>
  );
}
