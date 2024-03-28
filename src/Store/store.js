import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../Slice/authSlice'
import adminReducer from '../Slice/adminSlice'
import postReducer from '../Slice/postSlice'

export const store = configureStore({
    reducer: {
        auth:authReducer,
        admin:adminReducer,
        post:postReducer,
        
    },
  });
  