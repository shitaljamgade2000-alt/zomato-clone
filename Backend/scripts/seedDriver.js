/**
 * Creates test delivery partner: driver@test.com / driver123
 * Run: node scripts/seedDriver.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config');
const User = require('../User');

async function main() {
  await sequelize.authenticate();
  const email = 'driver@test.com';
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('Delivery partner already exists:', email);
    process.exit(0);
  }
  const password = await bcrypt.hash('driver123', 10);
  await User.create({
    name: 'Test Driver',
    email,
    password,
    phone: '9876543210',
    role: 'delivery_partner',
  });
  console.log('Created delivery partner:', email, '/ password: driver123');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
