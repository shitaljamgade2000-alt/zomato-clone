import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCity } from '../features/location/locationSlice';
import { CATEGORIES } from '../utils/constants';
import { fetchRestaurants, selectRestaurants, selectRestaurantsError, selectRestaurantsLoading } from '../features/restaurants/restaurantsSlice';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import Loading from '../components/common/Loading';
import { useNavigate } from 'react-router-dom';

function filterByCity(restaurants, city) {
  if (!city || !restaurants.length) return restaurants;

  const aliases = {
    'delhi ncr': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'noida'],
    bangalore: ['bangalore', 'bengaluru'],
    mumbai: ['mumbai', 'bombay'],
    hyderabad: ['hyderabad'],
    chennai: ['chennai', 'madras'],
    pune: ['pune'],
    ahmedabad: ['ahmedabad'],
  };


  const cityLower = city.toLowerCase();
  const keys = aliases[cityLower] || [cityLower.split(' ')[0]];

  const inCity = restaurants.filter((r) => {
    const address = (r.address || '').toLowerCase();
    return keys.some((key) => address.includes(key));
  });

  return inCity.length > 0 ? inCity : restaurants;
}

export default function HomePage({ search, onSearchChange }) {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const city = useSelector(selectCity);
  const restaurants = useSelector(selectRestaurants);
  const loading = useSelector(selectRestaurantsLoading);
  const error = useSelector(selectRestaurantsError);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const cityRestaurants = useMemo(
    () => filterByCity(restaurants, city),
    [restaurants, city]
  );

  const topPicks = useMemo(
    () => [...cityRestaurants].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [cityRestaurants]
  );

  const filtered = cityRestaurants.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !activeCategory || r.cuisine.toLowerCase().includes(activeCategory.toLowerCase());
    const matchFilter =
      !activeFilter ||
      (activeFilter === 'veg' && r.isVeg) ||
      (activeFilter === 'rating' && r.rating >= 4.3) ||
      (activeFilter === 'fast' && r.deliveryTime <= 30) ||
      (activeFilter === 'promoted' && r.promoted);
    return matchSearch && matchCat && matchFilter;
  });

  const openRestaurant = (r) => {
    navigate(`/restaurant/${r.id}`);
  };

  if (loading) return <Loading label="Finding restaurants near you..." />;

  return (
    <div>
      <div className="hero">
        <div className="hero-inner">
          <h1>
            Discover the Best Food & Drinks in India
          </h1>
          <p>Order from top restaurants in {city} — fast delivery, great offers</p>
          <div className="hero-search">
            <input
              placeholder="Search for restaurant, cuisine or a dish"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button type="button">Search</button>
          </div>
        </div>
      </div>

      <div className="offers-strip">
        <div className="offers-inner">
          <div className="offer-card">🏷️ Flat 50% off · First order</div>
          <div className="offer-card">🛵 Free delivery above ₹199</div>
          <div className="offer-card">⭐ Top rated picks near you</div>
          <div className="offer-card">💳 Pay via UPI, Card or COD</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">What&apos;s on your mind?</div>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              className={`cat${activeCategory === c.name ? ' active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
              role="button"
              tabIndex={0}
            >
              <div className="cat-icon">{c.emoji}</div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {topPicks.length > 0 && (
        <>
          <div className="section-divider" />
          <div className="section">
            <div className="section-title">
              Top picks in {city} ⭐
            </div>
            <div className="r-grid r-grid-compact">
              {topPicks.map((r) => (
                <RestaurantCard key={`top-${r.id}`} restaurant={r} onClick={() => openRestaurant(r)} />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="section-divider" />

      <div className="section">
        <div className="section-title">
          Restaurants delivering to you
          <span className="section-count">{filtered.length} places</span>
        </div>

        {error && <div className="field-error section-error">{error}</div>}

        <div className="filters">
          {[
            ['veg', '🥗 Pure Veg'],
            ['fast', '⚡ Fast Delivery'],
            ['rating', '⭐ Top Rated'],
            ['promoted', '🔥 Best Offers'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`filter-btn${activeFilter === key ? ' active' : ''}`}
              onClick={() => setActiveFilter(activeFilter === key ? null : key)}
            >
              {label}
            </button>
          ))}
          {(activeCategory || activeFilter) && (
            <button
              type="button"
              className="filter-btn filter-clear"
              onClick={() => {
                setActiveCategory(null);
                setActiveFilter(null);
              }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🍽️</div>
            <div className="no-results-title">No restaurants found</div>
            <div className="no-results-sub">
              {restaurants.length === 0
                ? 'Restaurants will appear here once added to the platform.'
                : 'Try changing location, filters, or search term.'}
            </div>
          </div>
        ) : (
          <div className="r-grid">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onClick={() => openRestaurant(r)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
