import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/apiClient';
import { mapMenuItem } from '../../utils/formatters';

export const fetchMenuByRestaurant = createAsyncThunk(
  'menu/fetchMenuByRestaurant',
  async (restaurantId, thunkApi) => {
    try {
      const query = restaurantId ? `?restaurant_id=${restaurantId}` : '';
      const data = await apiRequest(`/menu${query}`);
      if (!Array.isArray(data)) throw new Error('Invalid response from server');
      return { restaurantId, items: data.map(mapMenuItem) };
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to load menu');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    byRestaurantId: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearMenuError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuByRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuByRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        const { restaurantId, items } = action.payload || {};
        if (restaurantId) state.byRestaurantId[restaurantId] = items || [];
      })
      .addCase(fetchMenuByRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to load menu';
      });
  },
});

export const { clearMenuError } = menuSlice.actions;

export const selectMenuByRestaurant = (restaurantId) => (state) =>
  state.menu.byRestaurantId[restaurantId] || [];
export const selectMenuLoading = (state) => state.menu.loading;
export const selectMenuError = (state) => state.menu.error;

export default menuSlice.reducer;

