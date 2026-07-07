import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_FIELDS = [
  { "id": 1781260553948, "x": 200.34375, "y": 126.40625, "w": 550, "h": 24, "label": "Field 1", "value": "" },
  { "id": 1781260560380, "x": 300.34375, "y": 150.40625, "w": 450, "h": 24, "label": "Field 2", "value": "" },
  { "id": 1781260563003, "x": 360.34375, "y": 172.40625, "w": 400, "h": 24, "label": "Field 3", "value": "" },
  { "id": 1781260581040, "x": 10.34375, "y": 198.40625, "w": 750, "h": 24, "label": "Field 4", "value": "" },
  { "id": 1781260586916, "x": 170.34375, "y": 220.40625, "w": 210, "h": 24, "label": "Field 5", "value": "" },
  { "id": 1781260595935, "x": 570.34375, "y": 220.40625, "w": 210, "h": 24, "label": "Field 6", "value": "" },
  { "id": 1781260601660, "x": 170.34375, "y": 242.40625, "w": 210, "h": 24, "label": "Field 7", "value": "" },
  { "id": 1781260604776, "x": 570.34375, "y": 242.40625, "w": 210, "h": 24, "label": "Field 8", "value": "" },
  { "id": 1781260605902, "x": 170.34375, "y": 264.40625, "w": 210, "h": 24, "label": "Field 9", "value": "" },
  { "id": 1781260608361, "x": 570.34375, "y": 264.40625, "w": 210, "h": 24, "label": "Field 10", "value": "" },
  { "id": 1781260608361, "x": 170.34375, "y": 286.40625, "w": 210, "h": 24, "label": "Field 11", "value": "" },
  { "id": 1781260610501, "x": 570.34375, "y": 286.40625, "w": 210, "h": 24, "label": "Field 12", "value": "" },
  { "id": 1781260612325, "x": 310.34375, "y": 307.40625, "w": 340, "h": 24, "label": "Field 14", "value": "" },
  { "id": 1781260610501, "x": 170.34375, "y": 330.40625, "w": 210, "h": 24, "label": "Field 15", "value": "" },
  { "id": 1781260612325, "x": 570.34375, "y": 330.40625, "w": 210, "h": 24, "label": "Field 16", "value": "" },
  { "id": 1781260613934, "x": 170.34375, "y": 353.40625, "w": 210, "h": 24, "label": "Field 17", "value": "" },
  { "id": 1781260615808, "x": 570.34375, "y": 353.40625, "w": 210, "h": 24, "label": "Field 18", "value": "" },
  { "id": 1781260619054, "x": 310.34375, "y": 375.40625, "w": 70, "h": 24, "label": "Field 19", "value": "" },
  { "id": 1781260623218, "x": 375.34375, "y": 395.40625, "w": 250, "h": 24, "label": "Field 20", "value": "" },
  { "id": 1781260626131, "x": 375.34375, "y": 418.40625, "w": 270, "h": 24, "label": "Field 21", "value": "" },
  { "id": 1781260628628, "x": 390.34375, "y": 438.40625, "w": 260, "h": 24, "label": "Field 22", "value": "" },
  { "id": 1781260631009, "x": 250.34375, "y": 483.40625, "w": 390, "h": 24, "label": "Field 23", "value": "" },
  { "id": 1781260633023, "x": 164.34375, "y": 505.40625, "w": 100, "h": 24, "label": "Field 24", "value": "" },
  { "id": 1781260635442, "x": 580.34375, "y": 505.40625, "w": 100, "h": 24, "label": "Field 25", "value": "" },
  { "id": 1781260638203, "x": 100.34375, "y": 528.40625, "w": 180, "h": 24, "label": "Field 26", "value": "" },
  { "id": 1781260643259, "x": 510.34375, "y": 528.40625, "w": 170, "h": 24, "label": "Field 27", "value": "" },
  { "id": 1781260645970, "x": 100.34375, "y": 550.40625, "w": 180, "h": 24, "label": "Field 28", "value": "" },
  { "id": 1781260648211, "x": 510.34375, "y": 550.40625, "w": 170, "h": 24, "label": "Field 29", "value": "" },
  { "id": 1781260652492, "x": 100.34375, "y": 572.40625, "w": 180, "h": 24, "label": "Field 30", "value": "" },
  { "id": 1781260656077, "x": 510.34375, "y": 572.40625, "w": 170, "h": 24, "label": "Field 31", "value": "" },
  { "id": 1781260658712, "x": 300.34375, "y": 594.40625, "w": 410, "h": 24, "label": "Field 32", "value": "" },
  { "id": 1781260659890, "x": 330.34375, "y": 616.40625, "w": 390, "h": 24, "label": "Field 33", "value": "" },
  { "id": 1781260662322, "x": 280.34375, "y": 638.40625, "w": 370, "h": 24, "label": "Field 34", "value": "" },
  { "id": 1781260665008, "x": 110.34375, "y": 683.40625, "w": 200, "h": 24, "label": "Field 35", "value": "" },
  { "id": 1781260671202, "x": 540.34375, "y": 683.40625, "w": 170, "h": 24, "label": "Field 36", "value": "" },
  { "id": 1781260673380, "x": 320.34375, "y": 705.40625, "w": 300, "h": 24, "label": "Field 37", "value": "" },
  { "id": 1781260676573, "x": 380.34375, "y": 970.40625, "w": 280, "h": 24, "label": "Field 38", "value": "" },
];

export default function FormFPage() {
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
          backgroundImage: "url('/pdfs/f-form-1.jpg')",
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
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
