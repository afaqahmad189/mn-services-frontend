import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const defaultForm = {
  dated: new Date().toISOString().slice(0, 10),
  vehicleType: "New",
  customerName: "",
  contractNo: "",
  registrationNo: "",
  specialNo: "",
  cc: "1000",
  carPrice: "",
  maker: "",
  customerType: "Filer",
  state: "Punjab",
};

export default function QuotationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (location.state?.form) {
      setForm({
        ...defaultForm,
        ...location.state.form,
        dated: location.state.form.dated || defaultForm.dated,
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/quotation/preview", {
      state: {
        form,
        editId: location.state?.editId || null,
        quotationNumber: location.state?.quotationNumber || null,
      },
    });
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "800px" }}>
        <div className="login-logo">
          <div className="login-logo-icon">Q</div>
          <h1>Quotation Form</h1>
          <p>Enter vehicle details to generate quotation</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Date</label>
              <input
                className="form-control"
                name="dated"
                type="date"
                value={form.dated}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Vehicle Type</label>
              <select
                className="form-control"
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
              >
                <option>New</option>
                <option>Used</option>
                <option>Electric</option>
                <option>Imported</option>
                <option>PHEV</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Customer Name</label>
              <input
                className="form-control"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contract No</label>
              <input
                className="form-control"
                name="contractNo"
                value={form.contractNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registration No</label>
              <input
                className="form-control"
                name="registrationNo"
                value={form.registrationNo}
                onChange={handleChange}
                placeholder="e.g. FD-18-24"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special No</label>
              <input
                className="form-control"
                name="specialNo"
                value={form.specialNo}
                onChange={handleChange}
                placeholder="e.g. FD-18-24"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">CC</label>
              <select
                className="form-control"
                name="cc"
                value={form.cc}
                onChange={handleChange}
              >
                <option value="1000">1000</option>
                <option value="1200">1200</option>
                <option value="1300">1300</option>
                <option value="1500">1500</option>
                <option value="1600">1600</option>
                <option value="1800">1800</option>
                <option value="2000">2000</option>
                <option value="2500">2500</option>
                <option value="3000">3000</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Car Price</label>
              <input
                className="form-control"
                name="carPrice"
                type="number"
                min="0"
                value={form.carPrice}
                onChange={handleChange}
                required={form.vehicleType === "New"}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Maker / Model</label>
              <input
                className="form-control"
                name="maker"
                value={form.maker}
                onChange={handleChange}
                placeholder="e.g. HONDA CITY"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Customer Type</label>
              <select
                className="form-control"
                name="customerType"
                value={form.customerType}
                onChange={handleChange}
              >
                <option>Filer</option>
                <option>NonFiler</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">State</label>
              <select
                className="form-control"
                name="state"
                value={form.state}
                onChange={handleChange}
              >
                <option>Punjab</option>
                <option>Islamabad</option>
                <option>Both</option>
              </select>
            </div>
          </div>

          {form.vehicleType !== "New" && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Auto-calculation applies only for New vehicles. Other types start with zero amounts for manual entry.
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 25 }}>
            <button className="btn btn-primary btn-lg" type="submit" style={{ flex: 1 }}>
              Generate Quotation
            </button>
            <button
              className="btn btn-outline btn-lg"
              type="button"
              onClick={() => navigate("/quotations/list")}
            >
              Saved Quotations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
