# Backend File Directory & Purposes

## 📋 Complete File Listing (25 Files Total)

### Configuration & Setup Files

#### `server.js`
- **Purpose:** Main Express server entry point
- **Contains:** App initialization, middleware setup, route registration, database connection
- **Exports:** Sequelize models with relationships defined
- **Port:** Configurable via .env (default: 5000)

#### `config.js`
- **Purpose:** MySQL database connection configuration
- **Contains:** Sequelize instance, connection pooling settings
- **Exports:** sequelize object for all models
- **Features:** Connection pooling (max 5 connections)

#### `package.json`
- **Purpose:** Project dependencies and scripts
- **Contains:** 9 production dependencies, 1 dev dependency
- **Scripts:** 
  - `npm start` - Production server
  - `npm run dev` - Development with nodemon

#### `.env`
- **Purpose:** Environment variables configuration
- **Contains:** Database credentials, JWT secret, server port
- **Required:** Must be updated with your MySQL credentials
- **Security:** Never commit this file

#### `.gitignore`
- **Purpose:** Git ignore rules
- **Contains:** node_modules/, .env, .DS_Store, etc.
- **Usage:** Prevents sensitive files from being committed

---

### Database Models (6 Files)

#### `User.js`
- **Purpose:** User model for authentication and profiles
- **Fields:** id, name, email, password, phone, address, role, image
- **Methods:** hashPassword(), comparePassword()
- **Roles:** customer, restaurant_owner, delivery_partner, admin
- **Table:** users (auto-created)

#### `Restaurant.js`
- **Purpose:** Restaurant profile and information
- **Fields:** id, name, description, cuisine, rating, address, owner_id, image, phone, email, opening_time, closing_time, status
- **Relationships:** Belongs to User (owner)
- **Table:** restaurants (auto-created)

#### `MenuItem.js`
- **Purpose:** Food items available in restaurants
- **Fields:** id, restaurant_id, name, description, price, image, category, vegetarian, availability, rating
- **Relationships:** Belongs to Restaurant
- **Table:** menu_items (auto-created)

#### `Order.js`
- **Purpose:** Customer orders
- **Fields:** id, user_id, restaurant_id, order_number, total_price, delivery_address, status, payment_status, payment_method, delivery_time, special_instructions
- **Statuses:** pending, confirmed, preparing, ready, picked_up, delivered, cancelled
- **Table:** orders (auto-created)

#### `OrderItem.js`
- **Purpose:** Individual items within an order
- **Fields:** id, order_id, menu_item_id, quantity, price
- **Relationships:** Belongs to Order and MenuItem
- **Table:** order_items (auto-created)

#### `Delivery.js`
- **Purpose:** Delivery tracking and management
- **Fields:** id, order_id, delivery_partner_id, status, estimated_time, actual_delivery_time, latitude, longitude, delivery_rating, delivery_review
- **Statuses:** pending, assigned, picked_up, in_transit, delivered, cancelled
- **Table:** deliveries (auto-created)

---

### Controllers (5 Files)

#### `authController.js`
- **Purpose:** Authentication logic
- **Methods:**
  - `register()` - User registration with hashed password
  - `login()` - User authentication with JWT token
  - `getProfile()` - Retrieve authenticated user profile
- **Features:** JWT token generation, password hashing, validation

#### `restaurantController.js`
- **Purpose:** Restaurant operations
- **Methods:**
  - `createRestaurant()` - Create new restaurant
  - `getRestaurants()` - List all restaurants
  - `getRestaurantById()` - Get restaurant details
  - `updateRestaurant()` - Update restaurant info
  - `deleteRestaurant()` - Delete restaurant
  - `getMyRestaurants()` - Get owner's restaurants
- **Authorization:** Owner-only modifications

#### `menuController.js`
- **Purpose:** Menu item management
- **Methods:**
  - `createMenuItem()` - Add menu item to restaurant
  - `getMenuItems()` - List items (filtered by restaurant_id)
  - `getMenuItemById()` - Get item details
  - `updateMenuItem()` - Edit menu item
  - `deleteMenuItem()` - Remove menu item
  - `toggleAvailability()` - Toggle item availability
- **Features:** Category filtering, availability management

#### `orderController.js`
- **Purpose:** Order management and tracking
- **Methods:**
  - `createOrder()` - Create new order with items
  - `getOrders()` - Get user's orders
  - `getOrderById()` - Get order details with items
  - `updateOrderStatus()` - Update order status
  - `cancelOrder()` - Cancel pending order
- **Features:** Order number generation, total price calculation

#### `deliveryController.js`
- **Purpose:** Delivery assignment and tracking
- **Methods:**
  - `assignDelivery()` - Assign delivery partner
  - `getDeliveryStatus()` - Get delivery details
  - `updateDeliveryStatus()` - Update status and location
  - `getDeliveriesByPartner()` - Get partner's deliveries
  - `rateDelivery()` - Rate and review delivery
- **Features:** GPS tracking, rating validation (1-5)

---

### Routes (5 Files)

#### `authRoutes.js`
- **Purpose:** Authentication route definitions
- **Endpoints:**
  - POST `/api/auth/register` - Register user
  - POST `/api/auth/login` - Login user
  - GET `/api/auth/profile` - Get profile (auth required)
- **Middleware:** auth middleware on profile route

#### `restaurantRoutes.js`
- **Purpose:** Restaurant route definitions
- **Endpoints:**
  - GET `/api/restaurants` - List all
  - POST `/api/restaurants` - Create (auth required)
  - GET `/api/restaurants/my-restaurants` - Get mine (auth required)
  - GET `/api/restaurants/:id` - Get details
  - PUT `/api/restaurants/:id` - Update (auth required)
  - DELETE `/api/restaurants/:id` - Delete (auth required)

#### `menuRoutes.js`
- **Purpose:** Menu item route definitions
- **Endpoints:**
  - GET `/api/menu` - List items
  - POST `/api/menu` - Create (auth required)
  - GET `/api/menu/:id` - Get details
  - PUT `/api/menu/:id` - Update (auth required)
  - DELETE `/api/menu/:id` - Delete (auth required)
  - PATCH `/api/menu/:id/toggle-availability` - Toggle (auth required)

#### `orderRoutes.js`
- **Purpose:** Order route definitions
- **Endpoints:**
  - POST `/api/orders` - Create (auth required)
  - GET `/api/orders` - List user's orders (auth required)
  - GET `/api/orders/:id` - Get details (auth required)
  - PATCH `/api/orders/:id/status` - Update status (auth required)
  - PATCH `/api/orders/:id/cancel` - Cancel (auth required)

#### `deliveryRoutes.js`
- **Purpose:** Delivery route definitions
- **Endpoints:**
  - POST `/api/delivery/assign` - Assign (auth required)
  - GET `/api/delivery/order/:order_id` - Get status
  - PATCH `/api/delivery/:id/status` - Update (auth required)
  - GET `/api/delivery/partner/deliveries` - Partner's list (auth required)
  - POST `/api/delivery/:id/rate` - Rate (auth required)

---

### Middleware (2 Files)

#### `auth.js`
- **Purpose:** JWT authentication middleware
- **Function:** Verifies Bearer tokens in Authorization header
- **Extracts:** user.id, user.email, user.role from token
- **Error:** Returns 401 if token is invalid or missing
- **Usage:** `router.get('/protected', auth, controller.method)`

#### `errorHandler.js`
- **Purpose:** Global error handling middleware
- **Handles:**
  - ValidationError - Returns 400 with error details
  - SequelizeUniqueConstraintError - Returns 400 with field name
  - SequelizeValidationError - Returns 400 with details
  - Generic errors - Returns 500 with message
- **Feature:** Prevents sensitive data exposure

---

### Documentation Files (4 Files)

#### `README.md`
- **Purpose:** Complete API documentation
- **Contains:**
  - Installation instructions
  - Project structure overview
  - All API endpoints with examples
  - Database schema details
  - Example curl requests
  - Environment variables explanation
  - Future enhancements list
- **Length:** ~9000 words

#### `QUICK_START.md`
- **Purpose:** Fast setup guide for developers
- **Contains:**
  - 5-minute installation guide
  - cURL testing examples
  - Postman recommendations
  - Troubleshooting tips
  - Frontend integration guidelines
- **Length:** ~5500 words

#### `COMPLETE_OVERVIEW.md`
- **Purpose:** Comprehensive project overview
- **Contains:**
  - All files listed with purposes
  - Database schema relationships
  - Role descriptions
  - Performance features
  - Status workflows
  - Roadmap for future features
- **Length:** ~10500 words

#### `database_schema.sql`
- **Purpose:** SQL schema for manual database setup
- **Contains:**
  - CREATE TABLE statements for all 6 tables
  - Foreign key relationships
  - Indexes for performance
  - Check constraints for validation
  - Sample INSERT statements
- **Usage:** `mysql -u root < database_schema.sql`

---

## 🗂️ File Organization

```
Backend/
│
├── Configuration (4)
│   ├── server.js
│   ├── config.js
│   ├── package.json
│   └── .env
│
├── Models (6)
│   ├── User.js
│   ├── Restaurant.js
│   ├── MenuItem.js
│   ├── Order.js
│   ├── OrderItem.js
│   └── Delivery.js
│
├── Controllers (5)
│   ├── authController.js
│   ├── restaurantController.js
│   ├── menuController.js
│   ├── orderController.js
│   └── deliveryController.js
│
├── Routes (5)
│   ├── authRoutes.js
│   ├── restaurantRoutes.js
│   ├── menuRoutes.js
│   ├── orderRoutes.js
│   └── deliveryRoutes.js
│
├── Middleware (2)
│   ├── auth.js
│   └── errorHandler.js
│
├── Documentation (4)
│   ├── README.md
│   ├── QUICK_START.md
│   ├── COMPLETE_OVERVIEW.md
│   └── database_schema.sql
│
└── .gitignore
```

---

## 📊 Line Count Summary

| Category | Files | Est. Lines | Purpose |
|----------|-------|-----------|---------|
| Server Setup | 2 | 200 | App initialization |
| Database Config | 1 | 50 | Connection |
| Models | 6 | 500 | Data structures |
| Controllers | 5 | 800 | Business logic |
| Routes | 5 | 200 | API endpoints |
| Middleware | 2 | 150 | Request processing |
| Config Files | 2 | 100 | Settings |
| **TOTAL** | **23** | **~2000** | Complete backend |

---

## 🔄 Data Flow Example

### Order Creation Flow
```
1. POST /api/orders (with token)
   ↓
2. auth.js → Validates JWT token
   ↓
3. orderRoutes.js → Routes to controller
   ↓
4. orderController.js → Creates order, calculates total
   ↓
5. Order.js Model → Saves to database
6. OrderItem.js Model → Saves each item
   ↓
7. JSON Response → Returns new order
```

### Authentication Flow
```
1. POST /api/auth/register
   ↓
2. authController.js → Validates input
   ↓
3. User.js → Checks email uniqueness
4. User.js → Hashes password with bcryptjs
5. User.js → Saves to database
   ↓
6. JWT Token Generated → JWT_SECRET used
   ↓
7. JSON Response → Token + User info
```

---

## 🎯 File Dependencies

```
server.js
├── config.js (database)
├── User.js (model)
├── Restaurant.js (model)
├── MenuItem.js (model)
├── Order.js (model)
├── OrderItem.js (model)
├── Delivery.js (model)
├── authRoutes.js
│   └── authController.js
│       └── User.js
├── restaurantRoutes.js
│   └── restaurantController.js
│       └── Restaurant.js
├── menuRoutes.js
│   └── menuController.js
│       └── MenuItem.js
├── orderRoutes.js
│   └── orderController.js
│       └── Order.js, OrderItem.js, MenuItem.js
├── deliveryRoutes.js
│   └── deliveryController.js
│       └── Delivery.js, Order.js
├── auth.js (middleware)
└── errorHandler.js (middleware)
```

---

## ✅ Checklist

- [x] Server setup (Express, cors, middleware)
- [x] Database connection (MySQL, Sequelize)
- [x] All 6 models created with relationships
- [x] All 5 controllers with business logic
- [x] All 5 route files with endpoints (21 total)
- [x] Authentication middleware
- [x] Error handling middleware
- [x] Environment configuration
- [x] Complete documentation
- [x] SQL schema file
- [x] .gitignore setup

---

**Total:** 25 files | 21 API endpoints | 6 database tables | Production-ready backend

All files are ready to use. Start with: `npm install && npm run dev`
