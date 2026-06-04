const Restaurant = require('./Restaurant');
const User = require('./User');

const restaurantController = {
  createRestaurant: async (req, res) => {
    try {
      const { name, description, cuisine, address, phone, email, opening_time, closing_time } = req.body;
      // const image = req.file
      //   ? `/uploads/restaurants/${req.file.filename}`
      //   : null;

      const restaurant = await Restaurant.create({
        name,
        description,
        cuisine,
        address,
        owner_id: req.user.id,
        phone,
        email,
        opening_time,
        closing_time,
        // image,
      });

      res.status(201).json({ message: 'Restaurant created successfully', restaurant });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getRestaurantById: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      if (restaurant.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this restaurant' });
      }

      await restaurant.update(req.body);
      res.json({ message: 'Restaurant updated successfully', restaurant });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      if (restaurant.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
      }

      await restaurant.destroy();
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMyRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        where: { owner_id: req.user.id },
      });
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = restaurantController;
