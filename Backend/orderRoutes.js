const express = require('express');
const orderController = require('./orderController');
const auth = require('./auth');

const router = express.Router();

router.post('/', auth, orderController.createOrder);
router.get('/owner', auth, orderController.getOwnerOrders);
router.get('/owner/restaurant/:restaurantId', auth, orderController.getOwnerRestaurantOrders);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, orderController.updateOrderStatus);
router.patch('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;
