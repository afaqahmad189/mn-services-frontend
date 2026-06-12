import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../context/AuthContext";
import { buildQuotationData } from "../utils/quotationCalculator";
import {
  CHALLAN_LABELS,
  SERVICE_LABELS,
  EMPTY_CHARGES,
  sumColumn,
  formatAmount,
} from "../utils/quotationConstants";

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function AmountCell({ value, onChange, editable = true }) {
  if (!editable) {
    return <span className="bill-amount">{formatAmount(value)}</span>;
  }
  return (
    <input
      className="bill-input"
      type="number"
      min="0"
      value={value || ""}
      onChange={onChange}
    />
  );
}

export default function QuotationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const form = state?.form || state || {};
  const editId = state?.editId || null;
  const savedQuotationNumber = state?.quotationNumber || null;

  const [data, setData] = useState(EMPTY_CHARGES);
  const [saving, setSaving] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState(savedQuotationNumber);

  useEffect(() => {
    if (state?.challanData && state?.servicesData) {
      setData({ challan: state.challanData, services: state.servicesData });
      return;
    }
    setData(buildQuotationData(form));
  }, [form, state]);

  const updateChallan = (field, column, value) => {
    setData((prev) => ({
      ...prev,
      challan: {
        ...prev.challan,
        [field]: { ...prev.challan[field], [column]: Number(value || 0) },
      },
    }));
  };

  const updateService = (field, column, value) => {
    setData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [field]: { ...prev.services[field], [column]: Number(value || 0) },
      },
    }));
  };

  const challanPunjabTotal = useMemo(() => sumColumn(data.challan, "punjab"), [data.challan]);
  const challanIslamabadTotal = useMemo(() => sumColumn(data.challan, "islamabad"), [data.challan]);
  const servicePunjabTotal = useMemo(() => sumColumn(data.services, "punjab"), [data.services]);
  const serviceIslamabadTotal = useMemo(() => sumColumn(data.services, "islamabad"), [data.services]);
  const grandPunjabTotal = challanPunjabTotal + servicePunjabTotal;
  const grandIslamabadTotal = challanIslamabadTotal + serviceIslamabadTotal;

  const showPunjab = form.state === "Punjab" || form.state === "Both";
  const showIslamabad = form.state === "Islamabad" || form.state === "Both";

  const handleSave = async () => {
    if (!form.customerName) {
      toast.error("Customer name is required");
      return;
    }

    const payload = {
      dated: form.dated || new Date().toISOString().slice(0, 10),
      customerName: form.customerName,
      specialNo: form.specialNo || null,
      contractNo: form.contractNo || null,
      registrationNo: form.registrationNo || null,
      vehicleType: form.vehicleType,
      maker: form.maker || null,
      cc: Number(form.cc || 0),
      carPrice: Number(form.carPrice || 0),
      customerType: form.customerType,
      state: form.state,
      challanData: data.challan,
      servicesData: data.services,
    };

    setSaving(true);
    try {
      if (editId) {
        const { data: saved } = await api.put(`/quotations/${editId}`, payload);
        setQuotationNumber(saved.quotationNumber);
        toast.success("Quotation updated");
      } else {
        const { data: saved } = await api.post("/quotations", payload);
        setQuotationNumber(saved.quotationNumber);
        toast.success(`Quotation saved: ${saved.quotationNumber}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  if (!form.customerName) {
    return (
      <div className="quotation-page">
        <div className="quotation-empty no-print">
          <h2>No quotation data</h2>
          <p>Please fill the quotation form first.</p>
          <button className="btn btn-primary" onClick={() => navigate("/quotations")}>
            Go to Quotation Form
          </button>
        </div>
      </div>
    );
  }

  const vehicleInfo = [form.maker, form.vehicleType].filter(Boolean).join(" - ");
  const invoiceValue = form.carPrice ? Number(form.carPrice).toLocaleString() : "-";


  return (
    <div className="quotation-page">
      <div className="no-print quotation-actions">
        <button className="btn btn-outline" onClick={() => navigate("/quotations")}>
          ← Back to Form
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/quotations/list")}>
          View Saved Quotations
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : editId ? "Update Quotation" : "Save Quotation"}
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print Quotation
        </button>
      </div>

      <div style={{ overflowX: 'auto', width: '100%', paddingBottom: '20px' }}>
        <div className="quotation-bill" id="quotation-print" style={{
          backgroundImage: "url('/letter-pad.jpeg')",
          backgroundSize: '166% 104%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          width: '210mm',
          minHeight: '297mm',
          paddingTop: '180px',
          paddingBottom: '120px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <header className="bill-header" style={{ display: 'none' }}>
            <h1 className="bill-company">M.N. SERVICES</h1>
            <p className="bill-tagline">
              We Deals In All Kind Of Motor Vehicles Registrations In All Over The Pakistan, NTN - 3220154-7
            </p>
            <h2 className="bill-title">QUOTATION</h2>
          </header>

          <div className="bill-info-box">
            <div className="bill-info-row">
              <span className="bill-info-label">DATED:</span>
              <span>{formatDate(form.dated)}</span>
              {quotationNumber && (
                <>
                  <span className="bill-info-label" style={{ marginLeft: 24 }}>QUOTATION NO:</span>
                  <span>{quotationNumber}</span>
                </>
              )}
            </div>
            <div className="bill-info-row">
              <span className="bill-info-label">Customer Name:</span>
              <span className="bill-info-value">{form.customerName}</span>
            </div>
            <div className="bill-info-row">
              <span className="bill-info-label">Contract No:</span>
              <span>{form.contractNo || "-"}</span>
            </div>
            <div className="bill-info-row">
              <span className="bill-info-label">VEHICLE TYPE &amp; INVOICE VALUE:</span>
              <span>{vehicleInfo} — Rs. {invoiceValue}</span>
            </div>
            <div className="bill-info-row bill-reg-row">
              <span className="bill-info-label">REGISTRATION NO.:</span>
              <span>{form.registrationNo || "-"}</span>
            </div>
            <div className="bill-info-row bill-reg-row">
              <span className="bill-info-label">SPECIAL NO.:</span>
              <span>{form.specialNo || "-"}</span>
            </div>
          </div>

          <table className="bill-table" style={{ background: "none" }}>
            <thead>
              <tr>
                <th className="bill-col-sr">SR. NO.</th>
                <th className="bill-col-desc">DESCRIPTION</th>
                {showPunjab && <th className="bill-col-amt">PUNJAB (VALUE)</th>}
                {showIslamabad && <th className="bill-col-amt">ISLAMABAD (VALUE)</th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(CHALLAN_LABELS).map(([key, label], index) => (
                <tr key={key}>
                  <td className="bill-col-sr">{index + 1}</td>
                  <td className="bill-col-desc">{label}</td>
                  {showPunjab && (
                    <td className="bill-col-amt">
                      <AmountCell
                        value={data.challan[key]?.punjab}
                        onChange={(e) => updateChallan(key, "punjab", e.target.value)}
                      />
                    </td>
                  )}
                  {showIslamabad && (
                    <td className="bill-col-amt">
                      <AmountCell
                        value={data.challan[key]?.islamabad}
                        onChange={(e) => updateChallan(key, "islamabad", e.target.value)}
                      />
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bill-total-row">
                <td />
                <td><strong>TOTAL CHALLAN AMOUNT</strong></td>
                {showPunjab && <td className="bill-col-amt"><strong>{formatAmount(challanPunjabTotal)}</strong></td>}
                {showIslamabad && <td className="bill-col-amt"><strong>{formatAmount(challanIslamabadTotal)}</strong></td>}
              </tr>

              {Object.entries(SERVICE_LABELS).map(([key, label], index) => (
                <tr key={key}>
                  <td className="bill-col-sr">{index + 1}</td>
                  <td className="bill-col-desc">{label || "\u00A0"}</td>
                  {showPunjab && (
                    <td className="bill-col-amt">
                      <AmountCell
                        value={data.services[key]?.punjab}
                        onChange={(e) => updateService(key, "punjab", e.target.value)}
                      />
                    </td>
                  )}
                  {showIslamabad && (
                    <td className="bill-col-amt">
                      <AmountCell
                        value={data.services[key]?.islamabad}
                        onChange={(e) => updateService(key, "islamabad", e.target.value)}
                      />
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bill-grand-row">
                <td />
                <td><strong>GRAND TOTAL</strong></td>
                {showPunjab && <td className="bill-col-amt"><strong>{formatAmount(grandPunjabTotal)}</strong></td>}
                {showIslamabad && <td className="bill-col-amt"><strong>{formatAmount(grandIslamabadTotal)}</strong></td>}
              </tr>
            </tbody>
          </table>

          <div className="bill-signature">
            <em><strong>FOR M.N. SERVICES</strong></em>
            <p className="text-danger">
              <strong>Note:</strong> This quotation is provided for estimation purposes only. Final pricing may vary based on project requirements, scope changes, and market conditions.
            </p>
          </div>

          <footer className="bill-footer" style={{ display: 'none' }}>
            OFFICE NO C-816, BILAL ROAD, NEAR EXCISE &amp; TAXATION OFFICE, FAISALABAD.
            <br></br>
            <span>For Contact: 041-2648555</span>
          </footer>
        </div>
      </div>
    </div >
  );
}
