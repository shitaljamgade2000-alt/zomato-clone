import { useMemo, useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LocationPicker from './components/layout/LocationPicker';
import FloatingCartBar from './components/layout/FloatingCartBar';
import AuthModal from './components/auth/AuthModal';
import Toast from './components/common/Toast';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import './styles/global.css';
import { Routes, Route, useLocation as useRouterLocation } from 'react-router-dom';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authConfig, setAuthConfig] = useState({ tab: 'login', role: 'customer' });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const location = useRouterLocation();

  const showToast = (msg, variant = 'default') => {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2500);
  };

  const openAuth = (tab = 'login', role = 'customer') => {
    setAuthConfig({ tab, role });
    setShowAuth(true);
  };
  const showFloatingCart = useMemo(() => {
    return location.pathname === '/' || location.pathname.startsWith('/restaurant/');
  }, [location.pathname]);

  return (
    <div className="app">
      <Navbar onOpenAuth={openAuth} search={search} onSearchChange={setSearch} />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<HomePage search={search} onSearchChange={setSearch} />}
          />
          <Route
            path="/restaurant/:id"
            element={<RestaurantPage onToast={showToast} onRequireAuth={openAuth} />}
          />
          <Route path="/cart" element={<CartPage onRequireAuth={openAuth} />} />
          <Route path="/orders" element={<OrdersPage onRequireAuth={openAuth} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/add-restaurant" element={<OwnerDashboardPage />} />
          <Route path="/owner" element={<OwnerDashboardPage />} />
          <Route path="/delivery" element={<DeliveryDashboardPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingCartBar visible={showFloatingCart} />
      <LocationPicker />
      {showAuth && (
        <AuthModal
          key={`${authConfig.tab}-${authConfig.role}`}
          initialTab={authConfig.tab}
          initialRole={authConfig.role}
          onClose={() => setShowAuth(false)}
          onSuccess={() => showToast('Welcome to Zomato!')}
        />
      )}
      {toast && <Toast message={toast.msg} variant={toast.variant} onDone={() => setToast(null)} />}
    </div>
  );
}




// import { Routes, Route } from 'react-router-dom';

// import HomePage from './pages/HomePage';
// import RestaurantPage from './pages/RestaurantPage';
// import CartPage from './pages/CartPage';
// import OrdersPage from './pages/OrdersPage';
// import ProfilePage from './pages/ProfilePage';
// import OwnerDashboardPage from './pages/OwnerDashboardPage';
// import DeliveryDashboardPage from './pages/DeliveryDashboardPage';



// function App() {
//   const [page, setPage] = useState(PAGES.HOME);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);
//   const [showAuth, setShowAuth] = useState(false);
//   const [authConfig, setAuthConfig] = useState({ tab: 'login', role: 'customer' });
//   const [toast, setToast] = useState(null);
//   const [search, setSearch] = useState('');


//   const showToast = (msg, variant = 'default') => {
//     setToast({ msg, variant });
//     setTimeout(() => setToast(null), 2500);
//   };

//   const openAuth = (tab = 'login', role = 'customer') => {
//     setAuthConfig({ tab, role });
//     setShowAuth(true);
//   };
//   const goOrders = () => setPage(PAGES.ORDERS);

//   const showFloatingCart = [PAGES.HOME, PAGES.RESTAURANT].includes(page);
//   return (
//     <LocationProvider>
//       <AuthProvider>
//         <CartProvider>
//           <div className="app">

//             <Navbar />

//             <main className="main-content">
//               <Routes>

//                 {/* Home */}
//                 <Route path="/" element={<HomePage />} />

//                 {/* Restaurant Details */}
//                 <Route
//                   path="/restaurant/:id"
//                   element={<RestaurantPage />}
//                 />

//                 {/* Cart */}
//                 <Route
//                   path="/cart"
//                   element={<CartPage />}
//                 />

//                 {/* Orders */}
//                 <Route
//                   path="/orders"
//                   element={<OrdersPage onRequireAuth={openAuth} setPage={setPage} />}

//                 />

//                 {/* Profile */}
//                 {page === PAGES.PROFILE && (
//                   <Route
//                     path="/profile"
//                     element={<ProfilePage />}
//                   />
//                 )}
//                 {/* Restaurant Owner Dashboard */}
//                 <Route
//                   path="/owner/dashboard"
//                   element={<OwnerDashboardPage />}
//                 />

//                 {/* Delivery Partner Dashboard */}
//                 <Route
//                   path="/delivery/dashboard"
//                   element={<DeliveryDashboardPage />}
//                 />

//               </Routes>
//             </main>

//             <Footer />
//             <FloatingCartBar />
//             <LocationPicker />

//             {showAuth && (
//               <AuthModal
//                 key={`${authConfig.tab}-${authConfig.role}`}
//                 initialTab={authConfig.tab}
//                 initialRole={authConfig.role}
//                 onClose={() => setShowAuth(false)}
//                 onSuccess={() => showToast('Welcome to Zomato!')}
//               />
//             )}
//             {toast && (
//               <Toast message={toast.msg} variant={toast.variant} onDone={() => setToast(null)} />
//             )}

//           </div>
//         </CartProvider>
//       </AuthProvider>
//     </LocationProvider>
//   );
// }

// export default App;



// import { useState } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import { AuthProvider } from "./context/AuthContext";
// import { CartProvider } from "./context/CartContext";
// import { LocationProvider } from "./context/LocationContext";

// import Navbar from "./components/layout/Navbar";
// import Footer from "./components/layout/Footer";
// import LocationPicker from "./components/layout/LocationPicker";
// import FloatingCartBar from "./components/layout/FloatingCartBar";

// import AuthModal from "./components/auth/AuthModal";
// import Toast from "./components/common/Toast";

// import HomePage from "./pages/HomePage";
// import RestaurantPage from "./pages/RestaurantPage";
// import CartPage from "./pages/CartPage";
// import OrdersPage from "./pages/OrdersPage";
// import ProfilePage from "./pages/ProfilePage";
// import OwnerDashboardPage from "./pages/OwnerDashboardPage";
// import DeliveryDashboardPage from "./pages/DeliveryDashboardPage";

// import "./styles/global.css";

// export default function App() {
//   const [showAuth, setShowAuth] = useState(false);

//   const [authConfig, setAuthConfig] = useState({
//     tab: "login",
//     role: "customer",
//   });

//   const [toast, setToast] = useState(null);
//   const [search, setSearch] = useState("");

//   const showToast = (msg, variant = "default") => {
//     setToast({ msg, variant });

//     setTimeout(() => {
//       setToast(null);
//     }, 2500);
//   };

//   const openAuth = (tab = "login", role = "customer") => {
//     setAuthConfig({ tab, role });
//     setShowAuth(true);
//   };

//   return (
//     <LocationProvider>
//       <AuthProvider>
//         <CartProvider>
//           <div className="app">
//             <Navbar
//               onOpenAuth={openAuth}
//               search={search}
//               onSearchChange={setSearch}
//             />

//             <main className="main-content">
//               <Routes>

//                 {/* Home */}
//                 <Route
//                   path="/"
//                   element={
//                     <HomePage
//                       search={search}
//                       onSearchChange={setSearch}
//                     />
//                   }
//                 />

//                 {/* Restaurant */}
//                 <Route
//                   path="/restaurant/:id"
//                   element={
//                     <RestaurantPage
//                       onToast={showToast}
//                       onRequireAuth={openAuth}
//                     />
//                   }
//                 />

//                 {/* Cart */}
//                 <Route
//                   path="/cart"
//                   element={
//                     <CartPage
//                       onRequireAuth={openAuth}
//                     />
//                   }
//                 />

//                 {/* Orders */}
//                 <Route
//                   path="/orders"
//                   element={
//                     <OrdersPage
//                       onRequireAuth={openAuth}
//                     />
//                   }
//                 />

//                 {/* Profile */}
//                 <Route
//                   path="/profile"
//                   element={<ProfilePage />}
//                 />

//                 {/* Restaurant Owner */}
//                 <Route
//                   path="/owner"
//                   element={<OwnerDashboardPage />}
//                 />

//                 {/* Delivery Partner */}
//                 <Route
//                   path="/delivery"
//                   element={<DeliveryDashboardPage />}
//                 />

//                 {/* 404 */}
//                 <Route
//                   path="*"
//                   element={<Navigate to="/" />}
//                 />

//               </Routes>
//             </main>

//             <Footer />

//             <FloatingCartBar />

//             <LocationPicker />

//             {showAuth && (
//               <AuthModal
//                 key={`${authConfig.tab}-${authConfig.role}`}
//                 initialTab={authConfig.tab}
//                 initialRole={authConfig.role}
//                 onClose={() => setShowAuth(false)}
//                 onSuccess={() =>
//                   showToast("Welcome to Zomato!")
//                 }
//               />
//             )}

//             {toast && (
//               <Toast
//                 message={toast.msg}
//                 variant={toast.variant}
//                 onDone={() => setToast(null)}
//               />
//             )}
//           </div>
//         </CartProvider>
//       </AuthProvider>
//     </LocationProvider>
//   );
// }