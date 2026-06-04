import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import locationReducer from '../features/location/locationSlice';
import restaurantsReducer from '../features/restaurants/restaurantsSlice';
import menuReducer from '../features/menu/menuSlice';
import ordersReducer from '../features/orders/ordersSlice';
import paymentsReducer from '../features/payments/paymentSlice';
import ownerReducer from '../features/owner/ownerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    location: locationReducer,
    restaurants: restaurantsReducer,
    menu: menuReducer,
    orders: ordersReducer,
    payments: paymentsReducer,
    owner: ownerReducer,
  },
});

export default store;

