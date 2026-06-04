const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn(
    '⚠ STRIPE_SECRET_KEY is not set. Stripe payments will fail until you add test keys to Backend/.env'
  );
}

const stripe = secretKey ? new Stripe(secretKey) : null;

function getStripe() {
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in Backend/.env');
  }
  return stripe;
}

module.exports = { getStripe };
