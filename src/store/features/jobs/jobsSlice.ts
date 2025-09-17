// src/store/features/jobs/jobsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Job } from "../../../lib/db";

interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
}

interface JobsFiltersState {
  status: "active" | "archived" | "";
  search: string;
  tags: string[];
}

interface JobsState {
  jobs: Job[];
  pagination: PaginationState;
  filters: JobsFiltersState;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: JobsState = {
  jobs: [],
  pagination: { page: 1, pageSize: 10, totalCount: 0 },
  filters: { status: "", search: "", tags: [] },
  status: "idle",
  error: undefined,
};

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { jobs: JobsState };
      const { page, pageSize } = state.jobs.pagination;
      const { status, search, tags } = state.jobs.filters;
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      if (tags.length > 0) params.set("tags", tags.join(","));
      const response = await fetch(`/jobs?${params.toString()}`);
      if (!response.ok) {
        return rejectWithValue("Failed to fetch jobs");
      }
      return (await response.json()) as {
        data: Job[];
        pagination: PaginationState;
      };
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (
    jobInput: Omit<Job, "id" | "createdAt" | "order">,
    { rejectWithValue }
  ) => {
    const response = await fetch(`/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobInput),
    });
    if (!response.ok) {
      const text = await response.text();
      return rejectWithValue(text || "Failed to create job");
    }
    return (await response.json()) as Job;
  }
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async (
    { id, updates }: { id: number; updates: Partial<Job> },
    { rejectWithValue }
  ) => {
    const response = await fetch(`/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const text = await response.text();
      return rejectWithValue(text || "Failed to update job");
    }
    return (await response.json()) as Job;
  }
);

export const reorderJobs = createAsyncThunk(
  "jobs/reorderJobs",
  async (
    {
      jobId,
      fromIndex,
      toIndex,
    }: { jobId: number; fromIndex: number; toIndex: number },
    { rejectWithValue }
  ) => {
    // This is where you call the API
    const response = await fetch(`/jobs/${jobId}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromOrder: fromIndex, toOrder: toIndex }),
    });
    if (!response.ok) {
      // If the API call fails, rejectWithValue sends the error to the `rejected` case
      return rejectWithValue("Failed to reorder");
    }
    return await response.json();
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    // This reducer handles the optimistic UI update INSTANTLY
    optimisticallyReorderJobs: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedItem] = state.jobs.splice(fromIndex, 1);
      state.jobs.splice(toIndex, 0, movedItem);
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<"active" | "archived" | "">
    ) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setTagsFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.tags = action.payload;
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    // fetchJobs
    builder.addCase(fetchJobs.pending, (state) => {
      state.status = "loading";
      state.error = undefined;
    });
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.jobs = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.status = "failed";
      state.error = (action.payload as string) || "Failed to fetch jobs";
    });

    // createJob
    builder.addCase(createJob.fulfilled, (state, action) => {
      // Prepend to current page if on first page and within page size
      if (state.pagination.page === 1) {
        state.jobs.unshift(action.payload);
        if (state.jobs.length > state.pagination.pageSize) {
          state.jobs.pop();
        }
      }
      state.pagination.totalCount += 1;
    });

    // updateJob
    builder.addCase(updateJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex((j) => j.id === action.payload.id);
      if (idx !== -1) {
        state.jobs[idx] = action.payload;
      }
    });

    builder.addCase(reorderJobs.rejected, (state, action) => {
      // ROLLBACK! If the API call failed, we need to revert the optimistic update.
      // A simple way is to just refetch the list from the "server" to get the true order.
      state.status = "failed";
      state.error = action.payload as string;
      // You would dispatch `fetchJobs()` from your component to reset the state.
    });
  },
});

export const {
  optimisticallyReorderJobs,
  setPage,
  setPageSize,
  setStatusFilter,
  setSearchFilter,
  setTagsFilter,
} = jobsSlice.actions;
export default jobsSlice.reducer;
