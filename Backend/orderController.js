const Order = require('./Order');
const OrderItem = require('./OrderItem');
const MenuItem = require('./MenuItem');
const Restaurant = require('./Restaurant');
const Delivery = require('./Delivery');
const User = require('./User');
const { getStripe } = require('./services/stripeService');
const { Op } = require('sequelize');

const DELIVERY_FEE = 40;
const GST_RATE = 0.05;

function calcGrandTotal(subtotal) {
  const gst = Math.round(Number(subtotal) * GST_RATE);
  return Number(subtotal) + DELIVERY_FEE + gst;
}

const orderController = {
  createOrder: async (req, res) => {
    try {
      const {
        restaurant_id,
        items,
        delivery_address,
        special_instructions,
        payment_method,
        stripe_payment_intent_id,
      } = req.body;

      let subtotal = 0;
      for (const item of items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id);
        if (!menuItem) {
          return res.status(404).json({ message: `Menu item ${item.menu_item_id} not found` });
        }
        subtotal += Number(menuItem.price) * item.quantity;
      }

      const grandTotal = calcGrandTotal(subtotal);
      let paymentStatus = 'pending';
      let resolvedPaymentMethod = payment_method || 'cash';

      if (payment_method === 'stripe') {
        if (!stripe_payment_intent_id) {
          return res.status(400).json({ message: 'Stripe payment intent is required' });
        }

        const stripe = getStripe();
        const intent = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);

        if (intent.status !== 'succeeded') {
          return res.status(400).json({
            message: `Payment not completed (status: ${intent.status})`,
          });
        }

        const expectedPaise = Math.round(grandTotal * 100);
        if (intent.amount !== expectedPaise) {
          return res.status(400).json({ message: 'Payment amount does not match order total' });
        }

        paymentStatus = 'completed';
        resolvedPaymentMethod = 'stripe';
      }

      const orderNumber = `ORD-${Date.now()}`;
      const order = await Order.create({
        user_id: req.user.id,
        restaurant_id: Number(restaurant_id),
        order_number: orderNumber,
        total_price: grandTotal,
        delivery_address,
        special_instructions,
        payment_method: resolvedPaymentMethod,
        payment_status: paymentStatus,
        stripe_payment_intent_id: stripe_payment_intent_id || null,
        status: payment_method === 'stripe' ? 'confirmed' : 'pending',
      });

      for (const item of items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id);
        await OrderItem.create({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: menuItem.price,
        });
      }

      res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: OrderItem, as: 'items' },
          {
            model: Delivery,
            as: 'delivery',
            include: [{ model: User, as: 'partner', attributes: ['id', 'name', 'phone'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOwnerOrders: async (req, res) => {
    try {
      const ownerId = Number(req.user.id);
      const restaurants = await Restaurant.findAll({
        where: { owner_id: ownerId },
        attributes: ['id', 'name'],
      });

      if (!restaurants.length) {
        return res.json([]);
      }

      const restaurantIds = restaurants.map((r) => r.id);
      const orders = await Order.findAll({
        where: { restaurant_id: { [Op.in]: restaurantIds } },
        include: [
          { model: OrderItem, as: 'items' },
          { model: Restaurant, attributes: ['id', 'name'] },
          {
            model: Delivery,
            as: 'delivery',
            include: [{ model: User, as: 'partner', attributes: ['id', 'name', 'phone'] }],
          },
          { model: User, as: 'customer', attributes: ['id', 'name', 'phone', 'email'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(orders);
    } catch (error) {
      console.error('getOwnerOrders error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getOwnerRestaurantOrders: async (req, res) => {
    try {
      const restaurantId = Number(req.params.restaurantId);
      const restaurant = await Restaurant.findByPk(restaurantId);

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      if (Number(restaurant.owner_id) !== Number(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view these orders' });
      }

      const orders = await Order.findAll({
        where: { restaurant_id: restaurantId },
        include: [
          { model: OrderItem, as: 'items' },
          { model: Restaurant, attributes: ['id', 'name'] },
          {
            model: Delivery,
            as: 'delivery',
            include: [{ model: User, as: 'partner', attributes: ['id', 'name', 'phone'] }],
          },
          { model: User, as: 'customer', attributes: ['id', 'name', 'phone', 'email'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [{ model: OrderItem, as: 'items' }],
      });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const restaurant = await Restaurant.findByPk(order.restaurant_id);
      const isOwner = restaurant && Number(restaurant.owner_id) === Number(req.user.id);
      const isAdmin = req.user.role === 'admin';

      if (order.user_id !== req.user.id && !isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      order.status = status;
      await order.save();

      const updated = await Order.findByPk(order.id, {
        include: [
          { model: OrderItem, as: 'items' },
          {
            model: Delivery,
            as: 'delivery',
            include: [{ model: User, as: 'partner', attributes: ['id', 'name', 'phone'] }],
          },
        ],
      });

      res.json({ message: 'Order status updated', order: updated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (['delivered', 'cancelled'].includes(order.status)) {
        return res.status(400).json({ message: `Cannot cancel order in ${order.status} status` });
      }

      order.status = 'cancelled';
      await order.save();

      res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = orderController;
