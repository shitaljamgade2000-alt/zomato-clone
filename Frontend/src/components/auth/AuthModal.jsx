import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { useDispatch } from 'react-redux';
import { login as loginThunk, register as registerThunk } from '../../features/auth/authSlice';
import { loginSchema, signupSchema } from '../../utils/validationSchemas';
import { ROLES } from '../../utils/constants';
import FormField from '../common/FormField';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ onClose, onSuccess, initialTab = 'login', initialRole = 'customer' }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(initialTab);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    setTab(initialTab);
    setApiError('');
  }, [initialTab, initialRole]);

  const isPartnerSignup = tab === 'signup' && initialRole === ROLES.OWNER;

  const role = JSON.parse(localStorage.getItem('zomato_auth'))?.role;

  // const handleLogin = async (values, { setSubmitting }) => {
  //   setApiError('');
  //   try {
  //     await dispatch(loginThunk({ email: values.email, password: values.password })).unwrap();
  //     onSuccess?.();
  //     onClose();
  //     if(role === "restaurant_owner"){
  //       alert("Logged in as restaurant owner")
  //       navigate('/owner')
  //     }else if(role === "delivery_partner"){
  //       navigate('/driver')
  //     }else if(role === "customer"){
  //       navigate('/')
  //     }
  //     // navigate('/')
  //   } catch (err) {
  //     setApiError(err?.message || 'Login failed');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleLogin = async (values, { setSubmitting }) => {
  setApiError('');

  try {
    const user = await dispatch(
      loginThunk({
        email: values.email,
        password: values.password,
      })
    ).unwrap();

    console.log(user);

    onSuccess?.();
    onClose();

    if (user?.user?.role === 'restaurant_owner') {
      navigate('/owner');
    } else if (user?.user?.role === 'delivery_partner') {
      navigate('/delivery');
    } else {
      navigate('/');
    }
  } catch (err) {
    setApiError(err?.message || 'Login failed');
  } finally {
    setSubmitting(false);
  }
};

  const handleSignup = async (values, { setSubmitting }) => {
    setApiError('');
    try {
      await dispatch(registerThunk({
        name: values.name,
        email: values.email,
        password: values.password,
        role: initialRole || 'customer',
      })).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      setApiError(err?.message || 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-card">
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="auth-logo">🍽️ Zomato</div>
        <div className="auth-subtitle">
          {tab === 'login'
            ? 'Log in to your account'
            : isPartnerSignup
              ? 'Register your restaurant on Zomato'
              : 'Create your Zomato account'}
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => {
              setTab('login');
              setApiError('');
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => {
              setTab('signup');
              setApiError('');
            }}
          >
            Sign up
          </button>
        </div>

        {tab === 'login' ? (
          <Formik
            key="login-form"
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {(formik) => (
              <Form>
                <FormField label="Email" name="email" type="email" formik={formik} placeholder="you@example.com" />
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  formik={formik}
                  placeholder="Enter your password"
                />
                {apiError && <div className="field-error auth-form-error">{apiError}</div>}
                <button className="auth-btn" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? 'Logging in...' : 'Log in'}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            key="signup-form"
            initialValues={{
              name: '',
              email: '',
              password: '',
              acceptTerms: false,
            }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {(formik) => (
              <Form>
                {isPartnerSignup && (
                  <div className="auth-partner-note">
                    Signing up as a <strong>restaurant partner</strong>
                  </div>
                )}
                <FormField label="Full Name" name="name" formik={formik} placeholder="Rahul Sharma" />
                <FormField label="Email" name="email" type="email" formik={formik} placeholder="you@example.com" />
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  formik={formik}
                  placeholder="At least 6 characters"
                />
                <div className="input-group auth-checkbox-group">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formik.values.acceptTerms}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <span>
                      I agree to Zomato&apos;s{' '}
                      <button
                        type="button"
                        onClick={() => {}}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#e23744',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          font: 'inherit',
                        }}
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => {}}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#e23744',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          font: 'inherit',
                        }}
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                  {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                    <div className="field-error">{formik.errors.acceptTerms}</div>
                  )}
                </div>
                {apiError && <div className="field-error auth-form-error">{apiError}</div>}
                <button className="auth-btn" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? 'Creating account...' : 'Sign up'}
                </button>
              </Form>
            )}
          </Formik>
        )}

        <p className="auth-switch-hint">
          {tab === 'login' ? (
            <>
              New to Zomato?{' '}
              <button type="button" className="auth-link-btn" onClick={() => setTab('signup')}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="auth-link-btn" onClick={() => setTab('login')}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
