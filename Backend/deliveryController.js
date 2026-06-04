const Delivery = require('./Delivery');
const Order = require('./Order');
const Restaurant = require('./Restaurant');
const User = require('./User');

const ORDER_STATUS_BY_DELIVERY = {
  assigned: 'ready',
  picked_up: 'picked_up',
  in_transit: 'picked_up',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

async function assertOwnerCanManageOrder(req, order) {
  const restaurant = await Restaurant.findByPk(order.restaurant_id);
  if (!restaurant) {
    return { ok: false, status: 404, message: 'Restaurant not found' };
  }
  if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
    return { ok: false, status: 403, message: 'Not authorized for this order' };
  }
  return { ok: true, restaurant };
}

const deliveryController = {
  assignDelivery: async (req, res) => {
    try {
      const { order_id, delivery_partner_id, estimated_time } = req.body;

      const order = await Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const authCheck = await assertOwnerCanManageOrder(req, order);
      if (!authCheck.ok) {
        return res.status(authCheck.status).json({ message: authCheck.message });
      }

      if (!['ready', 'preparing', 'confirmed', 'pending'].includes(order.status)) {
        return res.status(400).json({
          message: `Cannot assign driver when order status is ${order.status}`,
        });
      }

      const partner = await User.findByPk(delivery_partner_id);
      if (!partner || partner.role !== 'delivery_partner') {
        return res.status(400).json({ message: 'Invalid delivery partner' });
      }

      let delivery = await Delivery.findOne({ where: { order_id } });

      if (delivery) {
        delivery.delivery_partner_id = delivery_partner_id;
        delivery.status = 'assigned';
        delivery.estimated_time = estimated_time || delivery.estimated_time;
        await delivery.save();
      } else {
        delivery = await Delivery.create({
          order_id,
          delivery_partner_id,
          status: 'assigned',
          estimated_time: estimated_time || null,
        });
      }

      if (order.status !== 'ready') {
        order.status = 'ready';
        await order.save();
      }

      const fullDelivery = await Delivery.findByPk(delivery.id, {
        include: [
          { model: Order, as: 'order' },
          { model: User, as: 'partner', attributes: ['id', 'name', 'phone'] },
        ],
      });

      res.json({ message: 'Delivery partner assigned', delivery: fullDelivery });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDeliveryStatus: async (req, res) => {
    try {
      const delivery = await Delivery.findOne({
        where: { order_id: req.params.order_id },
        include: [
          { model: Order, as: 'order' },
          { model: User, as: 'partner', attributes: ['id', 'name', 'phone'] },
        ],
      });

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }

      res.json(delivery);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateDeliveryStatus: async (req, res) => {
    try {
      const { status, latitude, longitude } = req.body;
      const delivery = await Delivery.findByPk(req.params.id, {
        include: [{ model: Order, as: 'order' }],
      });

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }

      const validStatuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const isPartner = delivery.delivery_partner_id === req.user.id;
      const isAdmin = req.user.role === 'admin';
      let isOwner = false;

      if (delivery.order) {
        const restaurant = await Restaurant.findByPk(delivery.order.restaurant_id);
        isOwner = restaurant && restaurant.owner_id === req.user.id;
      }

      if (!isPartner && !isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (isPartner) {
        const partnerAllowed = ['picked_up', 'in_transit', 'delivered'];
        if (!partnerAllowed.includes(status)) {
          return res.status(403).json({ message: 'Partners can only mark picked up, in transit, or delivered' });
        }
      }

      delivery.status = status;
      if (latitude) delivery.latitude = latitude;
      if (longitude) delivery.longitude = longitude;

      if (status === 'delivered') {
        delivery.actual_delivery_time = new Date();
      }

      await delivery.save();

      const order = await Order.findByPk(delivery.order_id);
      if (order && ORDER_STATUS_BY_DELIVERY[status]) {
        order.status = ORDER_STATUS_BY_DELIVERY[status];
        await order.save();
      }

      const updated = await Delivery.findByPk(delivery.id, {
        include: [
          { model: Order, as: 'order' },
          { model: User, as: 'partner', attributes: ['id', 'name', 'phone'] },
        ],
      });

      res.json({ message: 'Delivery status updated', delivery: updated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDeliveriesByPartner: async (req, res) => {
    try {
      const deliveries = await Delivery.findAll({
        where: { delivery_partner_id: req.user.id },
        include: [
          {
            model: Order,
            as: 'order',
            include: [{ model: Restaurant, attributes: ['id', 'name', 'address'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  rateDelivery: async (req, res) => {
    try {
      const { rating, review } = req.body;
      const delivery = await Delivery.findByPk(req.params.id);

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      delivery.delivery_rating = rating;
      delivery.delivery_review = review;
      await delivery.save();

      res.json({ message: 'Delivery rated successfully', delivery });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = deliveryController;
