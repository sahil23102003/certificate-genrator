import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ExcelState {
  mapping: { [key: string]: string };
  columns: string[];
  rows: Record<string, any>[];
}

const initialState: ExcelState = {
  mapping: {},
  columns: [],
  rows: [],
};

const excelSlice = createSlice({
  name: 'excel',
  initialState,
  reducers: {
    setExcelData: (
      state,
      action: PayloadAction<{ columns: string[]; rows: Record<string, any>[] }>
    ) => {
      state.columns = action.payload.columns;
      state.rows = action.payload.rows;
    },
    setMapping: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.mapping = action.payload;
    },
    clearExcel: (state) => {
      state.mapping = {};
      state.columns = [];
      state.rows = [];
    },
  },
});

export const { setExcelData, setMapping, clearExcel } = excelSlice.actions;
export default excelSlice.reducer;