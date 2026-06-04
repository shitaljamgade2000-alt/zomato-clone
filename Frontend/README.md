# Zomato Clone — Frontend

React app integrated with the backend API (`http://localhost:5000/api`).

## Setup

```bash
cd Frontend
npm install
npm start
```

Ensure the **Backend** is running on port 5000 and MySQL is up.

## Structure

```
src/
  api/           # API clients (auth, restaurants, menu, orders, delivery)
  components/    # UI components (auth, cart, layout, restaurant)
  context/       # Auth & cart state
  pages/         # Home, Restaurant, Cart, Orders, Profile, Owner, Delivery
  utils/         # Validation (Yup), formatters, constants
  styles/        # Global CSS
```

## API usage

| Feature | Endpoints |
|---------|-----------|
| Auth | POST `/auth/register`, `/auth/login`, GET `/auth/profile` |
| Restaurants | GET/POST `/restaurants`, GET `/restaurants/my-restaurants` |
| Menu | GET `/menu?restaurant_id=`, POST/PATCH `/menu` |
| Orders | POST/GET `/orders`, PATCH cancel & status |
| Delivery | GET partner deliveries, PATCH status, POST rate |

## Roles

- **customer** — browse, cart, checkout, orders
- **restaurant_owner** — Owner dashboard (restaurants + menu)
- **delivery_partner** — Delivery dashboard
