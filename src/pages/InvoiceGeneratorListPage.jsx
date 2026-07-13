import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, useAuth } from "../context/AuthContext";

export default function InvoiceGeneratorListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/invoice-generators", { params: { page, limit: 20, search } });
      setInvoices(data.data);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toFormState = (inv) => ({
    dated: inv.dated,
    customerName: inv.customerName,
    contractNo: inv.contractNo,
    registrationNo: inv.registrationNo,
    vehicleType: inv.vehicleType,
    maker: inv.maker,
    cc: String(inv.cc),
    invoicePrice: inv.invoicePrice ?? inv.carPrice,
    withholdingTax: inv.withholdingTax ?? 0,
    carPrice: inv.carPrice,
    customerType: inv.customerType,
    state: inv.state,
    specialNo: inv.specialNo,
    type: inv.type,
    challanAmount: inv.challanAmount,
    serviceCharges: inv.serviceCharges,
  });

  const openInvoice = (inv) => {
    navigate("/invoice-generator/preview", {
      state: {
        form: toFormState(inv),
        editId: inv.id,
        invoiceNumber: inv.invoiceNumber,
      },
    });
  };

  const editInvoice = (inv) => {
    navigate("/invoice-generator", {
      state: {
        form: toFormState(inv),
        editId: inv.id,
        invoiceNumber: inv.invoiceNumber,
      },
    });
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await api.delete(`/invoice-generators/${id}`);
      toast.success("Invoice deleted");
      load();
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--primary))", color: "#fff", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🧾 Generated Invoices</h1>
            <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>{total} saved invoices</p>
          </div>
          {can('create') && (
            <button
              className="btn"
              style={{ background: "#fff", color: "var(--primary)", fontWeight: 600 }}
              onClick={() => navigate("/invoice-generator")}
            >
              + New Invoice
            </button>
          )}
        </div>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          <div className="header-search" style={{ flex: 1 }}>
            <span>🔍</span>
            <input
              placeholder="Search invoice no, customer, registration..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>State</th>
                  <th>Challan Amount</th>
                  <th>Service Charges</th>
                  <th>Grand Total (PB)</th>
                  <th>Grand Total (ISB)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: 32 }}>Loading...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <div className="empty-state-icon">🧾</div>
                        <h3>No invoices found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600, color: "var(--primary)", cursor: "pointer" }} onClick={() => openInvoice(inv)}>
                        {inv.invoiceNumber}
                      </td>
                      <td>{inv.dated}</td>
                      <td>{inv.customerName}</td>
                      <td>{inv.maker} ({inv.vehicleType})</td>
                      <td>{inv.state}</td>
                      <td>{Number(inv.challanAmount).toLocaleString()}</td>
                      <td>{Number(inv.serviceCharges).toLocaleString()}</td>
                      <td>{Number(inv.grandTotalPunjab).toLocaleString()}</td>
                      <td>{Number(inv.grandTotalIslamabad).toLocaleString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openInvoice(inv)}>View</button>
                          {can('edit') && (
                            <button className="btn btn-outline btn-sm" onClick={() => editInvoice(inv)}>Edit</button>
                          )}
                          {can('edit') && (
                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteInvoice(inv.id)}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Page {page}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={invoices.length < 20}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
