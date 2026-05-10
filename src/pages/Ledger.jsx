import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LedgerPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/customers', { params: { limit: 1000 } }).then(r => setCustomers(r.data.data));
  }, []);

  const loadLedger = (customerId) => {
    if (!customerId) return;
    setLoading(true);
    api.get(`/customers/${customerId}/ledger`).then(r => {
      setLedger(r.data);
    }).finally(() => setLoading(false));
  };

  const handleCustomerChange = (e) => {
    const cid = e.target.value;
    setSelectedCustomer(cid);
    loadLedger(cid);
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📒 Customer Ledger</h1>
        <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Financial transaction history per customer</p>
      </div>

      <div className="page-content">
        <div className="card mb-6">
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label className="form-label">Select Customer</label>
            <select className="form-control" value={selectedCustomer} onChange={handleCustomerChange}>
              <option value="">Choose a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>
        </div>

        {selectedCustomer && (
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading ledger...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Invoice</th>
                      <th>Debit (Rs.)</th>
                      <th>Credit (Rs.)</th>
                      <th>Balance (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No transactions found</td></tr>
                    ) : (
                      ledger.map((entry, idx) => {
                        return (
                          <tr key={entry.id}>
                            <td>{new Date(entry.transactionDate || entry.createdAt).toLocaleDateString()}</td>
                            <td>{entry.description}</td>
                            <td>
                              {entry.invoiceId ? (
                                <button className="btn-link" onClick={() => navigate(`/invoices/${entry.invoiceId}`)}>
                                  {entry.invoice?.invoiceNumber || `#${entry.invoiceId}`}
                                </button>
                              ) : '—'}
                            </td>
                            <td style={{ color: 'var(--danger)', fontWeight: entry.type === 'DEBIT' ? 600 : 400 }}>
                              {entry.type === 'DEBIT' ? entry.amount.toLocaleString() : '—'}
                            </td>
                            <td style={{ color: 'var(--success)', fontWeight: entry.type === 'CREDIT' ? 600 : 400 }}>
                              {entry.type === 'CREDIT' ? entry.amount.toLocaleString() : '—'}
                            </td>
                            <td style={{ fontWeight: 700 }}>
                              Rs. {entry.runningBalance?.toLocaleString() || '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!selectedCustomer && (
          <div className="empty-state" style={{ marginTop: '40px' }}>
            <div className="empty-state-icon">📒</div>
            <h3>Select a customer to view ledger</h3>
            <p>You can search by name or phone number above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
