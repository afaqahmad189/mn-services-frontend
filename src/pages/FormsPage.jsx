import { useNavigate } from 'react-router-dom';

export default function FormsPage() {
  const navigate = useNavigate();

  const forms = [
    { title: 'TO Form', path: '/forms/to' },
    { title: 'NTN Form', path: '/' },
    { title: 'F Form', path: '/forms/f' },
    { title: 'Smartcard Form', path: '/forms/smartcard' }
  ];

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '800px' }}>
        <div className="login-logo">
          <div className="login-logo-icon">PDF</div>
          <h1>Select Form</h1>
          <p>Choose a form to edit</p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '20px',
          }}
        >
          {forms.map(form => (
            <div
              key={form.title}
              className="card"
              style={{
                padding: '24px',
                cursor: 'pointer',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '10px'
              }}
              onClick={() => navigate(form.path)}
            >
              <h3>{form.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}