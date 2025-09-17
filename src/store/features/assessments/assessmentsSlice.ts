import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Assessment, AssessmentSection } from "../../../lib/db";

interface AssessmentsState {
  byJobId: Record<number, Assessment | null>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: AssessmentsState = {
  byJobId: {},
  status: "idle",
  error: undefined,
};

export const fetchAssessment = createAsyncThunk(
  "assessments/fetch",
  async (jobId: number, { rejectWithValue }) => {
    const res = await fetch(`/assessments/${jobId}`);
    if (!res.ok) return rejectWithValue("Failed to load assessment");
    return (await res.json()) as Assessment;
  }
);

export const saveAssessment = createAsyncThunk(
  "assessments/save",
  async (
    { jobId, sections }: { jobId: number; sections: AssessmentSection[] },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/assessments/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    if (!res.ok) return rejectWithValue("Failed to save assessment");
    return (await res.json()) as Assessment;
  }
);

export const submitAssessmentResponse = createAsyncThunk(
  "assessments/submit",
  async (
    { jobId, answers }: { jobId: number; answers: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/assessments/${jobId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    if (!res.ok) return rejectWithValue("Failed to submit assessment");
    return await res.json();
  }
);

const assessmentsSlice = createSlice({
  name: "assessments",
  initialState,
  reducers: {
    setLocalSections: (
      state,
      action: PayloadAction<{ jobId: number; sections: AssessmentSection[] }>
    ) => {
      const { jobId, sections } = action.payload;
      const current = state.byJobId[jobId] || {
        jobId,
        sections: [],
        updatedAt: new Date(),
      };
      state.byJobId[jobId] = {
        ...current,
        sections,
        updatedAt: new Date(),
      } as Assessment;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAssessment.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchAssessment.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.byJobId[action.payload.jobId] = action.payload;
    });
    builder.addCase(fetchAssessment.rejected, (state, action) => {
      state.status = "failed";
      state.error = (action.payload as string) || "Failed to load assessment";
    });

    builder.addCase(saveAssessment.fulfilled, (state, action) => {
      state.byJobId[action.payload.jobId] = action.payload;
    });
  },
});

export const { setLocalSections } = assessmentsSlice.actions;
export default assessmentsSlice.reducer;
