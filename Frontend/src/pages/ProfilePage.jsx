import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, logout as logoutAction, selectAuth, selectUser } from '../features/auth/authSlice';
import { ROLES } from '../utils/constants';
import Loading from '../components/common/Loading';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const auth = useSelector(selectAuth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const profile = await dispatch(fetchProfile()).unwrap();
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err?.message || 'Failed to sync profile');
    } finally {
      setLoading(false);
    }
  };

  if (auth.loading) return <Loading />;
  if (!user) {
    return (
      <div className="profile-page">
        <div className="no-results" style={{ paddingTop: 80 }}>
          <div className="no-results-icon">👤</div>
          <div className="no-results-title">Your profile</div>
          <div className="no-results-sub">Log in to manage your account and saved address</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <button type="button" className="back-btn" onClick={() => navigate('/')}>
        ← Back to Home
      </button>
      <div className="profile-card">
        <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>

        <div className="profile-quick-links">
          <button type="button" className="profile-link-btn" onClick={() => navigate('/orders')}>
            📦 My Orders
          </button>
          <button type="button" className="profile-link-btn" onClick={() => navigate('/cart')}>
            🛒 My Cart
          </button>
          {user.role === ROLES.OWNER && (
            <button type="button" className="profile-link-btn" onClick={() => navigate('/owner')}>
              🏪 Partner Dashboard
            </button>
          )}
          {user.role === ROLES.DELIVERY && (
            <button type="button" className="profile-link-btn" onClick={() => navigate('/delivery')}>
              🛵 Delivery Dashboard
            </button>
          )}
        </div>

        <div className="profile-section-title">Account details</div>
        {['name', 'email', 'phone', 'address'].map((key) => (
          <div key={key} className="input-group">
            <label className="input-label">
              {key === 'address' ? 'Saved delivery address' : key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              className="input-field"
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              readOnly={key === 'email'}
            />
          </div>
        ))}
        {saved && (
          <div className="profile-saved-msg">✅ Profile synced successfully</div>
        )}
        <button type="button" className="save-btn" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Syncing...' : 'Sync Profile'}
        </button>
        <button
          type="button"
          className="profile-signout"
          onClick={() => {
            dispatch(logoutAction());
            navigate('/');
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
