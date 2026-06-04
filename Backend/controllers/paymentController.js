const { getStripe } = require('../services/stripeService');
const User = require('../User');

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * POST /api/payments/create-intent
 * Body: { amount } — amount in smallest currency unit (paise for INR)
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = process.env.STRIPE_CURRENCY || 'inr' } = req.body;

    const amountPaise = Math.round(Number(amount));
    if (!amountPaise || amountPaise < 100) {
      return res.status(400).json({
        message: 'Invalid amount. Minimum charge is ₹1 (100 paise).',
      });
    }

    const user = await User.findByPk(req.user.id);
    const receiptEmail = user?.email && isValidEmail(user.email) ? user.email.trim() : undefined;

    const stripe = getStripe();
    const intentPayload = {
      amount: amountPaise,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: String(req.user.id),
      },
    };

    if (receiptEmail) {
      intentPayload.receipt_email = receiptEmail;
    }

    const paymentIntent = await stripe.paymentIntents.create(intentPayload);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerEmail: receiptEmail || null,
    });
  } catch (error) {
    console.error('Create PaymentIntent Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to create payment intent',
    });
  }
};

/**
 * GET /api/payments/config
 * Returns publishable key for frontend (safe to expose).
 */
exports.getStripeConfig = (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return res.status(503).json({
      message: 'Stripe publishable key is not configured on the server.',
    });
  }
  return res.json({
    publishableKey,
    currency: process.env.STRIPE_CURRENCY || 'inr',
  });
};
