import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api, useAuth } from "../context/AuthContext";
import { generatePDF } from "../utils/pdfGenerator";
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

function AmountCell({ value, onChange }) {
  return (
    <input
      className="bill-input"
      style={{ border: "none" }}
      type="number"
      min="0"
      value={value || ""}
      onChange={onChange}
    />
  );
}

/**
 * Build initial editable data from the form's challanAmount and serviceCharges.
 * - challanAmount goes into the first challan row (TransferChallanAmount) under the relevant state columns.
 * - serviceCharges goes into the ServiceCharges service row under the relevant state columns.
 * If challanData/servicesData are already saved (edit mode), those take priority.
 */
function buildInitialData(form, savedChallan, savedServices) {
  if (savedChallan && savedServices) {
    return { challan: savedChallan, services: savedServices };
  }

  const base = JSON.parse(JSON.stringify(EMPTY_CHARGES));
  const state = form.state || "Punjab";
  const challan = Number(form.challanAmount || 0);
  const service = Number(form.serviceCharges || 0);

  const setPunjab = state === "Punjab" || state === "Both";
  const setIslamabad = state === "Islamabad" || state === "Both";

  // Put challan total into TransferChallanAmount row
  if (challan > 0) {
    if (setPunjab) base.challan.TransferChallanAmount.punjab = challan;
    if (setIslamabad) base.challan.TransferChallanAmount.islamabad = challan;
  }

  // Put service charges into ServiceCharges row
  if (service > 0) {
    if (setPunjab) base.services.ServiceCharges.punjab = service;
    if (setIslamabad) base.services.ServiceCharges.islamabad = service;
  }

  return base;
}

export default function InvoiceGeneratorPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { can } = useAuth();

  const form = state?.form || state || {};
  const editId = state?.editId || null;
  const savedInvoiceNumber = state?.invoiceNumber || null;

  const [data, setData] = useState(() =>
    buildInitialData(form, state?.challanData, state?.servicesData)
  );
  const [saving, setSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(savedInvoiceNumber);

  // Re-initialise if navigation state changes (e.g. coming from edit)
  useEffect(() => {
    setData(buildInitialData(form, state?.challanData, state?.servicesData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      type: form.type || null,
      contractNo: form.contractNo || null,
      registrationNo: form.registrationNo || null,
      vehicleType: form.vehicleType,
      maker: form.maker || null,
      cc: Number(form.cc || 0),
      invoicePrice: Number(form.invoicePrice || 0),
      withholdingTax: Number(form.withholdingTax || 0),
      carPrice: Number(form.carPrice || 0),
      customerType: form.customerType,
      state: form.state,
      // Use totals from the editable table as challan/service amounts
      challanAmount: showPunjab ? challanPunjabTotal : challanIslamabadTotal,
      serviceCharges: showPunjab ? servicePunjabTotal : serviceIslamabadTotal,
      challanData: data.challan,
      servicesData: data.services,
    };

    setSaving(true);
    try {
      if (editId) {
        const { data: saved } = await api.put(`/invoice-generators/${editId}`, payload);
        setInvoiceNumber(saved.invoiceNumber);
        toast.success("Invoice updated");
      } else {
        const { data: saved } = await api.post("/invoice-generators", payload);
        setInvoiceNumber(saved.invoiceNumber);
        toast.success(`Invoice saved: ${saved.invoiceNumber}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  if (!form.customerName) {
    return (
      <div className="quotation-page">
        <div className="quotation-empty no-print">
          <h2>No invoice data</h2>
          <p>Please fill the invoice generator form first.</p>
          <button className="btn btn-primary" onClick={() => navigate("/invoice-generator")}>
            Go to Invoice Generator
          </button>
        </div>
      </div>
    );
  }

  const vehicleInfo = [form.maker, form.vehicleType].filter(Boolean).join(" - ");
  const invoiceValue = form.carPrice ? Number(form.carPrice).toLocaleString() : "-";

  const handleSavePDF = () => {
    generatePDF(
      "invoice-generator-print",
      `INVOICE_${form.customerName || "Customer"}_${new Date().toLocaleDateString()}.pdf`,
      "portrait"
    );
  };

  return (
    <div className="quotation-page">
      <div className="no-print quotation-actions">
        <button className="btn btn-outline" onClick={() => navigate("/invoice-generator")}>
          ← Back to Form
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/invoice-generator/list")}>
          View Saved Invoices
        </button>

        {can("edit") && (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editId ? "Update Invoice" : "Save Invoice"}
          </button>
        )}

        {can("view") && (
          <div className="print-mode-group">
            <button
              className="btn btn-primary"
              style={{ background: "var(--success)", border: "none" }}
              onClick={handleSavePDF}
            >
              💾 Save PDF
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              🖨️ Print
            </button>
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto", width: "100%", paddingBottom: "20px" }}>
        <div
          className="quotation-bill"
          id="invoice-generator-print"
          style={{
            backgroundImage: "url('/letter-pad.jpeg')",
            backgroundSize: "166% 104%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
            width: "210mm",
            paddingTop: "160px",
            paddingBottom: "95px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <div
            className="print-doc-type-label"
            style={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.15em",
              marginBottom: "8px",
              color: "#0D2B5E",
            }}
          >
            INVOICE
          </div>

          <div className="bill-info-box">
            <div className="bill-info-row">
              <span>DATED:</span>
              <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>
                {formatDate(form.dated)}
              </span>
              {invoiceNumber && (
                <>
                  <span style={{ marginLeft: 24 }}>INVOICE NO:</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>
                    {invoiceNumber}
                  </span>
                </>
              )}
              <span style={{ marginLeft: 24 }}>Customer Name:</span>
              <span className="bill-info-value" style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>
                {form.customerName}
              </span>
            </div>
            <div className="bill-info-row">
              <span>Type of Invoice:</span>
              <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>{form.type || "-"}</span>
              <span style={{ marginLeft: 24 }}>Contract No:</span>
              <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>{form.contractNo || "-"}</span>
            </div>
            <div className="bill-info-row">
              <span>VEHICLE TYPE &amp; INVOICE VALUE:</span>
              <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>
                {vehicleInfo} — Rs. {invoiceValue}
              </span>
            </div>
            <div className="bill-info-row bill-reg-row">
              <span>REGISTRATION NO.:</span>
              <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>
                {form.registrationNo || "-"}
              </span>
              <span style={{ marginLeft: 34 }}>SPECIAL NO.:</span>
              <span style={{ fontSize: "16px", fontWeight: 700, marginLeft: 10 }}>
                {form.specialNo || "-"}
              </span>
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
              {/* ── Challan rows ── */}
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
                <td>
                  <strong>TOTAL CHALLAN AMOUNT</strong>
                </td>
                {showPunjab && (
                  <td className="bill-col-amt">
                    <strong>{formatAmount(challanPunjabTotal)}</strong>
                  </td>
                )}
                {showIslamabad && (
                  <td className="bill-col-amt">
                    <strong>{formatAmount(challanIslamabadTotal)}</strong>
                  </td>
                )}
              </tr>

              {/* ── Service rows ── */}
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
                <td>
                  <strong>GRAND TOTAL</strong>
                </td>
                {showPunjab && (
                  <td className="bill-col-amt">
                    <strong>{formatAmount(grandPunjabTotal)}</strong>
                  </td>
                )}
                {showIslamabad && (
                  <td className="bill-col-amt">
                    <strong>{formatAmount(grandIslamabadTotal)}</strong>
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          <div className="bill-signature">
            <p className="text-danger">
              <strong>Note:</strong> This invoice is provided for estimation purposes only. Final pricing
              may vary based on project requirements, scope changes, and market conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
