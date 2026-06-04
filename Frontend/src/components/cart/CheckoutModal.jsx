import { useState } from 'react';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, clearCart } from '../../features/cart/cartSlice';
import { selectUser } from '../../features/auth/authSlice';
import { placeOrder as placeOrderThunk } from '../../features/orders/ordersSlice';
import {
  clearPayment,
  createPaymentIntent,
  selectPayment,
} from '../../features/payments/paymentSlice';
import { checkoutSchema } from '../../utils/validationSchemas';
import { calcOrderTotal, formatPrice } from '../../utils/formatters';
import FormField from '../common/FormField';
import StripeProvider from '../payment/StripeProvider';
import StripeCheckoutForm from '../payment/StripeCheckoutForm';

const PAYMENT_OPTIONS = [
  ['stripe', 'Pay with Card (Stripe)', '💳'],
  ['cash', 'Cash on Delivery', '💵'],
];

export default function CheckoutModal({ total, restaurantId, restaurantName, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const user = useSelector(selectUser);
  const payment = useSelector(selectPayment);
  const [step, setStep] = useState('form');
  const [orderResult, setOrderResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [pendingValues, setPendingValues] = useState(null);
  const totals = calcOrderTotal(total);

  const [checkoutData, setCheckoutData] = useState({
  delivery_address: user?.address || '',
  special_instructions: '',
  payment_method: 'stripe',
});

  const placeOrder = async (values, stripePaymentIntentId = null) => {
    const data = await dispatch(
      placeOrderThunk({
        restaurant_id: Number(restaurantId),
        items: cartItems.map((i) => ({
          menu_item_id: i.id,
          quantity: i.qty,
        })),
        delivery_address: values.delivery_address,
        special_instructions: values.special_instructions || '',
        payment_method: values.payment_method,
        stripe_payment_intent_id: stripePaymentIntentId,
      })
    ).unwrap();
    setOrderResult(data.order);
    dispatch(clearCart());
    dispatch(clearPayment());
    setStep('success');
  };

  // const handleCheckoutSubmit = async (values, { setSubmitting }) => {
  //   setApiError('');
  //   try {
  //     if (values.payment_method === 'cash') {
  //       await placeOrder(values);
  //       return;
  //     }

  //     setPendingValues(values);
  //     const amountPaise = Math.round(totals.grandTotal * 100);
  //     await dispatch(createPaymentIntent(amountPaise)).unwrap();
  //     setStep('stripe');
  //   } catch (err) {
  //     setApiError(err?.message || err || 'Checkout failed');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleCheckoutSubmit = async (values, { setSubmitting }) => {
  setApiError('');

  try {
    if (values.payment_method === 'cash') {
      await placeOrder(values);
      return;
    }

    setCheckoutData(values); // Persist form values
    setPendingValues(values);

    const amountPaise = Math.round(totals.grandTotal * 100);

    await dispatch(createPaymentIntent(amountPaise)).unwrap();

    setStep('stripe');
  } catch (err) {
    setApiError(err?.message || err || 'Checkout failed');
  } finally {
    setSubmitting(false);
  }
};

  const handleStripeSuccess = async (paymentIntentId) => {
    setApiError('');
    try {
      await placeOrder(pendingValues, paymentIntentId);
    } catch (err) {
      setApiError(err?.message || 'Order failed after payment');
    }
  };

  if (step === 'success') {
    return (
      <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onSuccess()}>
        <div className="checkout-card">
          <div className="success-icon">🎉</div>
          <div className="success-title">Order Placed!</div>
          <div className="success-sub">
            Your food from {restaurantName} is being prepared.
            <br />
            Order #{orderResult?.order_number}
          </div>
          <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
              <span style={{ color: '#686b78' }}>Amount</span>
              <strong>{formatPrice(orderResult?.total_price || totals.grandTotal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: '#686b78' }}>Payment</span>
              <strong>{orderResult?.payment_method === 'stripe' ? 'Stripe (paid)' : 'Cash on delivery'}</strong>
            </div>
          </div>
          <button type="button" className="auth-btn" onClick={onSuccess}>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (step === 'stripe') {
    return (
      <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="checkout-card">
          <button type="button" className="auth-close" onClick={onClose}>
            ✕
          </button>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>
            Secure Payment
          </div>
          <p style={{ fontSize: '0.85rem', color: '#686b78', marginBottom: 16 }}>
            Pay {formatPrice(totals.grandTotal)} with Stripe test card
          </p>
          {payment.error && <div className="field-error" style={{ marginBottom: 12 }}>{payment.error}</div>}
          {apiError && <div className="field-error" style={{ marginBottom: 12 }}>{apiError}</div>}
          <StripeProvider clientSecret={payment.clientSecret}>
            <StripeCheckoutForm
              amountLabel={formatPrice(totals.grandTotal)}
              customerEmail={user?.email}
              onSuccess={handleStripeSuccess}
              onBack={() => {
                dispatch(clearPayment());
                setStep('form');
              }}
            />
          </StripeProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="checkout-card">
        <button type="button" className="auth-close" onClick={onClose}>
          ✕
        </button>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>
          Checkout
        </div>

        <Formik
          // initialValues={{
          //   delivery_address: user?.address || '',
          //   special_instructions: '',
          //   payment_method: 'stripe',
          // }}
          initialValues={checkoutData}
          validationSchema={checkoutSchema}
          onSubmit={handleCheckoutSubmit}
        >
          {(formik) => (
            <Form>
              <FormField
                label="Delivery Address"
                name="delivery_address"
                formik={formik}
                as="textarea"
                rows={2}
                placeholder="House no, street, city, pincode"
              />
              <FormField
                label="Special Instructions (optional)"
                name="special_instructions"
                formik={formik}
                as="textarea"
                rows={2}
              />
              <div className="input-group">
                <span className="input-label">Payment Method</span>
                {PAYMENT_OPTIONS.map(([val, label, icon]) => (
                  <label
                    key={val}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      border: `1.5px solid ${formik.values.payment_method === val ? '#e23744' : '#e9e9eb'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      marginBottom: 8,
                      background: formik.values.payment_method === val ? '#fff5f5' : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={val}
                      checked={formik.values.payment_method === val}
                      onChange={formik.handleChange}
                      style={{ accentColor: '#e23744' }}
                    />
                    <span>{icon}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
                  </label>
                ))}
                {formik.touched.payment_method && formik.errors.payment_method && (
                  <div className="field-error">{formik.errors.payment_method}</div>
                )}
              </div>
              <div style={{ background: '#fafafa', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div className="cart-total-row">
                  <span>Item Total</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="cart-total-row">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(totals.delivery)}</span>
                </div>
                <div className="cart-total-row">
                  <span>GST (5%)</span>
                  <span>{formatPrice(totals.gst)}</span>
                </div>
                <div className="cart-total-row big">
                  <span>Grand Total</span>
                  <span>{formatPrice(totals.grandTotal)}</span>
                </div>
              </div>
              {apiError && <div className="field-error" style={{ marginBottom: 12 }}>{apiError}</div>}
              <button className="auth-btn" type="submit" disabled={formik.isSubmitting || payment.loading}>
                {formik.isSubmitting || payment.loading
                  ? 'Please wait...'
                  : formik.values.payment_method === 'stripe'
                    ? `Continue to Pay • ${formatPrice(totals.grandTotal)}`
                    : `Place Order • ${formatPrice(totals.grandTotal)}`}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
