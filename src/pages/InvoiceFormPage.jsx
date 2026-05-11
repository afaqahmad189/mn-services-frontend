import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';

const emptyForm = {
  customerId: '', vendorId: '', registrationNo: '', newRegistrationNo: '',
  exciseOffice: '', referenceNo: '', contactDetails: '', choiceSpecialNo: '',
  purpose: '', vehicle: '', applicationId: '', chassisNo: '', engineNo: '',
  registrationDate: new Date().toISOString().split('T')[0], cnic: '', address: '',
  challanAmount: 0, serviceCharges: 0, inspectionCharges: 0,
  additionalCharges: 0, discount: 0, amountReceived: 0, remarks: '',
};

const Field = ({ label, field, type = 'text', required, children, colSpan, form, onChange }) => (
  <div className="form-group" style={colSpan ? { gridColumn: `span ${colSpan}` } : {}}>
    <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
    {children || (
      <input type={type} className="form-control" value={form[field] || ''} onChange={onChange(field)} required={required} />
    )}
  </div>
);

export default function InvoiceFormPage({ editId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', cnic: '', email: '' });

  useEffect(() => {
    Promise.all([
      api.get('/customers', { params: { limit: 200 } }),
      api.get('/vendors'),
    ]).then(([c, v]) => {
      setCustomers(c.data.data || []);
      setVendors(v.data || []);
    });

    if (editId) {
      setLoading(true);
      api.get(`/invoices/${editId}`).then(({ data }) => {
        setForm({
          ...emptyForm, ...data,
          customerId: data.customerId || '',
          vendorId: data.vendorId || '',
        });
      }).finally(() => setLoading(false));
    }
  }, [editId]);

  const totalAmount = (+form.challanAmount || 0) + (+form.serviceCharges || 0) +
    (+form.inspectionCharges || 0) + (+form.additionalCharges || 0) - (+form.discount || 0);
  const remainingBalance = totalAmount - (+form.amountReceived || 0);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSaveCustomer = async () => {
    const { data } = await api.post('/customers', newCustomer);
    setCustomers(c => [...c, data]);
    setForm(f => ({ ...f, customerId: data.id }));
    setShowNewCustomer(false);
    setNewCustomer({ name: '', phone: '', cnic: '', email: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/invoices/${editId}`, { ...form, totalAmount, remainingBalance });
      } else {
        const { data } = await api.post('/invoices', { ...form, totalAmount, remainingBalance });
        navigate(`/invoices/${data.id}`);
        return;
      }
      navigate(`/invoices/${editId}`);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="page-content">
      <div className="card">
        <div className="skeleton skeleton-title" style={{ width: '200px', height: '32px', marginBottom: '24px' }} />
        <div className="form-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <div key={i} className="form-group">
              <div className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', marginBottom: '8px', fontSize: '0.8rem' }}>
              ← Back
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editId ? '✏️ Edit Invoice' : '➕ New Invoice'}</h1>
          </div>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          {/* PRIMARY DETAILS */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="card-title">📋 Primary Details</div>
            </div>
            <div className="form-grid">
              <Field label="Customer" field="customerId" required form={form} onChange={set}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="form-control" value={form.customerId} onChange={set('customerId')} required>
                    <option value="">Select Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                  </select>
                  <button type="button" className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowNewCustomer(true)}>+ New</button>
                </div>
              </Field>
              <Field label="Excise Office / Vendor" field="vendorId" form={form} onChange={set}>
                <select className="form-control" value={form.vendorId} onChange={set('vendorId')}>
                  <option value="">Select Office...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
                </select>
              </Field>
              <Field label="Registration No." field="registrationNo" form={form} onChange={set} />
              <Field label="New Registration No." field="newRegistrationNo" form={form} onChange={set} />
              <Field label="Excise Office (Text)" field="exciseOffice" form={form} onChange={set} />
              <Field label="Reference No." field="referenceNo" form={form} onChange={set} />
              <Field label="Contact Details" field="contactDetails" form={form} onChange={set} />
              <Field label="Choice / Special No." field="choiceSpecialNo" form={form} onChange={set} />
              <Field label="Purpose" field="purpose" form={form} onChange={set} />
              <Field label="Vehicle" field="vehicle" form={form} onChange={set} />
              <Field label="Application ID" field="applicationId" form={form} onChange={set} />
              <Field label="Chassis No." field="chassisNo" form={form} onChange={set} />
              <Field label="Engine No." field="engineNo" form={form} onChange={set} />
              <Field label="CNIC" field="cnic" form={form} onChange={set} />
              <Field label="Registration Date" field="registrationDate" type="date" form={form} onChange={set} />
              <Field label="Address" field="address" form={form} onChange={set} />
            </div>
          </div>

          {/* FINANCIAL */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="card-title">💰 Financial Summary</div>
            </div>
            <div className="form-grid-3">
              <Field label="Challan Amount (Rs.)" field="challanAmount" type="number" form={form} onChange={set} />
              <Field label="Service Charges (Rs.)" field="serviceCharges" type="number" form={form} onChange={set} />
              <Field label="Inspection Charges (Rs.)" field="inspectionCharges" type="number" form={form} onChange={set} />
              <Field label="Additional Charges (Rs.)" field="additionalCharges" type="number" form={form} onChange={set} />
              <Field label="Discount (Rs.)" field="discount" type="number" form={form} onChange={set} />
              <Field label="Amount Received (Rs.)" field="amountReceived" type="number" form={form} onChange={set} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px', padding: '20px', background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL BILL</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Rs. {totalAmount.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECEIVED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>Rs. {(+form.amountReceived || 0).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BALANCE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: remainingBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>Rs. {remainingBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <div className="form-group">
              <label className="form-label">Remarks / Status</label>
              <textarea className="form-control" rows={3} value={form.remarks || ''} onChange={set('remarks')} placeholder="Any additional notes..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? '💾 Saving...' : editId ? '💾 Update Invoice' : '✅ Create Invoice'}
            </button>
          </div>
        </form>
      </div>

      {/* NEW CUSTOMER MODAL */}
      {showNewCustomer && (
        <div className="modal-overlay" onClick={() => setShowNewCustomer(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">👤 Add New Customer</div>
              <button className="btn-icon" onClick={() => setShowNewCustomer(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {[['Name', 'name', true], ['Phone', 'phone', true], ['CNIC', 'cnic'], ['Email', 'email']].map(([label, field, req]) => (
                  <div key={field} className="form-group">
                    <label className={`form-label${req ? ' required' : ''}`}>{label}</label>
                    <input className="form-control" value={newCustomer[field]} onChange={e => setNewCustomer(p => ({ ...p, [field]: e.target.value }))} required={req} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowNewCustomer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCustomer}>Save Customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
