export const CATEGORIES = [
  { id: 1, name: 'Pizza', emoji: '🍕' },
  { id: 2, name: 'Burgers', emoji: '🍔' },
  { id: 3, name: 'Biryani', emoji: '🍛' },
  { id: 4, name: 'Chinese', emoji: '🥡' },
  { id: 5, name: 'South Indian', emoji: '🥞' },
  { id: 6, name: 'Desserts', emoji: '🍰' },
  { id: 7, name: 'Rolls', emoji: '🌯' },
  { id: 8, name: 'Sushi', emoji: '🍱' },
];

export const CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
];

export const ORDER_TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '📦' },
  { key: 'picked_up', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export const ORDER_STATUSES = ORDER_TRACKING_STEPS.map((s) => s.key).concat(['cancelled']);

export const DELIVERY_FEE = 40;
export const GST_RATE = 0.05;

export const PLACEHOLDER_RESTAURANT =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80';

export const PLACEHOLDER_FOOD =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';

export const ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'restaurant_owner',
  DELIVERY: 'delivery_partner',
  ADMIN: 'admin',
};

export const PAGES = {
  HOME: 'home',
  RESTAURANT: 'restaurant',
  CART: 'cart',
  ORDERS: 'orders',
  PROFILE: 'profile',
  OWNER: 'owner',
  DELIVERY: 'delivery',
};

export const FOOTER_LINKS = {
  company: [
    { label: 'Who We Are', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Work With Us', href: '#' },
    { label: 'Investor Relations', href: '#' },
  ],
  zomaverse: [
    { label: 'Zomato', href: '#' },
    { label: 'Blinkit', href: '#' },
    { label: 'Feeding India', href: '#' },
    { label: 'Hyperpure', href: '#' },
  ],
  contact: [
    { label: 'Contact Us', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Partner With Us', href: '#' },
    { label: 'Ride With Us', href: '#' },
  ],
  legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Security', href: '#' },
  ],
};
