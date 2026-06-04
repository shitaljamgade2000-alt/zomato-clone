/**
 * Assign all restaurants to an owner account (for local testing).
 * Usage: node scripts/claimRestaurants.js your-owner@email.com
 */
require('dotenv').config();
const sequelize = require('../config');
const User = require('../User');
const Restaurant = require('../Restaurant');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/claimRestaurants.js <owner-email>');
    process.exit(1);
  }

  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }
  if (user.role !== 'restaurant_owner') {
    console.warn('Warning: user role is', user.role, '(expected restaurant_owner)');
  }

  const [count] = await Restaurant.update({ owner_id: user.id }, { where: {} });
  console.log(`Assigned ${count} restaurant(s) to ${user.name} (${email})`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
