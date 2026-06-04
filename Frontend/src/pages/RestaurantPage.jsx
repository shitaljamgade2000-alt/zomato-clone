import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart, removeOne, selectCart } from '../features/cart/cartSlice';
import { selectUser } from '../features/auth/authSlice';
import { fetchRestaurantById, selectRestaurantById, selectRestaurantsLoading } from '../features/restaurants/restaurantsSlice';
import { fetchMenuByRestaurant, selectMenuByRestaurant, selectMenuLoading } from '../features/menu/menuSlice';
import VegIcon from '../components/common/VegIcon';
import Loading from '../components/common/Loading';
import CartSidebar from '../components/cart/CartSidebar';
import { useNavigate, useParams } from 'react-router-dom';

export default function RestaurantPage({ onToast, onRequireAuth, onOrderPlaced }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const user = useSelector(selectUser);
  const restaurantData = useSelector(selectRestaurantById(id));
  const restaurantsLoading = useSelector(selectRestaurantsLoading);
  const menu = useSelector(selectMenuByRestaurant(id));
  const menuLoading = useSelector(selectMenuLoading);
  const [vegOnly, setVegOnly] = useState(false);

  // useEffect(() => {
  //   if (!id) return;
  //   dispatch(fetchRestaurantById(id));
  //   dispatch(fetchMenuByRestaurant(id))
  //     .unwrap()
  //     .catch(() => onToast?.('Failed to load menu', 'error'));
  // }, [dispatch, id, onToast]);

  useEffect(() => {
    if (!id) return;

    dispatch(fetchRestaurantById(id));
    dispatch(fetchMenuByRestaurant(id))
      .unwrap()
      .catch(() => { });
  }, [dispatch, id]);

  const getQty = (itemId) => cart.items.find((i) => i.id === itemId)?.qty || 0;

  const handleAdd = (item) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!item.availability) {
      onToast?.('Item is currently unavailable', 'error');
      return;
    }
    if (cart.restaurantId && cart.restaurantId !== id) {
      const nextName = restaurantData?.name || 'this restaurant';
      if (
        !window.confirm(
          `Your cart has items from ${cart.restaurantName}. Clear cart and add from ${nextName}?`
        )
      ) {
        return;
      }
      dispatch(clearCart());
    }
    dispatch(
      addToCart({
        item,
        restaurantId: id,
        restaurantName: restaurantData?.name || cart.restaurantName || '',
      })
    );
    onToast?.(`Added ${item.name} to cart!`);
  };

  const byCategory = useMemo(() => {
    return menu
      .filter((item) => !vegOnly || item.isVeg)
      .reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
      }, {});
  }, [menu, vegOnly]);

  if (restaurantsLoading || menuLoading) return <Loading label="Loading menu..." />;

  return (
    <div>
      <div className="rd-hero">
        <img src={restaurantData?.image} alt={restaurantData?.name} />
        <div className="rd-hero-overlay" />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div className="rd-hero-info">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/')}
              style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}
            >
              ← Back
            </button>
            <div className="rd-name">{restaurantData?.name}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: 8 }}>{restaurantData?.cuisine}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 6 }}>
                ⭐ {Number(restaurantData?.rating).toFixed(1)}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 6 }}>
                📍 {restaurantData?.address}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rd-body">
        <div>
          <div className="menu-toolbar">
            <span className="menu-toolbar-label">{menu.length} dishes</span>
            <button
              type="button"
              className={`filter-btn${vegOnly ? ' active' : ''}`}
              onClick={() => setVegOnly(!vegOnly)}
            >
              🥗 Veg Only
            </button>
          </div>
          {Object.keys(byCategory).length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📋</div>
              <div>No menu items yet for this restaurant.</div>
            </div>
          ) : (
            Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat} className="rd-menu" style={{ marginBottom: 16 }}>
                <div className="menu-cat-title">
                  {cat}{' '}
                  <span style={{ color: '#686b78', fontWeight: 400, fontSize: '0.875rem' }}>
                    ({items.length})
                  </span>
                </div>
                {items.map((item) => {
                  const qty = getQty(item.id);
                  return (
                    <div key={item.id} className="menu-item">
                      <div className="mi-info">
                        <div className="mi-name">
                          <VegIcon isVeg={item.isVeg} />
                          {item.name}
                          {!item.availability && (
                            <span style={{ color: '#e23744', fontSize: '0.75rem' }}> (Unavailable)</span>
                          )}
                        </div>
                        <div className="mi-desc">{item.desc}</div>
                        <div className="mi-price">₹{item.price}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <img className="mi-img" src={item.image} alt={item.name} loading="lazy" />
                        {qty === 0 ? (
                          <button type="button" className="add-btn" onClick={() => handleAdd(item)} disabled={!item.availability}>
                            ADD +
                          </button>
                        ) : (
                          <div className="qty-ctrl">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => dispatch(removeOne(item.id))}
                            >
                              −
                            </button>
                            <span className="qty-num">{qty}</span>
                            <button type="button" className="qty-btn" onClick={() => handleAdd(item)}>
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <CartSidebar
          restaurantId={id}
          restaurantName={restaurantData?.name}
          onRequireAuth={onRequireAuth}
          onOrderPlaced={onOrderPlaced}
        />
      </div>
    </div>
  );
}
