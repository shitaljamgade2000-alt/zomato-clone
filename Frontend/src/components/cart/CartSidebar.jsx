import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeOne, selectCart } from '../../features/cart/cartSlice';
import { selectUser } from '../../features/auth/authSlice';
import { calcOrderTotal, formatPrice } from '../../utils/formatters';
import CheckoutModal from './CheckoutModal';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar({ restaurantId, restaurantName, onRequireAuth, onOrderPlaced }) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  const cartTotal =
    cart.restaurantId === restaurantId
      ? cart.items.reduce((s, i) => s + i.price * i.qty, 0)
      : 0;
  const cartCount =
    cart.restaurantId === restaurantId
      ? cart.items.reduce((s, i) => s + i.qty, 0)
      : 0;
  const totals = calcOrderTotal(cartTotal);

  const handleAdd = (item) => {
    dispatch(addToCart({ item, restaurantId, restaurantName }));
  };

  const handleCheckout = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setShowCheckout(true);
  };

  return (
    <div className="cart-panel">
      <div className="cart-header">
        🛒 Your Order {cartCount > 0 && `(${cartCount} items)`}
      </div>
      {cartCount === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🍽️</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Your cart is empty</div>
          <div style={{ fontSize: '0.8rem' }}>Add items to get started</div>
        </div>
      ) : (
        <>
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="qty-ctrl" style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => dispatch(removeOne(item.id))}
                >
                  −
                </button>
                <span className="qty-num">{item.qty}</span>
                <button type="button" className="qty-btn" onClick={() => handleAdd(item)}>
                  +
                </button>
              </div>
              <div className="ci-name">{item.name}</div>
              <div className="ci-price">{formatPrice(item.price * item.qty)}</div>
            </div>
          ))}
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Item Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-total-row">
              <span>Delivery</span>
              <span>{formatPrice(totals.delivery)}</span>
            </div>
            <div className="cart-total-row big">
              <span>Total</span>
              <span>{formatPrice(totals.grandTotal)}</span>
            </div>
            <button type="button" className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        </>
      )}
      {showCheckout && (
        <CheckoutModal
          total={cartTotal}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            onOrderPlaced?.();
            navigate("/orders");

          }}
        />
      )}
    </div>
  );
}
