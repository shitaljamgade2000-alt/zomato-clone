import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RegisterForm.css';

export default function RegisterForm({ phone, email, isPhoneVerified, onSuccess, onError }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: email || '',
    phone: phone || '',
    confirmEmail: email || '',
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validateForm()) {
      onError?.('Please fix the errors');
      return;
    }

    try {
      setLoading(true);
      const response = await register(
        formData.name,
        formData.email,
        formData.phone
      );

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

  return (
    <div className="register-form">
      <div className="register-header">
        <h2>Complete Your Profile</h2>
        <p>Help us know you better</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`form-input ${errors.name ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`form-input ${errors.email ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Email *</label>
          <input
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleChange}
            placeholder="Confirm your email"
            className={`form-input ${errors.confirmEmail ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.confirmEmail && (
            <div className="form-error">{errors.confirmEmail}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Phone (Read Only)</label>
          <input
            type="tel"
            value={formData.phone}
            className="form-input read-only"
            disabled
          />
        </div>

        {localError && <div className="form-error">{localError}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
