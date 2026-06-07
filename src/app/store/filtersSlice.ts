import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AssetType, Language, QueueFilters, SubjectArea, VideoType } from '@/types';

export type ArrayFilterKey =
  | 'subjectAreas'
  | 'statuses'
  | 'languages'
  | 'videoTypes'
  | 'assetTypes'
  | 'markets';

const initialState: QueueFilters = {
  subjectAreas: [],
  statuses: [],
  languages: [],
  videoTypes: [],
  assetTypes: [],
  markets: [],
};

type FilterValue = SubjectArea | Language | VideoType | AssetType | string;

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilterValues(
      state,
      action: PayloadAction<{ key: ArrayFilterKey; values: FilterValue[] }>,
    ) {
      const { key, values } = action.payload;
      state[key] = values as never;
    },
    clearFilters() {
      return initialState;
    },
  },
});

export const { clearFilters, setFilterValues } = filtersSlice.actions;
export default filtersSlice.reducer;
