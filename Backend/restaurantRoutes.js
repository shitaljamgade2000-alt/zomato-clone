const express = require('express');
const restaurantController = require('./restaurantController');
const auth = require('./auth');

const router = express.Router();

router.post('/', auth, restaurantController.createRestaurant);
router.get('/', restaurantController.getRestaurants);
router.get('/my-restaurants', auth, restaurantController.getMyRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/:id', auth, restaurantController.updateRestaurant);
router.delete('/:id', auth, restaurantController.deleteRestaurant);

module.exports = router;
