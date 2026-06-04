# Zomato Clone Backend API

A comprehensive Express.js + MySQL backend for a Zomato clone application with full support for restaurants, menus, orders, and delivery management.

## Features

- **User Authentication**: JWT-based authentication with role support (customer, restaurant_owner, delivery_partner, admin)
- **Restaurant Management**: Create, update, and manage restaurant profiles
- **Menu Management**: Add and manage menu items with categories and pricing
- **Order System**: Complete order lifecycle from creation to delivery
- **Delivery Tracking**: Assign delivery partners and track real-time delivery status
- **Rating System**: Rate orders and deliveries

## Project Structure

```
Backend/
├── config.js              # Database configuration
├── server.js              # Main server entry point
├── .env                   # Environment variables
├── package.json           # Dependencies
│
├── Models:
├── User.js               # User model with auth methods
├── Restaurant.js         # Restaurant model
├── MenuItem.js           # Menu items
├── Order.js             # Orders
├── OrderItem.js         # Order line items
└── Delivery.js          # Delivery tracking
│
├── Controllers:
├── authController.js      # Authentication logic
├── restaurantController.js # Restaurant operations
├── menuController.js      # Menu operations
├── orderController.js     # Order operations
└── deliveryController.js  # Delivery operations
│
├── Routes:
├── authRoutes.js          # Auth endpoints
├── restaurantRoutes.js    # Restaurant endpoints
├── menuRoutes.js          # Menu endpoints
├── orderRoutes.js         # Order endpoints
└── deliveryRoutes.js      # Delivery endpoints
│
├── Middleware:
├── auth.js               # JWT authentication middleware
└── errorHandler.js       # Global error handler
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)

### Steps

1. **Install dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Create MySQL database**
   ```sql
   CREATE DATABASE zomato_db;
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and JWT secret

4. **Start the server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (auth required)
- `PUT /api/restaurants/:id` - Update restaurant (auth required)
- `DELETE /api/restaurants/:id` - Delete restaurant (auth required)
- `GET /api/restaurants/my-restaurants` - Get my restaurants (auth required)

### Menu Items
- `GET /api/menu` - Get all menu items (optional: ?restaurant_id=id)
- `GET /api/menu/:id` - Get menu item details
- `POST /api/menu` - Create menu item (auth required)
- `PUT /api/menu/:id` - Update menu item (auth required)
- `DELETE /api/menu/:id` - Delete menu item (auth required)
- `PATCH /api/menu/:id/toggle-availability` - Toggle item availability (auth required)

### Orders
- `GET /api/orders` - Get user's orders (auth required)
- `GET /api/orders/:id` - Get order details (auth required)
- `POST /api/orders` - Create new order (auth required)
- `PATCH /api/orders/:id/status` - Update order status (auth required)
- `PATCH /api/orders/:id/cancel` - Cancel order (auth required)

### Delivery
- `POST /api/delivery/assign` - Assign delivery partner (auth required)
- `GET /api/delivery/order/:order_id` - Get delivery status
- `PATCH /api/delivery/:id/status` - Update delivery status (auth required)
- `GET /api/delivery/partner/deliveries` - Get deliveries assigned to partner (auth required)
- `POST /api/delivery/:id/rate` - Rate delivery (auth required)

## Database Schema

### Users Table
- `id` - Primary Key
- `name` - User name
- `email` - User email (unique)
- `password` - Hashed password
- `phone` - Phone number
- `address` - Address
- `role` - User role (customer, restaurant_owner, delivery_partner, admin)
- `image` - Profile image URL

### Restaurants Table
- `id` - Primary Key
- `name` - Restaurant name
- `description` - Description
- `cuisine` - Cuisine type
- `rating` - Restaurant rating
- `address` - Restaurant address
- `owner_id` - Foreign Key to Users
- `image` - Restaurant image
- `phone` - Phone number
- `email` - Email address
- `opening_time` - Opening time
- `closing_time` - Closing time
- `status` - Status (active, inactive, closed)

### MenuItems Table
- `id` - Primary Key
- `restaurant_id` - Foreign Key to Restaurants
- `name` - Item name
- `description` - Description
- `price` - Price
- `image` - Item image
- `category` - Category
- `vegetarian` - Is vegetarian
- `availability` - Item availability
- `rating` - Item rating

### Orders Table
- `id` - Primary Key
- `user_id` - Foreign Key to Users
- `restaurant_id` - Foreign Key to Restaurants
- `order_number` - Unique order number
- `total_price` - Total price
- `delivery_address` - Delivery address
- `status` - Order status (pending, confirmed, preparing, ready, picked_up, delivered, cancelled)
- `payment_status` - Payment status (pending, completed, failed, refunded)
- `payment_method` - Payment method (cash, card, upi, wallet)
- `delivery_time` - Expected delivery time
- `special_instructions` - Special instructions

### OrderItems Table
- `id` - Primary Key
- `order_id` - Foreign Key to Orders
- `menu_item_id` - Foreign Key to MenuItems
- `quantity` - Quantity ordered
- `price` - Price at time of order

### Deliveries Table
- `id` - Primary Key
- `order_id` - Foreign Key to Orders
- `delivery_partner_id` - Foreign Key to Users
- `status` - Delivery status (pending, assigned, picked_up, in_transit, delivered, cancelled)
- `estimated_time` - Estimated delivery time
- `actual_delivery_time` - Actual delivery time
- `latitude` - Current latitude
- `longitude` - Current longitude
- `delivery_rating` - Delivery rating (1-5)
- `delivery_review` - Delivery review

## Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "customer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Restaurant
```bash
curl -X POST http://localhost:5000/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "cuisine": "Italian",
    "address": "123 Main St",
    "phone": "9876543210",
    "opening_time": "10:00:00",
    "closing_time": "23:00:00"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurant_id": 1,
    "items": [
      { "menu_item_id": 1, "quantity": 2 },
      { "menu_item_id": 2, "quantity": 1 }
    ],
    "delivery_address": "456 Oak Ave",
    "payment_method": "card"
  }'
```

## Environment Variables

See `.env` file for all configuration options:

- `PORT` - Server port (default: 5000)
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - CORS allowed origin

## Development

### Run with automatic reload
```bash
npm run dev
```

### Run in production
```bash
npm start
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Successful GET
- `201` - Successful creation
- `400` - Bad request / Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Security Considerations

- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens are verified for protected routes
- CORS is enabled for cross-origin requests
- Environment variables are used for sensitive data

## Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] Real-time location tracking with WebSockets
- [ ] Reviews and ratings system
- [ ] Loyalty/rewards program
- [ ] Admin dashboard
- [ ] Advanced analytics

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
