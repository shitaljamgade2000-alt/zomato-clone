-- Zomato Clone — Sample Restaurant Data
-- Run after database_schema.sql
--
-- Usage (XAMPP):
--   & "C:\xampp\mysql\bin\mysql.exe" -u root zomato_db < seed_restaurants.sql
--
-- Default login for all seed users:
--   Password: password123

USE zomato_db;

-- ─── Restaurant owners ───────────────────────────────────────────────────────
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Rajesh Kumar', 'owner.dominoes@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876500001', 'Andheri West, Mumbai', 'restaurant_owner'),
('Priya Sharma', 'owner.burgerking@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876500002', 'Connaught Place, Delhi', 'restaurant_owner'),
('Ahmed Khan', 'owner.biryani@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876500003', 'Banjara Hills, Hyderabad', 'restaurant_owner'),
('Lisa Chen', 'owner.chinese@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876500004', 'Indiranagar, Bangalore', 'restaurant_owner'),
('Venkat Raman', 'owner.sagar@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876500005', 'T Nagar, Chennai', 'restaurant_owner'),
('Anita Desai', 'owner.dessert@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876500006', 'Koregaon Park, Pune', 'restaurant_owner')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Sample customer (for placing test orders)
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Test Customer', 'customer@test.com', '$2a$10$Zk3QRxurilyP7CLsqFDP5OyG.XiIdgbv.envunTn45JqIAIjOg4Li', '9876543210', '123 MG Road, Mumbai - 400001', 'customer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ─── Restaurants ─────────────────────────────────────────────────────────────
INSERT INTO restaurants (name, description, cuisine, rating, address, owner_id, image, phone, email, opening_time, closing_time, status) VALUES
(
  'Domino''s Pizza',
  'India''s favourite pizza delivery. Fresh dough, quality toppings, fast delivery.',
  'Pizza, Fast Food, Italian',
  4.2,
  'Shop 12, Linking Road, Bandra West, Mumbai - 400050',
  (SELECT id FROM users WHERE email = 'owner.dominoes@test.com'),
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  '02261234567',
  'bandra@dominoes.test.com',
  '10:00:00',
  '23:00:00',
  'active'
),
(
  'Burger King',
  'Flame-grilled burgers, crispy fries and thick shakes.',
  'Burgers, American, Fast Food',
  4.0,
  'Block A, Connaught Place, New Delhi - 110001',
  (SELECT id FROM users WHERE email = 'owner.burgerking@test.com'),
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
  '01161234567',
  'cp@burgerking.test.com',
  '11:00:00',
  '23:30:00',
  'active'
),
(
  'Biryani House',
  'Authentic Hyderabadi dum biryani slow-cooked with aromatic spices.',
  'Biryani, North Indian, Mughlai',
  4.5,
  'Road No 12, Banjara Hills, Hyderabad - 500034',
  (SELECT id FROM users WHERE email = 'owner.biryani@test.com'),
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
  '04061234567',
  'banjara@biryani.test.com',
  '12:00:00',
  '23:00:00',
  'active'
),
(
  'China Garden',
  'Classic Chinese favourites — noodles, manchurian and fried rice.',
  'Chinese, Asian, Noodles',
  3.9,
  '100 Feet Road, Indiranagar, Bangalore - 560038',
  (SELECT id FROM users WHERE email = 'owner.chinese@test.com'),
  'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80',
  '08061234567',
  'indira@chinagarden.test.com',
  '11:30:00',
  '22:30:00',
  'active'
),
(
  'Sagar Ratna',
  'Pure vegetarian South Indian — dosas, idlis and filter coffee.',
  'South Indian, Breakfast, Vegetarian',
  4.3,
  'Usman Road, T Nagar, Chennai - 600017',
  (SELECT id FROM users WHERE email = 'owner.sagar@test.com'),
  'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80',
  '04461234567',
  'tnagar@sagar.test.com',
  '07:00:00',
  '22:00:00',
  'active'
),
(
  'The Dessert Lab',
  'Waffles, cheesecakes, sundaes and artisan desserts.',
  'Desserts, Ice Cream, Bakery',
  4.6,
  'Lane 5, Koregaon Park, Pune - 411001',
  (SELECT id FROM users WHERE email = 'owner.dessert@test.com'),
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  '02061234567',
  'kp@dessertlab.test.com',
  '10:00:00',
  '23:00:00',
  'active'
);

-- ─── Menu items — Domino's Pizza ─────────────────────────────────────────────
INSERT INTO menu_items (restaurant_id, name, description, price, category, vegetarian, availability, image) VALUES
((SELECT id FROM restaurants WHERE name = 'Domino''s Pizza' LIMIT 1), 'Margherita Pizza', 'Classic tomato sauce with mozzarella cheese', 199.00, 'Pizza', 1, 1, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Domino''s Pizza' LIMIT 1), 'Pepperoni Pizza', 'Loaded with pepperoni slices and cheese', 299.00, 'Pizza', 0, 1, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Domino''s Pizza' LIMIT 1), 'Veggie Supreme', 'Fresh vegetables on herbed crust', 249.00, 'Pizza', 1, 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Domino''s Pizza' LIMIT 1), 'Garlic Bread', 'Toasted bread with garlic butter', 89.00, 'Sides', 1, 1, 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Domino''s Pizza' LIMIT 1), 'Choco Lava Cake', 'Warm chocolate lava cake', 79.00, 'Desserts', 1, 1, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&q=80');

-- ─── Menu items — Burger King ────────────────────────────────────────────────
INSERT INTO menu_items (restaurant_id, name, description, price, category, vegetarian, availability, image) VALUES
((SELECT id FROM restaurants WHERE name = 'Burger King' LIMIT 1), 'Whopper', 'Flame-grilled beef patty with fresh veggies', 229.00, 'Burgers', 0, 1, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Burger King' LIMIT 1), 'Veg Whopper', 'Plant-based patty flame-grilled to perfection', 179.00, 'Burgers', 1, 1, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Burger King' LIMIT 1), 'Crispy Chicken Burger', 'Crispy fried chicken with mayo', 199.00, 'Burgers', 0, 1, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Burger King' LIMIT 1), 'French Fries', 'Golden crispy fries with salt', 99.00, 'Sides', 1, 1, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Burger King' LIMIT 1), 'Chocolate Shake', 'Thick chocolate milkshake', 129.00, 'Drinks', 1, 1, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&q=80');

-- ─── Menu items — Biryani House ──────────────────────────────────────────────
INSERT INTO menu_items (restaurant_id, name, description, price, category, vegetarian, availability, image) VALUES
((SELECT id FROM restaurants WHERE name = 'Biryani House' LIMIT 1), 'Chicken Dum Biryani', 'Slow-cooked aromatic chicken biryani', 299.00, 'Biryani', 0, 1, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Biryani House' LIMIT 1), 'Veg Biryani', 'Fragrant basmati rice with mixed vegetables', 199.00, 'Biryani', 1, 1, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Biryani House' LIMIT 1), 'Mutton Biryani', 'Tender mutton pieces in spiced rice', 399.00, 'Biryani', 0, 1, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Biryani House' LIMIT 1), 'Raita', 'Fresh yogurt with cucumber and spices', 49.00, 'Sides', 1, 1, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Biryani House' LIMIT 1), 'Gulab Jamun', 'Soft milk-solid dessert in sugar syrup', 79.00, 'Desserts', 1, 1, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&q=80');

-- ─── Menu items — China Garden ───────────────────────────────────────────────
INSERT INTO menu_items (restaurant_id, name, description, price, category, vegetarian, availability, image) VALUES
((SELECT id FROM restaurants WHERE name = 'China Garden' LIMIT 1), 'Hakka Noodles', 'Stir-fried noodles with vegetables and soy sauce', 179.00, 'Noodles', 1, 1, 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'China Garden' LIMIT 1), 'Chicken Manchurian', 'Crispy chicken in tangy manchurian sauce', 229.00, 'Starters', 0, 1, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'China Garden' LIMIT 1), 'Egg Fried Rice', 'Wok-tossed rice with egg and vegetables', 159.00, 'Rice', 0, 1, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'China Garden' LIMIT 1), 'Veg Spring Rolls', 'Crispy rolls stuffed with vegetables', 129.00, 'Starters', 1, 1, 'https://images.unsplash.com/photo-1544025162-d76538980b48?w=200&q=80');

-- ─── Menu items — Sagar Ratna ────────────────────────────────────────────────
INSERT INTO menu_items (restaurant_id, name, description, price, category, vegetarian, availability, image) VALUES
((SELECT id FROM restaurants WHERE name = 'Sagar Ratna' LIMIT 1), 'Masala Dosa', 'Crispy dosa with spiced potato filling', 89.00, 'Dosas', 1, 1, 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Sagar Ratna' LIMIT 1), 'Idli Sambar', 'Soft idlis served with sambar and chutney', 69.00, 'Idlis', 1, 1, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Sagar Ratna' LIMIT 1), 'Uttapam', 'Thick rice pancake with onion and tomato', 99.00, 'Dosas', 1, 1, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'Sagar Ratna' LIMIT 1), 'Filter Coffee', 'Traditional South Indian decoction coffee', 45.00, 'Drinks', 1, 1, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80');

-- ─── Menu items — The Dessert Lab ────────────────────────────────────────────
INSERT INTO menu_items (restaurant_id, name, description, price, category, vegetarian, availability, image) VALUES
((SELECT id FROM restaurants WHERE name = 'The Dessert Lab' LIMIT 1), 'Nutella Waffle', 'Belgian waffle with Nutella drizzle', 199.00, 'Waffles', 1, 1, 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'The Dessert Lab' LIMIT 1), 'Mango Cheesecake', 'Creamy mango cheesecake slice', 179.00, 'Cakes', 1, 1, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'The Dessert Lab' LIMIT 1), 'Sundae Overload', 'Three scoops with toppings and chocolate sauce', 149.00, 'Ice Cream', 1, 1, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'The Dessert Lab' LIMIT 1), 'Brownie Fudge', 'Warm brownie with vanilla ice cream', 129.00, 'Cakes', 1, 1, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&q=80'),
((SELECT id FROM restaurants WHERE name = 'The Dessert Lab' LIMIT 1), 'Fruit Parfait', 'Layered yogurt, granola and fresh fruits', 99.00, 'Healthy', 1, 1, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80');

-- Verify
SELECT 'Restaurants inserted:' AS info, COUNT(*) AS total FROM restaurants;
SELECT 'Menu items inserted:' AS info, COUNT(*) AS total FROM menu_items;
