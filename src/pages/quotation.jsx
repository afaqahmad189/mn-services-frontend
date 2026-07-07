import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchableSelect from "../components/SearchableSelect";
import { api } from '../context/AuthContext';

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


const vehicleTypeOptions = [
  { value: "New", label: "New" },
  { value: "Used", label: "Used" },
  { value: "Electric", label: "Electric" },
  { value: "Imported", label: "Imported" },
  { value: "PHEV", label: "PHEV" },
];

const ccOptions = [
  { value: "1000", label: "1000 cc" },
  { value: "1200", label: "1200 cc" },
  { value: "1300", label: "1300 cc" },
  { value: "1500", label: "1500 cc" },
  { value: "1600", label: "1600 cc" },
  { value: "1800", label: "1800 cc" },
  { value: "2000", label: "2000 cc" },
  { value: "2500", label: "2500 cc" },
  { value: "3000", label: "3000 cc" },
];

const customerTypeOptions = [
  { value: "Filer", label: "Filer" },
  { value: "NonFiler", label: "Non-Filer" },
];

const stateOptions = [
  { value: "Punjab", label: "Punjab" },
  { value: "Islamabad", label: "Islamabad" },
  { value: "Both", label: "Both" },
];

const type = [
  { value: "Reference", label: "Reference" },
  { value: "CNIC", label: "CNIC" },
  { value: "Contract", label: "Contract" },
];


export default function QuotationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(defaultForm);
  const [cars, setCars] = useState([])

  const load = useCallback(async () => {
    const { data } = await api.get('/cars/web-cars');
    setCars(data.data);
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const setField = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

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
              <SearchableSelect
                options={vehicleTypeOptions}
                value={form.vehicleType}
                onChange={setField('vehicleType')}
                placeholder="Select vehicle type..."
              />
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
              <label className="form-label required">Type of Qutation</label>
              <SearchableSelect
                options={type}
                value={form.type}
                onChange={setField('type')}
                placeholder="Select type..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detail</label>
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
              <SearchableSelect
                options={ccOptions}
                value={form.cc}
                onChange={setField('cc')}
                placeholder="Select CC..."
              />
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
              <SearchableSelect
                options={cars.map(c => ({ value: c.name, label: c.name }))}
                value={form.maker}
                onChange={setField('maker')}
                placeholder="Search vehicle model..."
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Customer Type</label>
              <SearchableSelect
                options={customerTypeOptions}
                value={form.customerType}
                onChange={setField('customerType')}
                placeholder="Select customer type..."
              />
            </div>

            <div className="form-group">
              <label className="form-label required">State</label>
              <SearchableSelect
                options={stateOptions}
                value={form.state}
                onChange={setField('state')}
                placeholder="Select state..."
              />
            </div>
          </div>

          {form.vehicleType !== "New" && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16, marginTop: 12 }}>
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
