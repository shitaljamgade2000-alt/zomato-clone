import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/apiClient';

const STORAGE_KEY = 'zomato_auth';

function loadInitialAuth() {
  const token = localStorage.getItem('token') || null;
  const saved = localStorage.getItem(STORAGE_KEY);
  let user = null;
  if (saved) {
    try {
      user = JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return { token, user };
}

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkApi) => {
  try {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (e) {
    return thunkApi.rejectWithValue(e?.data || { message: e.message || 'Login failed' });
  }
});

export const register = createAsyncThunk('auth/register', async (payload, thunkApi) => {
  try {
    return await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  } catch (e) {
    return thunkApi.rejectWithValue(e?.data || { message: e.message || 'Register failed' });
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, thunkApi) => {
  try {
    return await apiRequest('/auth/profile');
  } catch (e) {
    return thunkApi.rejectWithValue(e?.data || { message: e.message || 'Failed to load profile' });
  }
});

const initialLoaded = loadInitialAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialLoaded.user,
    token: initialLoaded.token,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem(STORAGE_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
    hydrateFromStorage(state) {
      const next = loadInitialAuth();
      state.user = next.user;
      state.token = next.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const { token, user } = action.payload || {};
        state.token = token || null;
        state.user = user || null;
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        const { token, user } = action.payload || {};
        state.token = token || null;
        state.user = user || null;
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Register failed';
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload || null;
        if (action.payload) localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
        // If token is invalid, force logout-like behavior
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem(STORAGE_KEY);
      });
  },
});

export const { logout, clearAuthError, hydrateFromStorage } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);

export default authSlice.reducer;

