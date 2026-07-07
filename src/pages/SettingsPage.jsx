import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    alert_days_challan: 15,
    alert_days_biometric: 15,
    alert_days_plate: 15,
    alert_days_inspection: 15,
    alert_days_smart_card: 15,
    alert_days_file: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data && Object.keys(r.data).length > 0) {
        setSettings(prev => ({ ...prev, ...r.data }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', settings);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwdSaving(true);
    try {
      await api.post('/users/me/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwdSaving(false); }
  };

  const update = (key, val) => setSettings(s => ({ ...s, [key]: parseInt(val) || 0 }));

  if (loading) return <div className="page-content"><div className="empty-state"><h3>Loading...</h3></div></div>;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>⚙️ System Settings</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Configure dashboard alerts and account settings</p>
      </div>

      <div className="page-content" style={{ maxWidth: '800px' }}>
        {/* ALERT THRESHOLDS */}
        <div className="card mb-6">
          <div className="card-header">
            <div className="card-title">🚨 Dashboard Alert Thresholds</div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Set the number of days after which a pending task should show as an alert on the dashboard.
          </p>

          <div className="form-grid">
            {[
              { label: 'Challan Not Paid (Days)', key: 'alert_days_challan' },
              { label: 'Biometric Pending (Days)', key: 'alert_days_biometric' },
              { label: 'Number Plate Pending (Days)', key: 'alert_days_plate' },
              { label: 'Inspection Pending (Days)', key: 'alert_days_inspection' },
              { label: 'Smart Card Pending (Days)', key: 'alert_days_smart_card' },
              { label: 'File Collection Pending (Days)', key: 'alert_days_file' },
            ].map(item => (
              <div key={item.key} className="form-group">
                <label className="form-label">{item.label}</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings[item.key]}
                  onChange={e => update(item.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔐 Change Password</div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Update your account password. You'll need your current password to confirm.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={pwdForm.currentPassword}
                onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label required">New Password</label>
              <input
                type="password"
                className="form-control"
                value={pwdForm.newPassword}
                onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={pwdForm.confirmPassword}
                onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                <span className="form-error">Passwords do not match</span>
              )}
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword || pwdForm.newPassword !== pwdForm.confirmPassword}
            >
              {pwdSaving ? 'Changing...' : '🔐 Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
