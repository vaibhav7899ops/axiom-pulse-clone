// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import ui from './slices/ui-slice';
import table from './slices/table-slice';

export const store = configureStore({
  reducer: { ui, table },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
