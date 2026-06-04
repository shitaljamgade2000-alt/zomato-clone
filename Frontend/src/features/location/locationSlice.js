import { createSlice } from '@reduxjs/toolkit';
import { CITIES } from '../../utils/constants';

const STORAGE_KEY = 'zomato_city';

function initialCity() {
  return localStorage.getItem(STORAGE_KEY) || 'Mumbai';
}

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    city: initialCity(),
    showPicker: false,
    cities: CITIES,
  },
  reducers: {
    setCity(state, action) {
      state.city = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
      state.showPicker = false;
    },
    setShowPicker(state, action) {
      state.showPicker = Boolean(action.payload);
    },
  },
});

export const { setCity, setShowPicker } = locationSlice.actions;

export const selectCity = (state) => state.location.city;
export const selectCities = (state) => state.location.cities;
export const selectShowPicker = (state) => state.location.showPicker;

export default locationSlice.reducer;

