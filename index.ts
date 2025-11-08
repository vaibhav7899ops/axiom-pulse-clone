import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/ui-slice";
import tableReducer from "./slices/table-slice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    table: tableReducer,
  },
  devTools: process.env.NODE_ENV !== "production"
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
