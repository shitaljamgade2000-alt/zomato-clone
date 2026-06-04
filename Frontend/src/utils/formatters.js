import { DELIVERY_FEE, GST_RATE, PLACEHOLDER_FOOD, PLACEHOLDER_RESTAURANT } from './constants';

export const formatPrice = (amount) => `₹${Math.round(Number(amount) || 0)}`;

export const calcOrderTotal = (subtotal) => {
  const gst = Math.round(subtotal * GST_RATE);
  return {
    subtotal,
    delivery: DELIVERY_FEE,
    gst,
    grandTotal: subtotal + DELIVERY_FEE + gst,
  };
};

export const formatStatus = (status) =>
  (status || '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const mapMenuItem = (item) => ({
  id: item.id,
  name: item.name,
  desc: item.description || '',
  price: Number(item.price),
  isVeg: Boolean(item.vegetarian),
  category: item.category || 'Other',
  image: item.image || PLACEHOLDER_FOOD,
  availability: item.availability !== false,
});

export const mapRestaurant = (r) => ({
  id: r.id,
  name: r.name,
  cuisine: r.cuisine || 'Multi-cuisine',
  rating: r.rating || 4.0,
  image: r.image || PLACEHOLDER_RESTAURANT,
  address: r.address,
  description: r.description,
  status: r.status,
  deliveryTime: 30,
  costForTwo: 400,
  minOrder: 99,
  isVeg: false,
  promoted: (r.rating || 0) >= 4.3,
  offer: r.status === 'active' ? 'Free delivery on first order' : null,
});
