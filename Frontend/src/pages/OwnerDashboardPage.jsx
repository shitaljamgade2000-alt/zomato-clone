import { useCallback, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { useSelector } from 'react-redux';
import { apiRequest } from '../services/apiClient';
import { selectUser } from '../features/auth/authSlice';
import { restaurantSchema, menuItemSchema } from '../utils/validationSchemas';
import { formatPrice } from '../utils/formatters';
import FormField from '../components/common/FormField';
import Loading from '../components/common/Loading';
import OwnerOrdersPanel from '../components/owner/OwnerOrdersPanel';

export default function OwnerDashboardPage() {
  const user = useSelector(selectUser);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('restaurants');
  const [message, setMessage] = useState('');

  // const [imagePreview, setImagePreview] = useState('');

  // useEffect(() => {
  //   return () => {
  //     if (imagePreview) {
  //       URL.revokeObjectURL(imagePreview);
  //     }
  //   };
  // }, [imagePreview]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/restaurants/my-restaurants');
      setRestaurants(data);
      if (data.length && !selectedId) setSelectedId(data[0].id);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  const loadMenu = async (restaurantId) => {
    if (!restaurantId) return;
    const data = await apiRequest(`/menu?restaurant_id=${restaurantId}`);
    setMenu(data);
  };

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  useEffect(() => {
    if (selectedId) loadMenu(selectedId);
  }, [selectedId]);

  if (!user || user.role !== 'restaurant_owner') {
    return (
      <div className="dashboard-page">
        <div className="no-results">Restaurant owner access only.</div>
      </div>
    );
  }

  if (loading) return <Loading label="Loading dashboard..." />;

  return (
    <div className="dashboard-page">
      <div className="cart-page-header">Owner Dashboard 🏪</div>
      {message && <div className="field-success" style={{ marginBottom: 12 , color:'green' }}>{message}</div>}

      <div className="dashboard-tabs">
        {['restaurants', 'add-restaurant', 'menu', 'orders'].map((t) => (
          <button
            key={t}
            type="button"
            className={`filter-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'restaurants' && (
        <div className="dashboard-card">
          <div className="section-title" style={{ fontSize: '1.1rem' }}>My Restaurants</div>
          {restaurants.length === 0 ? (
            <p>No restaurants yet. Add one in the &quot;add restaurant&quot; tab.</p>
          ) : (
            restaurants.map((r) => (
              <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid #e9e9eb' }}>
                <strong>{r.name}</strong> — {r.cuisine}
                <button
                  type="button"
                  className="filter-btn"
                  style={{ marginLeft: 12 }}
                  onClick={() => {
                    setSelectedId(r.id);
                    setTab('menu');
                  }}
                >
                  Manage Menu
                </button>
                <button
                  type="button"
                  className="filter-btn"
                  style={{ marginLeft: 8 }}
                  onClick={async () => {
                    if (window.confirm('Delete restaurant?')) {
                      await apiRequest(`/restaurants/${r.id}`, { method: 'DELETE' });
                      load();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'add-restaurant' && (
        <div className="dashboard-card">
          <div className="section-title" style={{ fontSize: '1.1rem' }}></div>
          <Formik
            initialValues={{
              name: '',
              cuisine: '',
              address: '',
              description: '',
              phone: '',
              email: '',


            }}
            validationSchema={restaurantSchema}
            onSubmit={async (values, { resetForm, setSubmitting }) => {
              try {
                await apiRequest('/restaurants', {
                  method: 'POST', body: JSON.stringify(values)

                });
                setMessage('Restaurant created');
                resetForm();
                await load();
                setTab('restaurants');
              } catch (err) {
                setMessage(err.message);
              } finally {
                setSubmitting(false);
              }
            }}
          // onSubmit={async (values, { resetForm, setSubmitting }) => {
          //   try {
          //     const formData = new FormData();

          //     formData.append('name', values.name);
          //     formData.append('cuisine', values.cuisine);
          //     formData.append('address', values.address);
          //     formData.append('description', values.description);
          //     formData.append('phone', values.phone);
          //     formData.append('email', values.email);

          //     if (values.image) {
          //       formData.append('image', values.image);
          //     }

          //     await apiRequest('/restaurants', {
          //       method: 'POST',
          //       body: formData,
          //     });

          //     setMessage('Restaurant created');
          //     resetForm();
          //     setImagePreview('');

          //     await load();
          //     setTab('restaurants');
          //   } catch (err) {
          //     setMessage(err.message);
          //   } finally {
          //     setSubmitting(false);
          //   }
          // }}
          >
            {(formik) => (
              <Form>
                <FormField label="Name" name="name" formik={formik} />
                <FormField label="Cuisine" name="cuisine" formik={formik} />
                <FormField label="Address" name="address" formik={formik} />
                <FormField label="Description" name="description" formik={formik} as="textarea" rows={2} />
                <FormField label="Phone" name="phone" formik={formik} />
                <FormField label="Email" name="email" formik={formik} type="email" />
                {/* <FormField
                  label="Restaurant Image URL"
                  name="image"
                  formik={formik}
                /> */}
                {/* <div><label htmlFor="image" style={{ fontSize: "14px" }}>Restaurant Image</label><br />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (!file) return;

                      setImagePreview(URL.createObjectURL(file));

                      formik.setFieldValue('image', file);
                    }}
                  />
                  <br />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: 250,
                        marginTop: 10,
                        borderRadius: 10,
                      }}
                    />
                  )}
                </div> */}

                <button className="save-btn" type="submit" disabled={formik.isSubmitting}>
                  Create Restaurant
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {tab === 'menu' && (
        <div className="dashboard-card">
          <div className="section-title" style={{ fontSize: '1.1rem' }}>Menu Management</div>
          {restaurants.length > 0 && (
            <select
              className="input-field"
              value={selectedId || ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              style={{ marginBottom: 16 }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
          {menu.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>
                {item.name} — {formatPrice(item.price)} ({item.availability ? 'Available' : 'Hidden'})
              </span>
              <button
                type="button"
                className="filter-btn"
                onClick={() =>
                  apiRequest(`/menu/${item.id}/toggle-availability`, { method: 'PATCH' }).then(() =>
                    loadMenu(selectedId)
                  )
                }
              >
                Toggle
              </button>
            </div>
          ))}
          <Formik
            initialValues={{ name: '', description: '', price: '', category: '', vegetarian: false, image: '', }}
            validationSchema={menuItemSchema}
            onSubmit={async (values, { resetForm, setSubmitting }) => {
              try {
                await apiRequest('/menu', {
                  method: 'POST',
                  body: JSON.stringify({
                    restaurant_id: selectedId,
                    name: values.name,
                    description: values.description,
                    price: Number(values.price),
                    category: values.category,
                    image: values.image,
                    vegetarian: values.vegetarian,
                  }),
                });
                resetForm();
                loadMenu(selectedId);

                setMessage('Menu item added');

                setTimeout(() => setMessage(''), 3000);
              } catch (err) {
                setMessage(err.message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(formik) => (
              <Form style={{ marginTop: 20 }}>
                <FormField label="Item Name" name="name" formik={formik} />
                <FormField label="Description" name="description" formik={formik} />
                <FormField label="Price" name="price" type="number" formik={formik} />
                <FormField label="Category" name="category" formik={formik} />
                <FormField label="Image URL" name="image" formik={formik} />
                <label style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input type="checkbox" name="vegetarian" checked={formik.values.vegetarian} onChange={formik.handleChange} />
                  Vegetarian
                </label>
                <button className="save-btn" type="submit" disabled={!selectedId || formik.isSubmitting}>
                  Add Menu Item
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {tab === 'orders' && (
        <div className="dashboard-card">
          <OwnerOrdersPanel restaurantId={selectedId} restaurants={restaurants} />
        </div>
      )}
    </div>
  );
}
