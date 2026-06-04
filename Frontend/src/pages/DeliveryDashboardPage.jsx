import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { useSelector } from 'react-redux';
import { apiRequest } from '../services/apiClient';
import { selectUser } from '../features/auth/authSlice';
import { deliveryRateSchema } from '../utils/validationSchemas';
import { formatPrice, formatStatus } from '../utils/formatters';
import FormField from '../components/common/FormField';
import Loading from '../components/common/Loading';

const DRIVER_FLOW = [
  { key: 'assigned', label: 'Assigned', next: 'picked_up', action: 'Mark picked up' },
  { key: 'picked_up', label: 'Picked up', next: 'in_transit', action: 'Start delivery' },
  { key: 'in_transit', label: 'On the way', next: 'delivered', action: 'Mark delivered' },
];

export default function DeliveryDashboardPage() {
  const user = useSelector(selectUser);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [ratingId, setRatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/delivery/partner/deliveries');
      setDeliveries(data);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'delivery_partner') load();
    else setLoading(false);
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/delivery/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(`Updated: ${formatStatus(status)}`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const getNextAction = (status) => DRIVER_FLOW.find((s) => s.key === status);

  if (!user || user.role !== 'delivery_partner') {
    return (
      <div className="dashboard-page">
        <div className="no-results">
          Delivery partner access only. Log in as a driver account.
        </div>
      </div>
    );
  }

  if (loading) return <Loading label="Loading deliveries..." />;

  return (
    <div className="dashboard-page">
      <div className="cart-page-header">Delivery Dashboard 🛵</div>
      <p style={{ fontSize: '0.85rem', color: '#686b78', marginBottom: 12 }}>
        Assigned orders from restaurant owners appear here. Update status as you pick up and deliver.
      </p>
      {message && <div className="field-error" style={{ marginBottom: 12 }}>{message}</div>}

      <button type="button" className="filter-btn" onClick={load} style={{ marginBottom: 16 }}>
        Refresh
      </button>

      {deliveries.length === 0 ? (
        <div className="no-results">No deliveries assigned yet. Ask the restaurant owner to assign you.</div>
      ) : (
        deliveries.map((d) => {
          const order = d.order;
          const next = getNextAction(d.status);
          return (
            <div key={d.id} className="order-card">
              <div className="oc-header">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    Order #{order?.order_number || d.order_id}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#686b78' }}>
                    {order?.Restaurant?.name || 'Restaurant'} · {formatStatus(d.status)}
                  </div>
                </div>
                {order?.total_price && (
                  <strong>{formatPrice(order.total_price)}</strong>
                )}
              </div>
              <div className="oc-body">
                <div className="oc-address" style={{ marginBottom: 12 }}>
                  📍 Deliver to: {order?.delivery_address || '—'}
                </div>
                {next && d.status !== 'delivered' && (
                  <button
                    type="button"
                    className="reorder-btn"
                    onClick={() => updateStatus(d.id, next.next)}
                  >
                    {next.action} →
                  </button>
                )}
                {d.status === 'delivered' && !d.delivery_rating && (
                  <button
                    type="button"
                    className="filter-btn"
                    style={{ marginTop: 8 }}
                    onClick={() => setRatingId(d.id)}
                  >
                    Rate this delivery
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {ratingId && (
        <div className="dashboard-card" style={{ marginTop: 20 }}>
          <div className="section-title" style={{ fontSize: '1.1rem' }}>
            Rate Delivery #{ratingId}
          </div>
          <Formik
            initialValues={{ rating: 5, review: '' }}
            validationSchema={deliveryRateSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await apiRequest(`/delivery/${ratingId}/rate`, {
                  method: 'POST',
                  body: JSON.stringify(values),
                });
                setMessage('Rating submitted');
                setRatingId(null);
                load();
              } catch (err) {
                setMessage(err.message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(formik) => (
              <Form>
                <FormField label="Rating (1-5)" name="rating" type="number" formik={formik} />
                <FormField label="Review" name="review" formik={formik} as="textarea" rows={2} />
                <button className="save-btn" type="submit" disabled={formik.isSubmitting}>
                  Submit Rating
                </button>
                <button
                  type="button"
                  className="nav-btn nav-btn-ghost"
                  style={{ marginTop: 8 }}
                  onClick={() => setRatingId(null)}
                >
                  Cancel
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}
