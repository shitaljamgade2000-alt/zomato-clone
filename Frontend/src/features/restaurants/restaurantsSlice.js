import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/apiClient';
import { mapRestaurant } from '../../utils/formatters';

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (_, thunkApi) => {
    try {
      const data = await apiRequest('/restaurants');
      if (!Array.isArray(data)) throw new Error('Invalid response from server');
      return data.map(mapRestaurant);
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to load restaurants');
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchRestaurantById',
  async (id, thunkApi) => {
    try {
      const data = await apiRequest(`/restaurants/${id}`);
      return mapRestaurant(data);
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to load restaurant');
    }
  }
);

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState: {
    items: [],
    byId: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.byId = (action.payload || []).reduce((acc, r) => {
          acc[r.id] = r;
          return acc;
        }, {});
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error =
          action.payload ||
          (action.error?.message?.includes('fetch') || action.error?.message === 'Failed to fetch'
            ? 'Cannot reach backend API. Start the Backend server (npm start in Backend folder) and check REACT_APP_API_URL in Frontend/.env matches Backend PORT.'
            : action.error?.message || 'Failed to load restaurants');
      })
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        const r = action.payload;
        if (r?.id) {
          state.byId[r.id] = r;
          const exists = state.items.some((x) => x.id === r.id);
          if (!exists) state.items.push(r);
        }
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to load restaurant';
      });
  },
});

export const selectRestaurants = (state) => state.restaurants.items;
export const selectRestaurantById = (id) => (state) => state.restaurants.byId[id];
export const selectRestaurantsLoading = (state) => state.restaurants.loading;
export const selectRestaurantsError = (state) => state.restaurants.error;

export default restaurantsSlice.reducer;

