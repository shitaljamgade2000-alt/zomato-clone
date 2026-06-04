import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  assignDriver,
  fetchDeliveryPartners,
  fetchOwnerOrders,
  selectDeliveryPartners,
  selectOwnerError,
  selectOwnerLoading,
  selectOwnerOrders,
  updateOwnerOrderStatus,
} from '../../features/owner/ownerSlice';
import { formatPrice, formatStatus } from '../../utils/formatters';
import Loading from '../common/Loading';

const KITCHEN_STATUSES = ['confirmed', 'preparing', 'ready'];

export default function OwnerOrdersPanel({ restaurantId, restaurants = [] }) {
  const dispatch = useDispatch();
  const allOrders = useSelector(selectOwnerOrders);
  const partners = useSelector(selectDeliveryPartners);
  const loading = useSelector(selectOwnerLoading);
  const error = useSelector(selectOwnerError);
  const [assigning, setAssigning] = useState({});
  const [partnerPick, setPartnerPick] = useState({});
  const [filterId, setFilterId] = useState(restaurantId || 'all');

  useEffect(() => {
    setFilterId(restaurantId || 'all');
  }, [restaurantId]);

  useEffect(() => {
    dispatch(fetchOwnerOrders('all'));
    dispatch(fetchDeliveryPartners());
  }, [dispatch]);

  const orders = useMemo(() => {
    if (!filterId || filterId === 'all') return allOrders;
    const id = Number(filterId);
    return allOrders.filter((o) => Number(o.restaurant_id) === id);
  }, [allOrders, filterId]);

  const refresh = () => dispatch(fetchOwnerOrders('all'));

  const handleStatus = async (orderId, status) => {
    await dispatch(updateOwnerOrderStatus({ orderId, status })).unwrap();
    refresh();
  };

  const handleAssign = async (orderId) => {
    const partnerId = Number(partnerPick[orderId]);
    if (!partnerId) return;
    setAssigning((s) => ({ ...s, [orderId]: true }));
    try {
      await dispatch(assignDriver({ orderId, deliveryPartnerId: partnerId })).unwrap();
      refresh();
    } finally {
      setAssigning((s) => ({ ...s, [orderId]: false }));
    }
  };

  if (loading && allOrders.length === 0) {
    return <Loading label="Loading orders..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div className="section-title" style={{ fontSize: '1.1rem', margin: 0 }}>
          Live Orders ({orders.length})
        </div>
        <button type="button" className="filter-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {restaurants.length > 0 && (
        <select
          className="input-field"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 320 }}
        >
          <option value="all">All my restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}

      {restaurants.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: '#686b78', marginBottom: 12 }}>
          You have no restaurants yet. Customers order from restaurants in the app — only orders for{' '}
          <strong>your</strong> restaurants appear here. Add a restaurant or order from your own
          restaurant while testing.
        </p>
      )}

      {partners.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: '#686b78', marginBottom: 12 }}>
          No delivery partners yet. Run <code>npm run seed:driver</code> in Backend or sign up a driver.
        </p>
      )}

      {orders.length === 0 ? (
        <div className="no-results">
          No orders yet{filterId !== 'all' ? ' for this restaurant' : ''}.
          {restaurants.length > 0 && (
            <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
              Tip: place a test order from a restaurant you own (same owner account or use &quot;All my
              restaurants&quot;).
            </p>
          )}
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card" style={{ marginBottom: 12 }}>
            <div className="oc-header">
              <div className="oc-meta">
                <div className="oc-title">#{order.order_number}</div>
                <div className="oc-date">
                  {order.Restaurant?.name || `Restaurant #${order.restaurant_id}`} ·{' '}
                  {order.customer?.name || 'Customer'} · {formatPrice(order.total_price)}
                </div>
                <div className="oc-date" style={{ fontSize: '0.75rem' }}>
                  Paid via {order.payment_method === 'stripe' ? '💳 Stripe' : order.payment_method} ·{' '}
                  {formatStatus(order.payment_status || 'pending')}
                </div>
                <div className="oc-address">📍 {order.delivery_address}</div>
              </div>
              <span className={`oc-status ${order.status}`}>{formatStatus(order.status)}</span>
            </div>

            <div className="oc-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {KITCHEN_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`filter-btn${order.status === s ? ' active' : ''}`}
                    onClick={() => handleStatus(order.id, s)}
                    disabled={['delivered', 'cancelled'].includes(order.status)}
                  >
                    {formatStatus(s)}
                  </button>
                ))}
              </div>

              {order.delivery ? (
                <div className="delivery-badge" style={{ marginBottom: 12 }}>
                  🛵 Driver: {order.delivery.partner?.name || 'Assigned'} —{' '}
                  {formatStatus(order.delivery.status)}
                </div>
              ) : (
                !['delivered', 'cancelled'].includes(order.status) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      className="input-field"
                      style={{ maxWidth: 220 }}
                      value={partnerPick[order.id] || ''}
                      onChange={(e) =>
                        setPartnerPick((p) => ({ ...p, [order.id]: e.target.value }))
                      }
                    >
                      <option value="">Assign driver...</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone || p.email})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="reorder-btn"
                      disabled={!partnerPick[order.id] || assigning[order.id]}
                      onClick={() => handleAssign(order.id)}
                    >
                      {assigning[order.id] ? 'Assigning...' : 'Assign & dispatch'}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
