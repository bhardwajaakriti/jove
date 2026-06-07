import { createSlice } from '@reduxjs/toolkit';

export interface UiState {
  colorMode: 'light' | 'dark';
  sidebarOpen: boolean;
}

const initialState: UiState = {
  colorMode: 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleColorMode(state) {
      state.colorMode = state.colorMode === 'light' ? 'dark' : 'light';
    },
    setSidebarOpen(state, action: { payload: boolean }) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { setSidebarOpen, toggleColorMode } = uiSlice.actions;
export default uiSlice.reducer;
