import VegIcon from '../common/VegIcon';

export default function RestaurantCard({ restaurant, onClick }) {
  return (
    <div className="r-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="r-img">
        <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
        {restaurant.promoted && <div className="r-promoted">PROMOTED</div>}
        {restaurant.offer && <div className="r-offer">🏷️ {restaurant.offer}</div>}
      </div>
      <div className="r-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="r-name">{restaurant.name}</div>
          {restaurant.isVeg && <VegIcon isVeg />}
        </div>
        <div className="r-cuisine">{restaurant.cuisine}</div>
        <div className="r-meta">
          <span className="r-rating">⭐ {Number(restaurant.rating).toFixed(1)}</span>
          <span className="r-dot">•</span>
          <span>🕐 {restaurant.deliveryTime} mins</span>
          <span className="r-dot">•</span>
          <span>₹{restaurant.costForTwo} for 2</span>
        </div>
      </div>
    </div>
  );
}
