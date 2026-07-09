import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_FIELDS = [
    { "id": 1781260553948, "x": 523.34375, "y": 212.40625, "w": 170, "h": 24, "label": "Field 1", "value": "" },
    { "id": 1781260560380, "x": 240.34375, "y": 343.40625, "w": 150, "h": 24, "label": "Field 2", "value": "" },
    { "id": 1781260563003, "x": 540.34375, "y": 343.40625, "w": 170, "h": 24, "label": "Field 3", "value": "" },
    { "id": 1781260581040, "x": 240.34375, "y": 372.40625, "w": 150, "h": 24, "label": "Field 4", "value": "" },
    { "id": 1781260586916, "x": 540.34375, "y": 372.40625, "w": 170, "h": 24, "label": "Field 5", "value": "" },
    { "id": 1781260595935, "x": 165.34375, "y": 405.40625, "w": 220, "h": 24, "label": "Field 6", "value": "" },
    { "id": 1781260601660, "x": 225.34375, "y": 500.40625, "w": 180, "h": 24, "label": "Field 7", "value": "" },
    { "id": 1781260604776, "x": 530.34375, "y": 500.40625, "w": 200, "h": 24, "label": "Field 8", "value": "" },
    { "id": 1781260605902, "x": 225.34375, "y": 560.40625, "w": 180, "h": 24, "label": "Field 9", "value": "" },
    { "id": 1781260608361, "x": 530.34375, "y": 560.40625, "w": 190, "h": 24, "label": "Field 10", "value": "" },
    { "id": 1781260610501, "x": 220.34375, "y": 620.40625, "w": 190, "h": 24, "label": "Field 11", "value": "" },
    { "id": 1781260612325, "x": 530.34375, "y": 620.40625, "w": 190, "h": 24, "label": "Field 12", "value": "" },
    { "id": 1781260610501, "x": 235.34375, "y": 680.40625, "w": 160, "h": 24, "label": "Field 13", "value": "" },
    { "id": 1781260612325, "x": 535.34375, "y": 680.40625, "w": 180, "h": 24, "label": "Field 14", "value": "" },
    { "id": 1781260613934, "x": 180.34375, "y": 745.40625, "w": 230, "h": 24, "label": "Field 15", "value": "" },
    { "id": 1781260615808, "x": 490.34375, "y": 745.40625, "w": 230, "h": 24, "label": "Field 16", "value": "" },
    { "id": 1781260613934, "x": 115.34375, "y": 775.40625, "w": 285, "h": 24, "label": "Field 17", "value": "" },
    { "id": 1781260615808, "x": 445.34375, "y": 775.40625, "w": 265, "h": 24, "label": "Field 18", "value": "" },
    { "id": 1781260619054, "x": 190.34375, "y": 835.40625, "w": 210, "h": 24, "label": "Field 19", "value": "" },
    { "id": 1781260623218, "x": 500.34375, "y": 835.40625, "w": 210, "h": 24, "label": "Field 20", "value": "" },
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
                    backgroundImage: "url('/pdfs/to-form-1.jpg')",
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
