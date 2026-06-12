import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_FIELDS = [
  { "id": 1781260553948, "x": 323.34375, "y": 112.40625, "w": 350, "h": 24, "label": "Field 1", "value": "" },
  { "id": 1781260560380, "x": 342.34375, "y": 135.40625, "w": 350, "h": 24, "label": "Field 2", "value": "" },
  { "id": 1781260563003, "x": 456.34375, "y": 151.40625, "w": 250, "h": 24, "label": "Field 3", "value": "" },
  { "id": 1781260581040, "x": 100.34375, "y": 179.40625, "w": 600, "h": 24, "label": "Field 4", "value": "" },
  { "id": 1781260586916, "x": 100.34375, "y": 193.40625, "w": 380, "h": 24, "label": "Field 5", "value": "" },
  { "id": 1781260595935, "x": 558.34375, "y": 196.40625, "w": 140, "h": 24, "label": "Field 6", "value": "" },
  { "id": 1781260601660, "x": 280.34375, "y": 226.40625, "w": 70, "h": 24, "label": "Field 7", "value": "" },
  { "id": 1781260604776, "x": 379.34375, "y": 226.40625, "w": 200, "h": 24, "label": "Field 8", "value": "" },
  { "id": 1781260605902, "x": 613.34375, "y": 226.40625, "w": 100, "h": 24, "label": "Field 9", "value": "" },
  { "id": 1781260608361, "x": 561.34375, "y": 265.40625, "w": 130, "h": 24, "label": "Field 10", "value": "" },
  { "id": 1781260610501, "x": 600.34375, "y": 288.40625, "w": 100, "h": 24, "label": "Field 11", "value": "" },
  { "id": 1781260612325, "x": 596.34375, "y": 309.40625, "w": 100, "h": 24, "label": "Field 12", "value": "" },
  { "id": 1781260613934, "x": 443.34375, "y": 332.40625, "w": 250, "h": 24, "label": "Field 13", "value": "" },
  { "id": 1781260615808, "x": 391.34375, "y": 354.40625, "w": 300, "h": 24, "label": "Field 14", "value": "" },
  { "id": 1781260619054, "x": 240.34375, "y": 374.40625, "w": 450, "h": 24, "label": "Field 15", "value": "" },
  { "id": 1781260623218, "x": 555.34375, "y": 393.40625, "w": 120, "h": 24, "label": "Field 16", "value": "" },
  { "id": 1781260626131, "x": 568.34375, "y": 418.40625, "w": 130, "h": 24, "label": "Field 17", "value": "" },
  { "id": 1781260628628, "x": 483.34375, "y": 437.40625, "w": 200, "h": 24, "label": "Field 18", "value": "" },
  { "id": 1781260631009, "x": 474.34375, "y": 459.40625, "w": 230, "h": 24, "label": "Field 19", "value": "" },
  { "id": 1781260633023, "x": 518.34375, "y": 479.40625, "w": 180, "h": 24, "label": "Field 20", "value": "" },
  { "id": 1781260635442, "x": 359.34375, "y": 534.40625, "w": 350, "h": 24, "label": "Field 21", "value": "" },
  { "id": 1781260638203, "x": 285.34375, "y": 553.40625, "w": 80, "h": 24, "label": "Field 22", "value": "" },
  { "id": 1781260643259, "x": 225.34375, "y": 576.40625, "w": 130, "h": 24, "label": "Field 23", "value": "" },
  { "id": 1781260645970, "x": 223.34375, "y": 592.40625, "w": 140, "h": 24, "label": "Field 24", "value": "" },
  { "id": 1781260648211, "x": 221.34375, "y": 607.40625, "w": 150, "h": 24, "label": "Field 25", "value": "" },
  { "id": 1781260652492, "x": 597.34375, "y": 557.40625, "w": 60, "h": 24, "label": "Field 26", "value": "" },
  { "id": 1781260656077, "x": 550.34375, "y": 574.40625, "w": 110, "h": 24, "label": "Field 27", "value": "" },
  { "id": 1781260658712, "x": 550.34375, "y": 591.40625, "w": 110, "h": 24, "label": "Field 28", "value": "" },
  { "id": 1781260659890, "x": 549.34375, "y": 606.40625, "w": 110, "h": 24, "label": "Field 29", "value": "" },
  { "id": 1781260662322, "x": 378.34375, "y": 626.40625, "w": 300, "h": 24, "label": "Field 30", "value": "" },
  { "id": 1781260665008, "x": 256.34375, "y": 657.40625, "w": 430, "h": 24, "label": "Field 31", "value": "" },
  { "id": 1781260671202, "x": 226.34375, "y": 718.40625, "w": 150, "h": 24, "label": "Field 32", "value": "" },
  { "id": 1781260673380, "x": 568.34375, "y": 722.40625, "w": 130, "h": 24, "label": "Field 33", "value": "" },
  { "id": 1781260676573, "x": 408.34375, "y": 750.40625, "w": 280, "h": 24, "label": "Field 34", "value": "" },
  { "id": 1781260679346, "x": 257.34375, "y": 768.40625, "w": 400, "h": 24, "label": "Field 35", "value": "" },
  { "id": 1781260683032, "x": 460.34375, "y": 1007.40625, "w": 220, "h": 24, "label": "Field 36", "value": "" }
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
