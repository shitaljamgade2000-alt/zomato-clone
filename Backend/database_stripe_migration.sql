-- Run once if the orders table already exists without Stripe support
ALTER TABLE orders
  MODIFY payment_method ENUM('cash', 'card', 'upi', 'wallet', 'stripe') DEFAULT 'cash';

ALTER TABLE orders
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL;
