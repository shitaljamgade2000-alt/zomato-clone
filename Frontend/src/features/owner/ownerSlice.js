import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/apiClient';

export const fetchOwnerOrders = createAsyncThunk(
  'owner/fetchOwnerOrders',
  async (restaurantId, thunkApi) => {
    try {
      if (!restaurantId || restaurantId === 'all') {
        return await apiRequest('/orders/owner');
      }
      return await apiRequest(`/orders/owner/restaurant/${restaurantId}`);
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to load orders');
    }
  }
);

export const fetchDeliveryPartners = createAsyncThunk(
  'owner/fetchDeliveryPartners',
  async (_, thunkApi) => {
    try {
      return await apiRequest('/users/delivery-partners');
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to load drivers');
    }
  }
);

export const updateOwnerOrderStatus = createAsyncThunk(
  'owner/updateOrderStatus',
  async ({ orderId, status }, thunkApi) => {
    try {
      const data = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return data.order;
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to update order');
    }
  }
);

export const assignDriver = createAsyncThunk(
  'owner/assignDriver',
  async ({ orderId, deliveryPartnerId }, thunkApi) => {
    try {
      await apiRequest('/delivery/assign', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          delivery_partner_id: deliveryPartnerId,
        }),
      });
      return { orderId, deliveryPartnerId };
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to assign driver');
    }
  }
);

const ownerSlice = createSlice({
  name: 'owner',
  initialState: {
    orders: [],
    partners: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOwnerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchOwnerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
        state.partners = action.payload || [];
      })
      .addCase(updateOwnerOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.orders = state.orders.map((o) => (o.id === updated.id ? updated : o));
      })
      .addCase(assignDriver.fulfilled, (state, action) => {
        const { orderId } = action.payload;
        state.orders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'ready' } : o
        );
      });
  },
});

export const { clearOwnerError } = ownerSlice.actions;
export const selectOwnerOrders = (state) => state.owner.orders;
export const selectDeliveryPartners = (state) => state.owner.partners;
export const selectOwnerLoading = (state) => state.owner.loading;
export const selectOwnerError = (state) => state.owner.error;

export default ownerSlice.reducer;
