import { useDispatch, useSelector } from 'react-redux';
import { selectCity, selectCities, selectShowPicker, setCity, setShowPicker } from '../../features/location/locationSlice';

export default function LocationPicker() {
  const dispatch = useDispatch();
  const city = useSelector(selectCity);
  const cities = useSelector(selectCities);
  const showPicker = useSelector(selectShowPicker);

  if (!showPicker) return null;

  return (
    <div className="loc-overlay" onClick={() => dispatch(setShowPicker(false))}>
      <div className="loc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="loc-modal-header">
          <h3>Select your location</h3>
          <button
            type="button"
            className="auth-close"
            onClick={() => dispatch(setShowPicker(false))}
          >
            ✕
          </button>
        </div>
        <p className="loc-modal-sub">Choose a city to see restaurants near you</p>
        <div className="loc-grid">
          {cities.map((c) => (
            <button
              key={c}
              type="button"
              className={`loc-city-btn${city === c ? ' active' : ''}`}
              onClick={() => dispatch(setCity(c))}
            >
              📍 {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
