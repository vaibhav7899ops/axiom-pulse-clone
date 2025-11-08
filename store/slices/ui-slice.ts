import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  detailsTokenId: string | null;
  showColumns: Record<string, boolean>;
}
const initial: UIState = {
  detailsTokenId: null,
  showColumns: { price: true, change: true, volume: true, liq: true, mcap: true, age: true }
};

const uiSlice = createSlice({
  name: "ui",
  initialState: initial,
  reducers: {
    openDetails(state, action: PayloadAction<string>) { state.detailsTokenId = action.payload; },
    closeDetails(state) { state.detailsTokenId = null; },
    toggleColumn(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.showColumns[key] = !state.showColumns[key];
    }
  }
});

export const { openDetails, closeDetails, toggleColumn } = uiSlice.actions;
export default uiSlice.reducer;
