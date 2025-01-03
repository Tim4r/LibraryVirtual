import { configureStore } from '@reduxjs/toolkit';
import tokenUserReducer from './tokenSlice';
export const store = configureStore({
    reducer:{
        userToken: tokenUserReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
})