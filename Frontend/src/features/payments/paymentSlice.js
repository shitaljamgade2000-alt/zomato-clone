import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/apiClient';

export const createPaymentIntent = createAsyncThunk(
  'payments/createPaymentIntent',
  async (amountPaise, thunkApi) => {
    try {
      return await apiRequest('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ amount: amountPaise }),
      });
    } catch (e) {
      return thunkApi.rejectWithValue(e?.message || 'Failed to start payment');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    clientSecret: null,
    paymentIntentId: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPayment(state) {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload?.clientSecret || null;
        state.paymentIntentId = action.payload?.paymentIntentId || null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to start payment';
      });
  },
});

export const { clearPayment } = paymentSlice.actions;
export const selectPayment = (state) => state.payments;

export default paymentSlice.reducer;
