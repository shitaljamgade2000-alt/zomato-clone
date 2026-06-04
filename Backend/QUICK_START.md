# 🚀 Quick Start Guide - Zomato Backend

## What's Been Created

A complete **Node.js + Express + MySQL** backend with 23 files covering:
- ✓ 6 Database Models (User, Restaurant, MenuItem, Order, OrderItem, Delivery)
- ✓ 5 Controllers with full business logic
- ✓ 5 Route modules with 21 API endpoints
- ✓ Authentication & Authorization middleware
- ✓ Error handling & validation

## Installation (5 minutes)

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Create MySQL Database
Open MySQL client and run:
```sql
CREATE DATABASE zomato_db;
```

### 3. Update .env File
Edit `Backend/.env` with your credentials:
```env
DB_HOST=localhost          # Your MySQL host
DB_USER=root               # Your MySQL username
DB_PASSWORD=your_password  # Your MySQL password
DB_NAME=zomato_db         # Database name
JWT_SECRET=your_secret_key # Change this!
```

### 4. Start Server
```bash
npm run dev
```

You should see:
```
✓ MySQL connection established
✓ Database models synced
✓ Server running on http://localhost:5000
```

## Test It Out

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "customer"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raj@example.com",
    "password": "password123"
  }'
```

Save the token from response!

### 3. Create a Restaurant (with token)
```bash
curl -X POST http://localhost:5000/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "cuisine": "Italian",
    "address": "123 Main Street, NYC",
    "phone": "555-1234",
    "opening_time": "10:00:00",
    "closing_time": "23:00:00"
  }'
```

## 📋 Complete API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (needs token)

### Restaurants
- `GET /api/restaurants` - List all
- `POST /api/restaurants` - Create (needs token)
- `GET /api/restaurants/:id` - Get details
- `PUT /api/restaurants/:id` - Update (needs token)
- `DELETE /api/restaurants/:id` - Delete (needs token)

### Menu Items
- `GET /api/menu` - List items (by restaurant)
- `POST /api/menu` - Add item (needs token)
- `GET /api/menu/:id` - Get details
- `PUT /api/menu/:id` - Update (needs token)
- `DELETE /api/menu/:id` - Delete (needs token)

### Orders
- `POST /api/orders` - Create order (needs token)
- `GET /api/orders` - Get my orders (needs token)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update status

### Delivery
- `POST /api/delivery/assign` - Assign partner
- `GET /api/delivery/order/:order_id` - Check status
- `PATCH /api/delivery/:id/status` - Update status

## Database Schema

### 6 Tables Created:
1. **users** - 8 columns (id, name, email, password, phone, address, role, image)
2. **restaurants** - 11 columns (id, name, description, cuisine, rating, address, owner_id, etc)
3. **menu_items** - 9 columns (id, restaurant_id, name, description, price, image, etc)
4. **orders** - 11 columns (id, user_id, restaurant_id, order_number, total_price, etc)
5. **order_items** - 4 columns (id, order_id, menu_item_id, quantity, price)
6. **deliveries** - 11 columns (id, order_id, delivery_partner_id, status, estimated_time, etc)

## Key Features

✅ JWT Authentication with 7-day expiry
✅ Role-based access (customer, restaurant_owner, delivery_partner, admin)
✅ Password hashing with bcryptjs
✅ Order tracking (pending → delivered)
✅ Real-time delivery tracking with GPS
✅ Rating system (1-5 stars)
✅ CORS enabled for frontend
✅ Global error handling
✅ Connection pooling for MySQL

## Environment Variables Explained

```
PORT              - Server port (default 5000)
NODE_ENV          - Environment (development/production)
DB_HOST           - MySQL server address
DB_PORT           - MySQL port (default 3306)
DB_NAME           - Database name
DB_USER           - MySQL username
DB_PASSWORD       - MySQL password
JWT_SECRET        - Secret key for JWT signing
JWT_EXPIRE        - Token expiry time
CORS_ORIGIN       - Frontend URL for CORS
```

## Recommended Testing Tool

Use **Postman** for easier API testing:
1. Download from https://www.postman.com/downloads/
2. Import endpoints using the Bearer token for authentication
3. Test all endpoints before frontend integration

## Troubleshooting

**"Connection refused" error:**
- Ensure MySQL is running: `mysql -u root`
- Check DB credentials in .env file

**"Module not found" error:**
- Run `npm install` again
- Check node_modules folder exists

**"Port 5000 already in use":**
- Change PORT in .env to 5001, 5002, etc.

## Next: Frontend Integration

Your React frontend should call:
```javascript
const API_URL = 'http://localhost:5000/api';
```

Use the token from login response in all subsequent requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

**All set! Your Zomato backend is ready. Start the server with: `npm run dev`**
