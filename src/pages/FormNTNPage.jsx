import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_FIELDS = [
    { "id": 1781260553948, "x": 270.34375, "y": 325.40625, "w": 365, "h": 24, "label": "Field 1", "value": "" },
    { "id": 1781260560380, "x": 275.34375, "y": 385.40625, "w": 365, "h": 24, "label": "Field 2", "value": "" },
    { "id": 1781260563003, "x": 275.34375, "y": 446.40625, "w": 365, "h": 24, "label": "Field 3", "value": "" },
    { "id": 1781260581040, "x": 277.34375, "y": 507.40625, "w": 368, "h": 24, "label": "Field 4", "value": "" },
    { "id": 1781260586916, "x": 277.34375, "y": 567.40625, "w": 368, "h": 24, "label": "Field 5", "value": "" },
    { "id": 1781260595935, "x": 350.34375, "y": 780.40625, "w": 260, "h": 24, "label": "Field 6", "value": "" },
    { "id": 1781260601660, "x": 130.34375, "y": 810.40625, "w": 110, "h": 24, "label": "Field 7", "value": "" },
];

export default function FormNTNPage() {
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
                    backgroundImage: "url('/pdfs/ntn.jpg')",
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
