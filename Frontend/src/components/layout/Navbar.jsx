import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction, selectUser } from '../../features/auth/authSlice';
import { selectCity, setShowPicker } from '../../features/location/locationSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { ROLES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onOpenAuth, search, onSearchChange }) {
  const dispatch = useDispatch();
  const city = useSelector(selectCity);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const count = useSelector(selectCartCount);

  const handleAddRestaurant = () => {
    if (user?.role === ROLES.OWNER) {
      navigate('/add-restaurant');
      return;
    }
    onOpenAuth('signup', ROLES.OWNER);
  };

  const HandleProfileClick = () => {
    navigate('/profile');
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <span className="logo-mark">🍽️</span>
          <span className="logo-text">Zomato</span>
        </div>

        <button type="button" className="nav-loc" onClick={() => dispatch(setShowPicker(true))}>
          <span className="nav-loc-icon">📍</span>
          <span className="nav-loc-text">
            {city}
            <span className="nav-loc-arrow">▼</span>
          </span>
        </button>

        <div className="nav-search">
          <span className="nav-search-icon">🔍</span>
          <input
            placeholder="Search for restaurant, cuisine or a dish"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="nav-right">
          <button type="button" className="nav-text-link" onClick={handleAddRestaurant}>
            Add restaurant
          </button>

          {user ? (
            <>
              <button
                type="button"
                className="nav-user"
                onClick={HandleProfileClick}
                aria-label="Profile"
              >
                <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                className="nav-text-link nav-logout"
                onClick={() => dispatch(logoutAction(), navigate('/'))}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button type="button" className="nav-text-link" onClick={() => onOpenAuth('login')}>
                Log in
              </button>
              <button type="button" className="nav-btn nav-btn-red nav-signup" onClick={() => onOpenAuth('signup')}>
                Sign up
              </button>
            </>
          )}

          {count > 0 && (
            <button
              type="button"
              className="nav-cart-btn"
              onClick={() => navigate('/cart')}
              aria-label="Cart"
            >
              🛒
              <span className="cart-badge">{count}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
