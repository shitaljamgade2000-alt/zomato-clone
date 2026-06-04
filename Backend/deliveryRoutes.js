const express = require('express');
const deliveryController = require('./deliveryController');
const auth = require('./auth');

const router = express.Router();

router.post('/assign', auth, deliveryController.assignDelivery);
router.get('/order/:order_id', deliveryController.getDeliveryStatus);
router.patch('/:id/status', auth, deliveryController.updateDeliveryStatus);
router.get('/partner/deliveries', auth, deliveryController.getDeliveriesByPartner);
router.post('/:id/rate', auth, deliveryController.rateDelivery);

module.exports = router;
