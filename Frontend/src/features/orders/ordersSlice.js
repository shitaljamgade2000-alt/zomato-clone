import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/apiClient';

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, thunkApi) => {
  try {
    const data = await apiRequest('/orders');
    if (!Array.isArray(data)) throw new Error('Invalid response from server');
    return data;
  } catch (e) {
    return thunkApi.rejectWithValue(e?.message || 'Failed to load orders');
  }
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (payload, thunkApi) => {
  try {
    return await apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) });
  } catch (e) {
    return thunkApi.rejectWithValue(e?.data?.message || e?.message || 'Failed to place order');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (id, thunkApi) => {
  try {
    await apiRequest(`/orders/${id}/cancel`, { method: 'PATCH' });
    return id;
  } catch (e) {
    return thunkApi.rejectWithValue(e?.data?.message || e?.message || 'Failed to cancel order');
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
    placing: false,
    placeError: null,
  },
  reducers: {
    clearOrdersError(state) {
      state.error = null;
      state.placeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload || action.error?.message || 'Failed to load orders';
      })
      .addCase(placeOrder.pending, (state) => {
        state.placing = true;
        state.placeError = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.placing = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.placeError = action.payload || action.error?.message || 'Failed to place order';
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.items = state.items.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o));
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to cancel order';
      });
  },
});

export const { clearOrdersError } = ordersSlice.actions;

export const selectOrders = (state) => state.orders.items;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectPlacingOrder = (state) => state.orders.placing;
export const selectPlaceOrderError = (state) => state.orders.placeError;

export default ordersSlice.reducer;

