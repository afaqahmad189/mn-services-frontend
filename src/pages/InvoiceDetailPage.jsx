import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { PAYMENT_METHOD_OPTIONS } from '../utils/constants';
import Modal from '../components/Modal';

const PHASE_STEPS = [
  { key: 'challan', label: 'Challan', icon: '📋', statusField: 'challanStatus' },
  { key: 'biometric', label: 'Biometric', icon: '🤚', statusField: 'biometricStatus' },
  { key: 'number-plate', label: 'Number Plate', icon: '🪪', statusField: 'numberPlateStatus' },
  { key: 'inspection', label: 'Inspection', icon: '🔍', statusField: 'inspectionStatus' },
  { key: 'file', label: 'File', icon: '📁', statusField: 'fileStatus' },
  { key: 'smart-card', label: 'Smart Card', icon: '💳', statusField: 'smartCardStatus' },
];

const DONE_VALUES = ['PAID', 'COMPLETED', 'DELIVERED', 'RECEIVED', 'RECEIVED_IN_OFFICE', 'ONLINE_COMPLETED', 'PHYSICAL_COMPLETED'];

function PhaseCard({ phase, invoice, onUpdate, onWhatsApp }) {
  const { can } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const statusVal = invoice[phase.statusField];
  const isDone = DONE_VALUES.includes(statusVal);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/invoices/${invoice.id}/${phase.key}`, form);
      onUpdate();
      setOpen(false);
    } finally { setSaving(false); }
  };

  const renderFields = () => {
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
    const chk = f => e => setForm(p => ({ ...p, [f]: e.target.checked }));
    if (phase.key === 'challan') return (
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" onChange={set('challanStatus')} defaultValue={invoice.challanStatus}>
            <option value="PENDING">Pending</option>
            <option value="RECEIVED">Received</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Received Date</label><input type="date" className="form-control" defaultValue={invoice.challanReceivedDate} onChange={set('challanReceivedDate')} /></div>
        <div className="form-group">
          <label className="form-label">Paid By</label>
          <select className="form-control" onChange={set('challanPaidBy')} defaultValue={invoice.challanPaidBy}>
            <option value="">Select...</option><option value="CUSTOMER">Customer</option><option value="SELF">Our Office</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Payment Date</label><input type="date" className="form-control" defaultValue={invoice.challanPaidDate} onChange={set('challanPaidDate')} /></div>
        <div className="form-group"><label className="form-label">Reference No.</label><input className="form-control" defaultValue={invoice.challanReference} onChange={set('challanReference')} /></div>
      </div>
    );
    if (phase.key === 'biometric') return (
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" onChange={set('biometricStatus')} defaultValue={invoice.biometricStatus}>
            <option value="PENDING">Pending</option><option value="SCHEDULED">Scheduled</option><option value="COMPLETED">Completed</option><option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Biometric Date</label><input type="date" className="form-control" defaultValue={invoice.biometricDate} onChange={set('biometricDate')} /></div>
        <div className="form-group"><label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><input type="checkbox" defaultChecked={invoice.biometricOnline} onChange={chk('biometricOnline')} /> Online Biometric</label></div>
        <div className="form-group"><label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><input type="checkbox" defaultChecked={invoice.biometricPhysical} onChange={chk('biometricPhysical')} /> Physical Biometric</label></div>
        <div className="form-group"><label className="form-label">Remarks</label><textarea className="form-control" rows={2} defaultValue={invoice.biometricRemarks} onChange={set('biometricRemarks')} /></div>
      </div>
    );
    if (phase.key === 'number-plate') return (
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" onChange={set('numberPlateStatus')} defaultValue={invoice.numberPlateStatus}>
            <option value="PENDING">Pending</option><option value="RECEIVED_IN_OFFICE">Received in Office</option><option value="CUSTOMER_INFORMED">Customer Informed</option><option value="DELIVERED">Delivered</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Received Date</label><input type="date" className="form-control" defaultValue={invoice.numberPlateReceivedDate} onChange={set('numberPlateReceivedDate')} /></div>
        <div className="form-group"><label className="form-label">Handover Date</label><input type="date" className="form-control" defaultValue={invoice.numberPlateHandoverDate} onChange={set('numberPlateHandoverDate')} /></div>
        <div className="form-group"><label className="form-label">Receiver Name</label><input className="form-control" defaultValue={invoice.numberPlateReceiverName} onChange={set('numberPlateReceiverName')} /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue={invoice.numberPlateNotes} onChange={set('numberPlateNotes')} /></div>
      </div>
    );
    if (phase.key === 'inspection') return (
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" onChange={set('inspectionStatus')} defaultValue={invoice.inspectionStatus}>
            <option value="PENDING">Pending</option><option value="ONLINE_COMPLETED">Online Completed</option><option value="PHYSICAL_COMPLETED">Physical Completed</option><option value="COMPLETED">Fully Completed</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Online Inspection Date</label><input type="date" className="form-control" defaultValue={invoice.inspectionOnlineDate} onChange={set('inspectionOnlineDate')} /></div>
        <div className="form-group"><label className="form-label">Physical Inspection Date</label><input type="date" className="form-control" defaultValue={invoice.inspectionPhysicalDate} onChange={set('inspectionPhysicalDate')} /></div>
        <div className="form-group"><label className="form-label">Physical Charges (Rs.)</label><input type="number" className="form-control" defaultValue={invoice.inspectionPhysicalCharges} onChange={set('inspectionPhysicalCharges')} /></div>
        <div className="form-group"><label className="form-label">Assigned Staff</label><input className="form-control" defaultValue={invoice.inspectionAssignedStaff} onChange={set('inspectionAssignedStaff')} /></div>
        <div className="form-group"><label className="form-label">Remarks</label><textarea className="form-control" rows={2} defaultValue={invoice.inspectionRemarks} onChange={set('inspectionRemarks')} /></div>
      </div>
    );
    if (phase.key === 'file') return (
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" onChange={set('fileStatus')} defaultValue={invoice.fileStatus}>
            <option value="PENDING">Pending</option><option value="IN_PROCESS">In Process</option><option value="RECEIVED">Received</option><option value="DELIVERED">Delivered</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Received Date</label><input type="date" className="form-control" defaultValue={invoice.fileReceivedDate} onChange={set('fileReceivedDate')} /></div>
        <div className="form-group"><label className="form-label">Delivered Date</label><input type="date" className="form-control" defaultValue={invoice.fileDeliveredDate} onChange={set('fileDeliveredDate')} /></div>
        <div className="form-group"><label className="form-label">Receiver Name</label><input className="form-control" defaultValue={invoice.fileReceiverName} onChange={set('fileReceiverName')} /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue={invoice.fileNotes} onChange={set('fileNotes')} /></div>
      </div>
    );
    if (phase.key === 'smart-card') return (
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" onChange={set('smartCardStatus')} defaultValue={invoice.smartCardStatus}>
            <option value="PENDING">Pending</option><option value="PRINTED">Printed</option><option value="RECEIVED">Received</option><option value="DELIVERED">Delivered</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Received Date</label><input type="date" className="form-control" defaultValue={invoice.smartCardReceivedDate} onChange={set('smartCardReceivedDate')} /></div>
        <div className="form-group"><label className="form-label">Delivered Date</label><input type="date" className="form-control" defaultValue={invoice.smartCardDeliveredDate} onChange={set('smartCardDeliveredDate')} /></div>
        <div className="form-group"><label className="form-label">Receiver Name</label><input className="form-control" defaultValue={invoice.smartCardReceiverName} onChange={set('smartCardReceiverName')} /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue={invoice.smartCardNotes} onChange={set('smartCardNotes')} /></div>
      </div>
    );
  };

  return (
    <div className="phase-item">
      <div className={`phase-dot ${isDone ? 'done' : statusVal !== 'PENDING' ? 'active' : 'pending'}`}>
        {isDone ? '✓' : phase.icon}
      </div>
      <div className="phase-content">
        <div className="phase-header">
          <span className="phase-title">{phase.label}</span>
          <span className={`badge ${isDone ? 'badge-success' : statusVal !== 'PENDING' ? 'badge-info' : 'badge-warning'}`}>
            {statusVal?.replace(/_/g, ' ')}
          </span>
          {can('edit') && (
            <button className="btn btn-sm btn-outline" onClick={() => setOpen(o => !o)} style={{ marginLeft: 'auto' }}>
              {open ? 'Close' : '✏️ Update'}
            </button>
          )}
          {['file', 'smart-card', 'number-plate', 'challan', 'biometric'].includes(phase.key) && (
            <button className="btn btn-sm" style={{ background: '#25D366', color: '#fff' }} onClick={() => onWhatsApp(phase.key)}>
              💬 WhatsApp
            </button>
          )}
        </div>
        {open && (
          <div className="phase-body">
            {renderFields()}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { can } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [payment, setPayment] = useState({ amount: '', description: '', paymentMethod: 'CASH' });
  const [waModal, setWaModal] = useState({ open: false, phase: '' });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [finOpen, setFinOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/invoices/${id}`).then(({ data }) => setInvoice(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); api.get('/whatsapp/templates').then(r => setTemplates(r.data)); }, [id]);

  const handlePayment = async () => {
    if (!payment.amount) return alert('Enter amount');
    await api.post(`/invoices/${id}/payment`, payment);
    setPayModal(false); setPayment({ amount: '', description: '', paymentMethod: 'CASH' }); load();
  };

  const handleWhatsApp = async (phase) => {
    const map = { file: 'FILE_RECEIVED', 'number-plate': 'NUMBER_PLATE_RECEIVED', challan: 'CHALLAN_REMINDER', 'smart-card': 'SMART_CARD_RECEIVED', biometric: 'BIOMETRIC_REMINDER' };
    setSelectedTemplate(map[phase] || '');
    setWaModal({ open: true, phase });
  };

  const sendWhatsApp = async () => {
    try {
      const res = await api.post('/whatsapp/send', { invoiceId: +id, templateName: selectedTemplate });
      if (res.data.method === 'OFFICIAL_API') {
        alert('✅ Message sent automatically via Official WhatsApp API!');
      } else if (res.data.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank');
      }
      setWaModal({ open: false, phase: '' });
    } catch (err) {
      alert('Error sending WhatsApp message');
    }
  };

  if (loading || !invoice) return (
    <div className="page-content">
      <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius)', marginBottom: '24px' }} />
      <div className="grid-2 gap-6">
        <div>
          <div className="card mb-6">
            <div className="skeleton skeleton-title" />
            <div className="grid-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
            </div>
          </div>
          <div className="card">
            <div className="skeleton skeleton-title" />
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-row skeleton" style={{ height: '40px' }} />)}
          </div>
        </div>
        <div className="card">
          <div className="skeleton skeleton-title" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4 mb-6">
              <div className="skeleton skeleton-avatar" />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '30%' }} />
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '60px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <button onClick={() => navigate('/invoices')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', marginBottom: '8px', fontSize: '0.8rem' }}>← Back to Invoices</button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{invoice.invoiceNumber}</h1>
            <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '4px' }}>{invoice.customer?.name}{invoice.customerName ? ` • ${invoice.customerName}` : ''} • {invoice.registrationNo}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {can('edit') && (
              <button className="btn btn-sm" style={{ background: '#fff', color: 'var(--primary)' }} onClick={() => navigate(`/invoices/${id}/edit`)}>✏️ Edit</button>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="grid-2 gap-6">
          {/* LEFT: Details */}
          <div>
            <div className="card mb-6">
              <div className="card-header">
                <div className="card-title">📋 Primary Details</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Organization', invoice.customer?.name],
                  ['Customer Name', invoice.customerName],
                  ['Created At', invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : ''],
                  ['Status Changed At', invoice.statusChangeDate ? new Date(invoice.statusChangeDate).toLocaleDateString() : '—'],
                  ['Excise Office', invoice.exciseOffice],
                  ['Reg. No.', invoice.registrationNo],
                  ['New Reg. No.', invoice.newRegistrationNo],
                  ['Vehicle', invoice.vehicle],
                  ['Application ID', invoice.applicationId],
                  ['Chassis No.', invoice.chassisNo],
                  ['Contact', invoice.contactDetails],
                  ['Purpose', invoice.purpose],
                  ['Reg. Date', invoice.registrationDate],
                  ['CNIC', invoice.cnic],
                ].map(([label, val]) => (
                  <div key={label} style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontWeight: 500, marginTop: '2px' }}>{val || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FINANCIAL */}
            <div className="card">
              <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setFinOpen(!finOpen)}>
                <div className="card-title">💰 Financial Summary {finOpen ? '▲' : '▼'}</div>
                <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); setPayModal(true); }}>+ Record Payment</button>
              </div>
              {finOpen && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', marginTop: '16px' }}>
                {[
                  ['Challan Amount', invoice.challanAmount],
                  ['Service Charges', invoice.serviceCharges],
                  ['Inspection Charges', invoice.inspectionCharges],
                  ['Vendor Charges', invoice.additionalCharges],
                  ['Discount', invoice.discount],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontWeight: 600 }}>Rs. {(+v || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px', background: 'var(--primary-50)', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL BILL</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Rs. {(+invoice.totalAmount || 0).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECEIVED</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>Rs. {(+invoice.amountReceived || 0).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BALANCE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: +invoice.remainingBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>Rs. {(+invoice.remainingBalance || 0).toLocaleString()}</div>
                </div>
              </div>
              </>
              )}
            </div>
          </div>

          {/* RIGHT: Phase Timeline */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔄 Case Progress Timeline</div>
              <span className={`badge ${invoice.status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>{invoice.status}</span>
            </div>
            <div className="phases-timeline">
              {PHASE_STEPS.map(phase => {
                if (phase.key === 'smart-card' && invoice.hasSmartCard === false) return null;
                if (phase.key === 'number-plate' && invoice.hasNumberPlate === false) return null;
                if (phase.key === 'file' && invoice.hasFile === false) return null;
                return <PhaseCard key={phase.key} phase={phase} invoice={invoice} onUpdate={load} onWhatsApp={handleWhatsApp} />;
              })}
            </div>
            {invoice.status !== 'COMPLETED' && +invoice.remainingBalance === 0 && (
              <div style={{ marginTop: '16px' }}>
                <button className="btn btn-success w-full" onClick={async () => { await api.patch(`/invoices/${id}/close`); load(); }}>
                  ✅ Close Case
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={payModal}
        onClose={() => setPayModal(false)}
        title="💰 Record Payment"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setPayModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePayment}>Save Payment</button>
          </>
        }
      >
        <div className="form-group mb-4"><label className="form-label required">Amount (Rs.)</label><input type="number" className="form-control" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))} /></div>
        <div className="form-group mb-4">
          <label className="form-label required">Payment Method</label>
          <select className="form-control" value={payment.paymentMethod} onChange={e => setPayment(p => ({ ...p, paymentMethod: e.target.value }))}>
            {PAYMENT_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={payment.description} onChange={e => setPayment(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Cash payment" /></div>
      </Modal>

      <Modal
        open={waModal.open}
        onClose={() => setWaModal({ open: false, phase: '' })}
        title="💬 Send WhatsApp"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setWaModal({ open: false })}>Cancel</button>
            <button className="btn btn-success" onClick={sendWhatsApp} disabled={!selectedTemplate}>Send Message 💬</button>
          </>
        }
      >
        <div className="form-group mb-4">
          <label className="form-label">Select Template</label>
          <select className="form-control" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
            <option value="">Select template...</option>
            {templates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        {selectedTemplate && templates.find(t => t.name === selectedTemplate) && (
          <div className="alert-banner info" style={{ whiteSpace: 'pre-wrap' }}>
            {templates.find(t => t.name === selectedTemplate)?.body}
          </div>
        )}
      </Modal>
    </div>
  );
}
