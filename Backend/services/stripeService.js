// // // const Stripe = require('stripe');

// // // const secretKey = process.env.STRIPE_SECRET_KEY;

// // // if (!secretKey) {
// // //   console.warn(
// // //     '⚠ STRIPE_SECRET_KEY is not set. Stripe payments will fail until you add test keys to Backend/.env'
// // //   );
// // // }

// // // const stripe = secretKey ? new Stripe(secretKey) : null;

// // // function getStripe() {
// // //   if (!stripe) {
// // //     throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in Backend/.env');
// // //   }
// // //   return stripe;
// // // }

// // // module.exports = { getStripe };



// // const Stripe = require('stripe');
// // const connection = require('../config/db'); // your mysql connection

// // async function getStripe() {
// // const [rows] = await connection.query(
// // 'SELECT setting_value FROM app_settings WHERE setting_key = ?',
// // ['STRIPE_SECRET_KEY']
// // );

// // if (!rows.length) {
// // throw new Error('STRIPE_SECRET_KEY not found in database');
// // }

// // const stripeKey = rows[0].setting_value;

// // console.log("stripeKey",stripeKey)

// // return new Stripe(stripeKey);
// // }

// // module.exports = { getStripe };


// const Stripe = require('stripe');
// const connection = require('../config/db');

// async function getStripe() {
//   const [rows] = await connection.query(
//     'SELECT setting_value FROM app_settings WHERE setting_key = ?',
//     ['STRIPE_SECRET_KEY']
//   );

//   if (!rows.length) {
//     throw new Error('STRIPE_SECRET_KEY not found in database');
//   }

//   const stripeKey = rows[0].setting_value;

//   console.log('Stripe key loaded:', stripeKey.substring(0, 7));

//   return new Stripe(stripeKey);
// }

// module.exports = { getStripe };

// const Stripe = require('stripe');
// const sequelize = require('../config'); // adjust path to your config file

// async function getStripe() {
// const [rows] = await sequelize.query(
// "SELECT setting_value FROM app_settings WHERE setting_key = 'STRIPE_SECRET_KEY'"
// );

// if (!rows.length) {
// throw new Error('STRIPE_SECRET_KEY not found in database');
// }

// const stripeKey = rows[0].setting_value;

// return new Stripe(stripeKey);
// }

// module.exports = { getStripe };


// const Stripe = require('stripe');
// const sequelize = require('../config');

// async function getStripe() {
//   const [rows] = await sequelize.query(
//     "SELECT setting_value FROM app_settings WHERE setting_key = 'STRIPE_SECRET_KEY'"
//   );

//   console.log("Rows:", rows);

//   if (!rows.length) {
//     throw new Error('STRIPE_SECRET_KEY not found in database');
//   }

//   const stripeKey = rows[0].setting_value;

//   console.log("Stripe Key:", stripeKey);

//   const stripe = new Stripe(stripeKey);

//   console.log("Stripe Created");

//   return stripe;
// }

// module.exports = { getStripe };


const Stripe = require('stripe');
const sequelize = require('../config');

async function getStripe() {
  try {
    const [rows] = await sequelize.query(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'STRIPE_SECRET_KEY'"
    );

    if (!rows.length) {
      throw new Error('STRIPE_SECRET_KEY not found in database');
    }

    const stripeKey = rows[0].setting_value;

    console.log("Stripe Key Loaded");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log("Stripe Instance Created:", typeof stripe.paymentIntents);

    return stripe;

  } catch (err) {
    console.error("Stripe Init Error:", err);
    throw err;
  }
}

module.exports = { getStripe };