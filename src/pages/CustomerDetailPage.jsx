import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/customers/${id}`).then(r => setCustomer(r.data));
    api.get(`/customers/${id}/ledger`).then(r => setLedger(r.data));
  }, [id]);

  if (!customer) return <div className="page-content"><div className="empty-state"><div className="empty-state-icon">⏳</div><h3>Loading...</h3></div></div>;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <button onClick={() => navigate('/customers')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', marginBottom: '8px', fontSize: '0.8rem' }}>← Back</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{customer.name}</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{customer.phone} • {customer.cnic}</p>
      </div>

      <div className="page-content">
        {/* BALANCE SUMMARY */}
        <div className="stat-grid mb-6">
          {[
            { label: 'Total Invoiced', value: `Rs. ${(+customer.totalDebit || 0).toLocaleString()}`, icon: '📄', cls: 'blue' },
            { label: 'Total Paid', value: `Rs. ${(+customer.totalCredit || 0).toLocaleString()}`, icon: '✅', cls: 'green' },
            { label: 'Pending Balance', value: `Rs. ${(+customer.balance || 0).toLocaleString()}`, icon: '💰', cls: +customer.balance > 0 ? 'red' : 'green' },
            { label: 'Total Cases', value: customer.invoices?.length || 0, icon: '📋', cls: 'blue' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {+customer.balance > 0 && (
          <div className="alert-banner danger mb-6">⚠️ This customer has a pending balance of <strong>Rs. {(+customer.balance).toLocaleString()}</strong>. Please remind them to clear dues.</div>
        )}

        <div className="tabs">
          {['overview', 'invoices', 'ledger'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? '📋 Overview' : t === 'invoices' ? '📄 Cases' : '📒 Ledger'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="card">
            <div className="form-grid">
              {[['Name', customer.name], ['Phone', customer.phone], ['CNIC', customer.cnic], ['Email', customer.email], ['Address', customer.address]].map(([l, v]) => (
                <div key={l} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'invoices' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead><tr><th>Invoice No.</th><th>Reg. No.</th><th>Status</th><th>Total</th><th>Balance</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {(customer.invoices || []).map(inv => (
                    <tr key={inv.id}>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{inv.registrationNo}</td>
                      <td><span className={`badge ${inv.status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>{inv.status}</span></td>
                      <td>Rs. {(+inv.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ color: +inv.remainingBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>Rs. {(+inv.remainingBalance || 0).toLocaleString()}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td><button className="btn btn-sm btn-primary" onClick={() => navigate(`/invoices/${inv.id}`)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'ledger' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Payment Method</th><th>Description</th><th>Invoice</th></tr></thead>
                <tbody>
                  {ledger.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontSize: '0.8rem' }}>{e.transactionDate}</td>
                      <td><span className={`badge ${e.type === 'DEBIT' ? 'badge-danger' : 'badge-success'}`}>{e.type}</span></td>
                      <td style={{ fontWeight: 600, color: e.type === 'DEBIT' ? 'var(--danger)' : 'var(--success)' }}>Rs. {(+e.amount).toLocaleString()}</td>
                      <td style={{ fontSize: '0.875rem' }}>{e.paymentMethod}</td>
                      <td style={{ fontSize: '0.875rem' }}>{e.description}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{e.invoice?.invoiceNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
