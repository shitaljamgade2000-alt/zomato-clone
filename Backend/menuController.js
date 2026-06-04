const MenuItem = require('./MenuItem');

const menuController = {
  createMenuItem: async (req, res) => {
    try {
      const { restaurant_id, name, description, price, category, vegetarian } = req.body;

      const menuItem = await MenuItem.create({
        restaurant_id,
        name,
        description,
        price,
        category,
        vegetarian: vegetarian || false,

      });

      res.status(201).json({ message: 'Menu item created successfully', menuItem });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMenuItems: async (req, res) => {
    try {
      const { restaurant_id } = req.query;
      const where = {};

      if (restaurant_id) {
        where.restaurant_id = restaurant_id;
      }

      const menuItems = await MenuItem.findAll({ where });
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMenuItemById: async (req, res) => {
    try {
      const menuItem = await MenuItem.findByPk(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateMenuItem: async (req, res) => {
    try {
      const menuItem = await MenuItem.findByPk(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      await menuItem.update(req.body);
      res.json({ message: 'Menu item updated successfully', menuItem });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteMenuItem: async (req, res) => {
    try {
      const menuItem = await MenuItem.findByPk(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      await menuItem.destroy();
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  toggleAvailability: async (req, res) => {
    try {
      const menuItem = await MenuItem.findByPk(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      menuItem.availability = !menuItem.availability;
      await menuItem.save();

      res.json({ message: 'Availability updated', menuItem });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = menuController;
