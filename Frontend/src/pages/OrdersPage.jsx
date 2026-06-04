import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import { cancelOrder as cancelOrderThunk, fetchMyOrders, selectOrders, selectOrdersError, selectOrdersLoading } from '../features/orders/ordersSlice';
import { formatPrice, formatStatus } from '../utils/formatters';
import Loading from '../components/common/Loading';
import OrderTracker from '../components/orders/OrderTracker';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage({ onRequireAuth }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const [tab, setTab] = useState('active');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    dispatch(fetchMyOrders());
    // const interval = setInterval(() => dispatch(fetchMyOrders()), 15000);
    // return () => clearInterval(interval);
  }, [dispatch, user]);

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await dispatch(cancelOrderThunk(id)).unwrap();
    } catch (err) {
      alert(err?.message || 'Failed to cancel order');
    }
  };

  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  );
  const displayOrders = tab === 'active' ? activeOrders : pastOrders;

  if (!user) {
    return (
      <div className="orders-page">
        <div className="no-results" style={{ paddingTop: 80 }}>
          <div className="no-results-icon">📦</div>
          <div className="no-results-title">Track your orders</div>
          <div className="no-results-sub">Sign in to view order history and live tracking</div>
          <button type="button" className="reorder-btn" onClick={onRequireAuth}>
            Log in
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <Loading label="Loading your orders..." />;

  return (
    <div className="orders-page">
      <div className="cart-page-header">Your Orders</div>
      <p className="orders-subtitle">Track live status and reorder from your favourites</p>

      {error && <div className="field-error section-error">{error}</div>}

      <div className="orders-tabs">
        <button
          type="button"
          className={`filter-btn${tab === 'active' ? ' active' : ''}`}
          onClick={() => setTab('active')}
        >
          Active ({activeOrders.length})
        </button>
        <button
          type="button"
          className={`filter-btn${tab === 'past' ? ' active' : ''}`}
          onClick={() => setTab('past')}
        >
          Past ({pastOrders.length})
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">📦</div>
          <div className="no-results-title">
            {tab === 'active' ? 'No active orders' : 'No past orders'}
          </div>
          <div className="no-results-sub">
            {tab === 'active'
              ? 'Hungry? Browse restaurants and place your first order!'
              : 'Your completed orders will show up here.'}
          </div>
          {tab === 'active' && (
            <button type="button" className="reorder-btn" onClick={() => navigate('/')}>
              Order Food
            </button>
          )}
        </div>
      ) : (
        displayOrders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="oc-header">
              <span className="oc-icon">🍽️</span>
              <div className="oc-meta">
                <div className="oc-title">Order #{o.order_number}</div>
                <div className="oc-date">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="oc-address">📍 {o.delivery_address}</div>
              </div>
              <span className={`oc-status ${o.status}`}>{formatStatus(o.status)}</span>
            </div>
            <div className="oc-body">
              {tab === 'active' && o.status !== 'cancelled' && (
                <OrderTracker status={o.status} />
              )}
              {o.delivery && (
                <div className="delivery-badge" style={{ marginBottom: 10 }}>
                  🛵 {o.delivery.partner?.name || 'Driver assigned'} — {formatStatus(o.delivery.status)}
                </div>
              )}
              <div className="oc-items">
                {o.items?.map((item) => (
                  <span key={item.id} className="oc-item-chip">
                    Item × {item.quantity}
                  </span>
                ))}
              </div>
              <div className="oc-footer">
                <div>
                  <div className="oc-total">{formatPrice(o.total_price)}</div>
                  <div className="oc-payment">Paid via {o.payment_method?.toUpperCase()}</div>
                </div>
                <div className="oc-actions">
                  <button
                    type="button"
                    className="nav-btn nav-btn-ghost"
                    onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  >
                    {expandedId === o.id ? 'Hide' : 'Details'}
                  </button>
                  {!['delivered', 'cancelled'].includes(o.status) && (
                    <button type="button" className="nav-btn nav-btn-ghost" onClick={() => cancelOrder(o.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              {expandedId === o.id && (
                <div className="oc-details">
                  <p><strong>Special instructions:</strong> {o.special_instructions || 'None'}</p>
                  <p><strong>Payment status:</strong> {formatStatus(o.payment_status || 'pending')}</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
