import { useSelector } from 'react-redux';
import { selectCart, selectCartCount, selectCartTotal } from '../../features/cart/cartSlice';
import { calcOrderTotal, formatPrice } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function FloatingCartBar({ visible }) {
  const navigate = useNavigate();
  const cart = useSelector(selectCart);
  const count = useSelector(selectCartCount);
  const total = useSelector(selectCartTotal);


  if (!visible || count === 0) return null;

  const totals = calcOrderTotal(total);

  return (
    <div className="floating-cart">
      <div className="floating-cart-inner">
        <div className="floating-cart-info">
          <strong>{cart.restaurantName}</strong>
          <span>
            {count} item{count > 1 ? 's' : ''} · {formatPrice(totals.grandTotal)}
          </span>
        </div>
        <button type="button" className="floating-cart-btn" onClick={() => navigate('/cart')}>
          View Cart →
        </button>
      </div>
    </div>
  );
}
