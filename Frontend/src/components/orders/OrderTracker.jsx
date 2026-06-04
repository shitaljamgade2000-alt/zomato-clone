import { ORDER_TRACKING_STEPS } from '../../utils/constants';

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="order-tracker cancelled">
        <span>❌ Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = ORDER_TRACKING_STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="order-tracker">
      {ORDER_TRACKING_STEPS.map((step, index) => {
        const done = index <= activeIndex;
        const active = index === activeIndex;
        return (
          <div key={step.key} className={`track-step${done ? ' done' : ''}${active ? ' active' : ''}`}>
            <div className="track-dot">{step.icon}</div>
            <div className="track-label">{step.label}</div>
            {index < ORDER_TRACKING_STEPS.length - 1 && (
              <div className={`track-line${index < activeIndex ? ' filled' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
