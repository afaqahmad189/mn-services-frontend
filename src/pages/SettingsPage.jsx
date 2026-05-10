import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

export default function SettingsPage() {
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
      alert('✅ Settings saved successfully!');
    } finally { setSaving(false); }
  };

  const update = (key, val) => setSettings(s => ({ ...s, [key]: parseInt(val) || 0 }));

  if (loading) return <div className="page-content"><div className="empty-state"><h3>Loading...</h3></div></div>;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>⚙️ System Settings</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Configure dashboard alerts and system behavior</p>
      </div>

      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div className="card">
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
      </div>
    </div>
  );
}
