import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './OtpVerification.css';

export default function OtpVerification({ phone, countryCode = '+91', onSuccess, onChangePhone, onError }) {
  const { verifyPhoneOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const numValue = value.replace(/\D/g, '');

    if (numValue.length > 1) {
      // Handle paste
      const pastedOtp = numValue.slice(0, 6 - index);
      const newOtp = [...otp];
      for (let i = 0; i < pastedOtp.length; i++) {
        newOtp[index + i] = pastedOtp[i];
      }
      setOtp(newOtp);

      // Focus on next empty or last input
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (numValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'Enter') {
      handleVerifyOTP(e);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setLocalError('Please enter all 6 digits');
      onError?.('Invalid OTP');
      return;
    }

    try {
      setLoading(true);
      setLocalError('');
      const response = await verifyPhoneOTP(phone, otpString);

      if (response.success) {
        onSuccess?.(response.data);
      }
    } catch (err) {
      setLocalError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setLocalError('');
      
      // Call resend endpoint
      // await authContext.resendPhoneOTP(phone, countryCode);
      
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setLocalError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification">
      <div className="otp-header">
        <h2>Verify with OTP</h2>
        <p>
          We sent an OTP to {countryCode}
          {phone}
        </p>
      </div>

      <form onSubmit={handleVerifyOTP}>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength="1"
              className="otp-input"
              disabled={loading}
              inputMode="numeric"
            />
          ))}
        </div>

        {localError && <div className="form-error">{localError}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="otp-footer">
          <div className="timer">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                className="resend-btn"
                disabled={loading}
              >
                Resend OTP
              </button>
            ) : (
              <span className="countdown">Resend OTP in {timer}s</span>
            )}
          </div>

          <button
            type="button"
            onClick={onChangePhone}
            className="change-phone-btn"
            disabled={loading}
          >
            Change Phone Number
          </button>
        </div>
      </form>
    </div>
  );
}
