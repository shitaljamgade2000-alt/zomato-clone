import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PhoneLogin from './PhoneLogin';
import OtpVerification from './OtpVerification';
import EmailLogin from './EmailLogin';
import EmailOtpVerification from './EmailOtpVerification';
import RegisterForm from './RegisterForm';
import './LoginModal.css';

const STEPS = {
  PHONE_LOGIN: 'phone_login',
  PHONE_OTP: 'phone_otp',
  EMAIL_LOGIN: 'email_login',
  EMAIL_OTP: 'email_otp',
  REGISTER: 'register',
};

export default function LoginModal({ onClose, onSuccess }) {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(STEPS.PHONE_LOGIN);
  const [phoneData, setPhoneData] = useState(null);
  const [emailData, setEmailData] = useState(null);
  const [error, setError] = useState('');

  const handlePhoneOtpSent = (data) => {
    setPhoneData(data);
    setStep(STEPS.PHONE_OTP);
    setError('');
  };

  const handlePhoneOtpSuccess = (data) => {
    if (data.user) {
      // Existing user logged in
      onSuccess?.();
      onClose();
    } else if (data.isNewUser) {
      // New user - show registration form
      setStep(STEPS.REGISTER);
    }
  };

  const handleEmailOtpSent = (data) => {
    setEmailData(data);
    setStep(STEPS.EMAIL_OTP);
    setError('');
  };

  const handleEmailOtpSuccess = (data) => {
    if (data.user) {
      onSuccess?.();
      onClose();
    } else if (data.isNewUser) {
      setStep(STEPS.REGISTER);
    }
  };

  const handleRegistrationSuccess = (data) => {
    onSuccess?.();
    onClose();
  };

  const handleChangePhone = () => {
    setStep(STEPS.PHONE_LOGIN);
    setPhoneData(null);
    setError('');
  };

  const handleChangeEmail = () => {
    setStep(STEPS.EMAIL_LOGIN);
    setEmailData(null);
    setError('');
  };

  const handleBackToPhone = () => {
    setStep(STEPS.PHONE_LOGIN);
    setPhoneData(null);
    setEmailData(null);
    setError('');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h1 className="modal-logo">🍽️ Zomato</h1>
          <p className="modal-subtitle">Discover the best food near you</p>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-content">
          {step === STEPS.PHONE_LOGIN && (
            <PhoneLogin
              onOtpSent={handlePhoneOtpSent}
              onError={setError}
            />
          )}

          {step === STEPS.PHONE_OTP && phoneData && (
            <OtpVerification
              phone={phoneData.phone}
              countryCode={phoneData.countryCode}
              onSuccess={handlePhoneOtpSuccess}
              onChangePhone={handleChangePhone}
              onError={setError}
            />
          )}

          {step === STEPS.EMAIL_LOGIN && (
            <EmailLogin
              onOtpSent={handleEmailOtpSent}
              onError={setError}
              onBackToPhone={handleBackToPhone}
            />
          )}

          {step === STEPS.EMAIL_OTP && emailData && (
            <EmailOtpVerification
              email={emailData.email}
              onSuccess={handleEmailOtpSuccess}
              onChangeEmail={handleChangeEmail}
              onError={setError}
            />
          )}

          {step === STEPS.REGISTER && (
            <RegisterForm
              phone={phoneData?.phone || emailData?.email}
              email={emailData?.email}
              isPhoneVerified={!!phoneData}
              onSuccess={handleRegistrationSuccess}
              onError={setError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
