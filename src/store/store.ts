import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./features/jobs/jobsSlice";
import assessmentsReducer from "./features/assessments/assessmentsSlice";

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    assessments: assessmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
