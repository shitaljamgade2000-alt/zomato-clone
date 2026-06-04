const express = require('express');
const paymentController = require('./controllers/paymentController');
const auth = require('./auth');

const router = express.Router();

router.get('/config', paymentController.getStripeConfig);
router.post('/create-intent', auth, paymentController.createPaymentIntent);

module.exports = router;
