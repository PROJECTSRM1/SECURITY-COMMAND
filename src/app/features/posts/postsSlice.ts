import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface MapSelection {
  name: string;
  coords: [number, number];
}

interface PostsState {
  officers: any[];
  selectedOfficer: MapSelection | null;
}

const initialState: PostsState = {
  officers: [],
  selectedOfficer: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setOfficers: (state, action: PayloadAction<any[]>) => {
      state.officers = action.payload;
    },
    setSelectedOfficer: (state, action: PayloadAction<MapSelection>) => {
      state.selectedOfficer = action.payload;
    },
  },
});

export const { setOfficers, setSelectedOfficer } = postsSlice.actions;
export default postsSlice.reducer;
