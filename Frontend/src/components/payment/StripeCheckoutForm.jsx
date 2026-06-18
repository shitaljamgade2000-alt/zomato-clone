import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
export default function StripeCheckoutForm({ amountLabel, onSuccess, onBack, disabled, customerEmail }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();

    if (processing) return;
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const confirmParams = {};
    if (customerEmail) {
      confirmParams.payment_method_data = {
        billing_details: { email: customerEmail },
      };
    }

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams,
    });

    setProcessing(false);

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
      return;
    }

    setError('Payment was not completed. Please try again.');
  };

  return (
    <form onSubmit={handlePay}>
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: '0.8rem',
          marginBottom: 14,
          color: '#166534',
        }}
      >
        <strong>Test mode:</strong> use card <code>4242 4242 4242 4242</code>, any future expiry,
        any CVC, any ZIP.
      </div>
      <PaymentElement
        options={{
          wallets: { link: 'never' },
          fields: {
            billingDetails: {
              email: customerEmail ? 'never' : 'auto',
            },
          },
        }}
      />
      {error && <div className="field-error" style={{ marginTop: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" className="nav-btn nav-btn-ghost" onClick={onBack} disabled={processing}>
          ← Back
        </button>
        <button
          className="auth-btn"
          type="submit"
          disabled={!stripe || processing || disabled}
          style={{ flex: 1 }}
        >
          {processing ? 'Processing...' : `Pay ${amountLabel}`}
        </button>
      </div>
    </form>
  );
}
