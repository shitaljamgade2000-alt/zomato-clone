import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, deleteFromCart, removeOne, selectCart, selectCartTotal } from '../features/cart/cartSlice';
import { selectUser } from '../features/auth/authSlice';
import { calcOrderTotal, formatPrice } from '../utils/formatters';
import VegIcon from '../components/common/VegIcon';
import CheckoutModal from '../components/cart/CheckoutModal';
import { useNavigate } from 'react-router-dom';

export default function CartPage({ onRequireAuth, onOrderPlaced }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectUser);
  const [showCheckout, setShowCheckout] = useState(false);
  const totals = calcOrderTotal(total);

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="no-results" style={{ paddingTop: 80 }}>
          <div className="no-results-icon">🛒</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Your cart is empty</div>
          <button type="button" className="reorder-btn" onClick={() => navigate('/')}>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <button type="button" className="back-btn" onClick={() => navigate('/')}>
        ← Continue Ordering
      </button>
      <div className="cart-page-header">Your Cart 🛒</div>
      <div style={{ fontSize: '0.875rem', color: '#686b78', marginBottom: 20 }}>
        From <strong>{cart.restaurantName}</strong>
      </div>
      <div className="cp-grid">
        <div className="cart-items-card">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="qty-ctrl">
                <button type="button" className="qty-btn" onClick={() => dispatch(removeOne(item.id))}>
                  −
                </button>
                <span className="qty-num">{item.qty}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => dispatch(addToCart({ item, restaurantId: cart.restaurantId, restaurantName: cart.restaurantName }))}
                >
                  +
                </button>
              </div>
              <div className="ci-name" style={{ flex: 1, marginLeft: 8 }}>
                <VegIcon isVeg={item.isVeg} /> {item.name}
              </div>
              <div className="ci-price">{formatPrice(item.price * item.qty)}</div>
              <button
                type="button"
                style={{ marginLeft: 10, background: 'none', border: 'none', color: '#686b78', cursor: 'pointer' }}
                onClick={() => dispatch(deleteFromCart(item.id))}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
        <div className="order-summary-card">
          <div className="os-title">Order Summary</div>
          {cart.items.map((i) => (
            <div key={i.id} className="os-row">
              <span>
                {i.name} × {i.qty}
              </span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="os-row">
            <span>Delivery Fee</span>
            <span>{formatPrice(totals.delivery)}</span>
          </div>
          <div className="os-row">
            <span>GST (5%)</span>
            <span>{formatPrice(totals.gst)}</span>
          </div>
          <div className="os-row total">
            <span>Grand Total</span>
            <span>{formatPrice(totals.grandTotal)}</span>
          </div>
          <button
            type="button"
            className="checkout-btn"
            onClick={() => {
              if (!user) {
                onRequireAuth();
                return;
              }
              setShowCheckout(true);
            }}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
      {showCheckout && (
        <CheckoutModal
          total={total}
          restaurantId={cart.restaurantId}
          restaurantName={cart.restaurantName}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            onOrderPlaced?.();
          }}
        />
      )}
    </div>
  );
}
