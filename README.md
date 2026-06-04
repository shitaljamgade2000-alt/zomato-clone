# zomato-clone
🍔 Food Ordering System – User Flow

This project includes three roles:

👤 Customer
🏪 Restaurant Owner
🚚 Driver

Each role has a separate login and dashboard with specific responsibilities.

🔐 Demo Login Credentials

👤 Customer
Email: shital14@mailinator.com
Password: Shital@123

🏪 Restaurant Owner
Email: shital2000@mailinator.com
Password: Shital@123

🚚 Driver
Email: driver@test.com
Password: driver123

🍽️ System Workflow
1️⃣ **Customer Flow**

Customer logs in using credentials.
Browses restaurants and menus.
Adds food items to cart.
Completes payment using Stripe (Test Mode).
Places the order successfully.

📦 After Ordering:
Customer can view all orders in Profile → Orders section.
Order status updates (Please refresh page):
Confirmed
Preparing
Ready
Picked Up
Out for Delivery
Delivered

2️⃣ **Restaurant Owner Flow**

Restaurant owner logs in to the dashboard.
🧭 Dashboard Features:
**Orders Tab**
View all incoming orders
Filter orders by restaurant using dropdown:
**“All My Restaurants”**
Specific restaurant-wise orders
Update order status:
Confirmed
Preparing
Ready
Restaurant Tab--->View all registered restaurants
Menu Tab--->Manage food items 
Add Restaurant Tab--------->Add new restaurants

🚚 Driver Assignment:
Once order status is marked as Ready
Owner assigns a driver from the available driver list


3️⃣ **Driver Flow**
Driver logs in to the Delivery Dashboard.
📦 Assigned Orders:
Driver sees only assigned orders.
🚚 Delivery Process:

Driver updates order status step by step:

Mark Picked Up
Start Delivery
Marked Delivered
