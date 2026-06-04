const User = require('./User');

const userController = {
  getDeliveryPartners: async (req, res) => {
    try {
      const partners = await User.findAll({
        where: { role: 'delivery_partner' },
        attributes: ['id', 'name', 'email', 'phone'],
        order: [['name', 'ASC']],
      });
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
