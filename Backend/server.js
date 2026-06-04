const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config');
const errorHandler = require('./errorHandler');
const { ensureStripeSchema } = require('./utils/ensureStripeSchema');

// Import routes
const authRoutes = require('./authRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');

// Import models
const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Delivery = require('./Delivery');

const app = express();
// const path = require('path');
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// app.use(
//   '/uploads',
//   express.static(path.join(__dirname, 'uploads'))
// );

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Zomato Backend API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Database and Server Initialization
const PORT = process.env.PORT || 5000;

const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ MySQL connection established');

    // Define associations
    Restaurant.belongsTo(User, { foreignKey: 'owner_id', targetKey: 'id' });
    MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', targetKey: 'id' });
    Order.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id', as: 'customer' });
    Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id', targetKey: 'id' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', targetKey: 'id' });
    Delivery.belongsTo(Order, { foreignKey: 'order_id', targetKey: 'id', as: 'order' });
    Delivery.belongsTo(User, { foreignKey: 'delivery_partner_id', targetKey: 'id', as: 'partner' });
    Order.hasOne(Delivery, { foreignKey: 'order_id', as: 'delivery' });

    await ensureStripeSchema(sequelize);
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synced');

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};

initializeDB();
