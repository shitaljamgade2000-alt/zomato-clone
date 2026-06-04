import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PhoneLogin.css';

const countryCodesData = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+86', country: 'China' },
];

export default function PhoneLogin({ onOtpSent, onError }) {
  const { sendPhoneOTP } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    setLocalError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!phone || phone.length !== 10) {
      setLocalError('Please enter a valid 10-digit phone number');
      onError?.('Invalid phone number');
      return;
    }

    try {
      setLoading(true);
      await sendPhoneOTP(phone, countryCode);
      onOtpSent?.({ phone, countryCode, type: 'phone' });
    } catch (err) {
      setLocalError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-login">
      <form onSubmit={handleSendOTP}>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div className="phone-input-wrapper">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="country-code-select"
              disabled={loading}
            >
              {countryCodesData.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} {item.country}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="9876543210"
              className="phone-input"
              maxLength="10"
              disabled={loading}
              autoFocus
            />
          </div>
          {localError && <div className="form-error">{localError}</div>}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || phone.length !== 10}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>

        <div className="divider">OR</div>

        <button
          type="button"
          className="btn-secondary"
          disabled={loading}
          onClick={() => onOtpSent?.({ type: 'email' })}
        >
          Continue with Email
        </button>

        <p className="terms-text">
          By proceeding, you agree to our <a href="#terms">Terms of Service</a> and{' '}
          <a href="#privacy">Privacy Policy</a>
        </p>
      </form>
    </div>
  );
}
