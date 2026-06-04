async function ensureStripeSchema(sequelize) {
  const dbName = process.env.DB_NAME || 'zomato_db';

  const [cols] = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'stripe_payment_intent_id'`,
    { replacements: [dbName] }
  );

  if (!cols.length) {
    await sequelize.query(
      'ALTER TABLE orders ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL'
    );
    console.log('✓ Added orders.stripe_payment_intent_id column');
  }

  try {
    await sequelize.query(
      `ALTER TABLE orders MODIFY payment_method ENUM('cash', 'card', 'upi', 'wallet', 'stripe') DEFAULT 'cash'`
    );
  } catch (err) {
    if (!String(err.message).includes('Duplicate')) {
      console.warn('payment_method enum update:', err.message);
    }
  }
}

module.exports = { ensureStripeSchema };
