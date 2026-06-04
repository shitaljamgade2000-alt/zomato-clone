import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '../../services/apiClient';
import Loading from '../common/Loading';

let stripePromiseCache = null;

async function getStripePromise() {
  if (stripePromiseCache) return stripePromiseCache;

  const envKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (envKey) {
    stripePromiseCache = loadStripe(envKey);
    return stripePromiseCache;
  }

  const config = await apiRequest('/payments/config');
  stripePromiseCache = loadStripe(config.publishableKey);
  return stripePromiseCache;
}

export default function StripeProvider({ clientSecret, children }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStripePromise()
      .then(setStripePromise)
      .catch((e) => setError(e.message || 'Failed to load Stripe'));
  }, []);

  if (error) {
    return <div className="field-error">{error}</div>;
  }

  if (!stripePromise || !clientSecret) {
    return <Loading label="Loading payment form..." />;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe', variables: { colorPrimary: '#e23744' } },
      }}
    >
      {children}
    </Elements>
  );
}
