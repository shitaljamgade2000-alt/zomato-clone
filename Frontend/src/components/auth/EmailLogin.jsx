import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EmailLogin.css';

export default function EmailLogin({ onOtpSent, onError, onBackToPhone }) {
  const { sendEmailOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setLocalError('');
  };

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      onError?.('Invalid email address');
      return;
    }

    try {
      setLoading(true);
      await sendEmailOTP(email);
      onOtpSent?.({ email, type: 'email' });
    } catch (err) {
      setLocalError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-login">
      <form onSubmit={handleSendOTP}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
            className="email-input"
            disabled={loading}
            autoFocus
          />
          {localError && <div className="form-error">{localError}</div>}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !validateEmail(email)}
        >
          {loading ? 'Sending OTP...' : 'Send Email OTP'}
        </button>

        <div className="divider">OR</div>

        <button
          type="button"
          className="btn-secondary"
          onClick={onBackToPhone}
          disabled={loading}
        >
          Back to Phone Login
        </button>

        <p className="terms-text">
          By proceeding, you agree to our <a href="#terms">Terms of Service</a> and{' '}
          <a href="#privacy">Privacy Policy</a>
        </p>
      </form>
    </div>
  );
}
