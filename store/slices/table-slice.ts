import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Segment = "new" | "final" | "migrated";

interface TableState {
  segment: Segment;
  sortBy: { id: string; desc: boolean } | null;
  query: string;
}
const initial: TableState = {
  segment: "new",
  sortBy: { id: "volume24h", desc: true },
  query: ""
};

const tableSlice = createSlice({
  name: "table",
  initialState: initial,
  reducers: {
    setSegment(state, action: PayloadAction<Segment>) { state.segment = action.payload; },
    setSort(state, action: PayloadAction<{ id: string; desc: boolean } | null>) { state.sortBy = action.payload; },
    setQuery(state, action: PayloadAction<string>) { state.query = action.payload; }
  }
});

export const { setSegment, setSort, setQuery } = tableSlice.actions;
export default tableSlice.reducer;
