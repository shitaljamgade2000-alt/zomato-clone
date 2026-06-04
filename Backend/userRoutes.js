const express = require('express');
const userController = require('./userController');
const auth = require('./auth');

const router = express.Router();

router.get('/delivery-partners', auth, userController.getDeliveryPartners);

module.exports = router;
