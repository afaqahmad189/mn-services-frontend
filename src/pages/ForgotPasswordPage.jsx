import React, { useState } from 'react';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">MN</div>
          <h1>Forgot Password?</h1>
          <p>Enter your email to reset your account password</p>
        </div>

        {sent ? (
          <div className="alert-banner success" style={{ marginBottom: '24px' }}>
            ✅ If an account exists with that email, a reset link has been sent.
            <button className="btn btn-primary w-full mt-4" onClick={() => navigate('/login')}>Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label required">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                placeholder="name@company.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? '🔄 Sending...' : '📧 Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="button" className="btn-link" onClick={() => navigate('/login')}>Back to Login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
