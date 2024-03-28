// authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  isAuthenticated: false,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
    },
    loginFail(state, action) {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload.error;
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
  },
});

export const { loginSuccess, loginFail, logout } = authSlice.actions;

export default authSlice.reducer;
