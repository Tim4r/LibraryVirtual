import { configureStore,applyMiddleware } from '@reduxjs/toolkit';
import tokenUserReducer from './tokenSlice';
import filteredDataReducer  from './dataSlice';
import { thunk } from 'redux-thunk';
export const store = configureStore({
    reducer:{
        userToken: tokenUserReducer,
        filteredData: filteredDataReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
        
})