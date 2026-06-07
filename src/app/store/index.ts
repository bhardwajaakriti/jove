import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './filtersSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
