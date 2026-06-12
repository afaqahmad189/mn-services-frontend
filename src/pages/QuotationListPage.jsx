import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../context/AuthContext";

export default function QuotationListPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/quotations", { params: { page, limit: 20, search } });
      setQuotations(data.data);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openQuotation = (q) => {
    navigate("/quotation/preview", {
      state: {
        form: {
          dated: q.dated,
          customerName: q.customerName,
          contractNo: q.contractNo,
          registrationNo: q.registrationNo,
          vehicleType: q.vehicleType,
          maker: q.maker,
          cc: String(q.cc),
          carPrice: q.carPrice,
          customerType: q.customerType,
          state: q.state,
          specialNo: q.specialNo
        },
        editId: q.id,
        quotationNumber: q.quotationNumber,
        challanData: q.challanData,
        servicesData: q.servicesData,
      },
    });
  };

  const editQuotation = (q) => {
    navigate("/quotations", {
      state: {
        form: {
          dated: q.dated,
          customerName: q.customerName,
          contractNo: q.contractNo,
          registrationNo: q.registrationNo,
          vehicleType: q.vehicleType,
          maker: q.maker,
          cc: String(q.cc),
          carPrice: q.carPrice,
          customerType: q.customerType,
          state: q.state,
          specialNo: q.specialNo
        },
        editId: q.id,
        quotationNumber: q.quotationNumber,
        challanData: q.challanData,
        servicesData: q.servicesData,
      },
    });
  };

  const deleteQuotation = async (id) => {
    if (!window.confirm("Delete this quotation?")) return;
    try {
      await api.delete(`/quotations/${id}`);
      toast.success("Quotation deleted");
      load();
    } catch {
      toast.error("Failed to delete quotation");
    }
  };

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--primary))", color: "#fff", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📄 Quotations</h1>
            <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>{total} saved quotations</p>
          </div>
          <button
            className="btn"
            style={{ background: "#fff", color: "var(--primary)", fontWeight: 600 }}
            onClick={() => navigate("/quotations")}
          >
            + New Quotation
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          <div className="header-search" style={{ flex: 1 }}>
            <span>🔍</span>
            <input
              placeholder="Search quotation no, customer, registration..."
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
                  <th>Quotation No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>State</th>
                  <th>Grand Total (PB)</th>
                  <th>Grand Total (ISB)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 32 }}>Loading...</td></tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h3>No quotations found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: 600, color: "var(--primary)", cursor: "pointer" }} onClick={() => openQuotation(q)}>
                        {q.quotationNumber}
                      </td>
                      <td>{q.dated}</td>
                      <td>{q.customerName}</td>
                      <td>{q.maker} ({q.vehicleType})</td>
                      <td>{q.state}</td>
                      <td>{Number(q.grandTotalPunjab).toLocaleString()}</td>
                      <td>{Number(q.grandTotalIslamabad).toLocaleString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openQuotation(q)}>View</button>
                          <button className="btn btn-outline btn-sm" onClick={() => editQuotation(q)}>Edit</button>
                          <button className="btn btn-outline btn-sm" onClick={() => deleteQuotation(q.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
