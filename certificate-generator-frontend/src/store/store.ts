import { configureStore } from "@reduxjs/toolkit";
import templateReducer from '../feautres/template/templateSlice';
import excelReducer from '../feautres/template/excelSlice';

export const store = configureStore({
    reducer : {
        template : templateReducer,
        excel: excelReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;