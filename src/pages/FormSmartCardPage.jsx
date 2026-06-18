import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_FIELDS = [
  { "id": 1781260553948, "x": 100.34375, "y": 50.40625, "w": 150, "h": 44, "label": "Field 1", "value": "", "font-size": 44 },
  { "id": 1781260560380, "x": 172.34375, "y": 155.40625, "w": 200, "h": 24, "label": "Field 2", "value": "" },
  { "id": 1781260563003, "x": 310.34375, "y": 275.40625, "w": 170, "h": 24, "label": "Field 3", "value": "" },
  { "id": 1781260581040, "x": 90.34375, "y": 275.40625, "w": 170, "h": 24, "label": "Field 4", "value": "" },
  { "id": 1781260586916, "x": 550.34375, "y": 310.40625, "w": 170, "h": 24, "label": "Field 5", "value": "" },
  { "id": 1781260595935, "x": 300.34375, "y": 550.40625, "w": 170, "h": 24, "label": "Field 6", "value": "" },
  { "id": 1781260601660, "x": 70.34375, "y": 630.40625, "w": 200, "h": 24, "label": "Field 7", "value": "" },
  { "id": 1781260604776, "x": 70.34375, "y": 670.40625, "w": 280, "h": 24, "label": "Field 8", "value": "" },
  { "id": 1781260605902, "x": 70.34375, "y": 700.40625, "w": 300, "h": 24, "label": "Field 9", "value": "" },
  { "id": 1781260608361, "x": 70.34375, "y": 740.40625, "w": 260, "h": 24, "label": "Field 10", "value": "" },
  { "id": 1781260610501, "x": 70.34375, "y": 780.40625, "w": 330, "h": 24, "label": "Field 11", "value": "" },
  { "id": 1781260612325, "x": 240.34375, "y": 820.40625, "w": 180, "h": 24, "label": "Field 12", "value": "" },
  { "id": 1781260613934, "x": 70.34375, "y": 820.40625, "w": 110, "h": 24, "label": "Field 13", "value": "" },
  { "id": 1781260615808, "x": 400.34375, "y": 1017.40625, "w": 100, "h": 24, "label": "Field 14", "value": "" },
  { "id": 1781260619054, "x": 665.34375, "y": 1010.40625, "w": 90, "h": 24, "label": "Field 15", "value": "" },
];

export default function SmartCardFormPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState(INITIAL_FIELDS);

  return (
    <div className="quotation-page">
      <style>{`
        .form-f-input {
          background: rgba(21, 101, 192, 0.05);
          border: 1px dashed rgba(21, 101, 192, 0.3);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          color: #000;
          padding: 0 4px;
        }
        .form-f-input:focus {
          background: rgba(21, 101, 192, 0.1);
          border: 1px solid #1565C0;
        }
        @media print {
          .form-f-input {
            background: transparent !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="no-print quotation-actions">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print Form
        </button>
      </div>

      <div style={{ overflowX: 'auto', width: '100%', paddingBottom: '20px' }}>
        <div style={{
          position: 'relative',
          backgroundImage: "url('/pdfs/smartcardform.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          width: '210mm',
          height: '297mm', // strict A4 ratio
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        >
          {fields.map((f, i) => (
            <div
              key={f.id}
              style={{
                position: 'absolute',
                left: f.x,
                top: f.y - 12,
                width: f.w,
                height: f.h,
              }}
            >
              <input
                className="form-f-input"
                type="text"
                autoFocus={i === 0}
                value={f.value}
                onChange={(e) => {
                  const newFields = [...fields];
                  newFields[i].value = e.target.value;
                  setFields(newFields);
                }}
                style={{
                  width: '100%', height: '100%',
                  textAlign: 'right',
                  fontSize: f['font-size']
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
