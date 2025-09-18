import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type CandidateStage =
  | "applied"
  | "screen"
  | "tech"
  | "offer"
  | "hired"
  | "rejected";

export interface CandidateDTO {
  id: number;
  name: string;
  email: string;
  jobId?: number;
  stage: CandidateStage;
  createdAt: string;
}

export interface CandidateTimelineEntryDTO {
  id: number;
  candidateId: number;
  timestamp: string;
  type: "created" | "stage_change" | "note";
  payload: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CandidatesFilters {
  search: string;
  stage: CandidateStage | "";
  jobId?: number;
}

export interface CandidatesState {
  items: CandidateDTO[];
  loading: boolean;
  error?: string;
  pagination: Pagination;
  filters: CandidatesFilters;
  selectedIds: number[];
  timelineById: Record<number, CandidateTimelineEntryDTO[]>;
}

const initialState: CandidatesState = {
  items: [],
  loading: false,
  pagination: { page: 1, pageSize: 10, totalCount: 0 },
  filters: { search: "", stage: "" },
  selectedIds: [],
  timelineById: {},
};

export const fetchCandidates = createAsyncThunk(
  "candidates/fetch",
  async (_: void, { getState }) => {
    const state = getState() as { candidates: CandidatesState };
    const { page, pageSize } = state.candidates.pagination;
    const { search, stage, jobId } = state.candidates.filters;
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (stage) params.set("stage", stage);
    if (typeof jobId === "number") params.set("jobId", String(jobId));
    const res = await fetch(`/candidates?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as {
      data: CandidateDTO[];
      pagination: Pagination;
    };
  }
);

export const createCandidate = createAsyncThunk(
  "candidates/create",
  async (payload: {
    name: string;
    email: string;
    stage?: CandidateStage;
    jobId?: number;
  }) => {
    const res = await fetch(`/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as CandidateDTO;
  }
);

export const updateCandidate = createAsyncThunk(
  "candidates/update",
  async ({ id, updates }: { id: number; updates: Partial<CandidateDTO> }) => {
    const res = await fetch(`/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as CandidateDTO;
  }
);

export const bulkStageChange = createAsyncThunk(
  "candidates/bulkStageChange",
  async (
    { ids, stage }: { ids: number[]; stage: CandidateStage },
    { dispatch }
  ) => {
    // sequentially patch to keep MSW simple
    for (const id of ids) {
      await dispatch(updateCandidate({ id, updates: { stage } }));
    }
    return { ids, stage };
  }
);

export const fetchTimeline = createAsyncThunk(
  "candidates/fetchTimeline",
  async (candidateId: number) => {
    const res = await fetch(`/candidates/${candidateId}/timeline`);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as {
      candidateId: number;
      events: CandidateTimelineEntryDTO[];
    };
  }
);

export const addTimelineNote = createAsyncThunk(
  "candidates/addNote",
  async ({ candidateId, text }: { candidateId: number; text: string }) => {
    const res = await fetch(`/candidates/${candidateId}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as { id: number } & CandidateTimelineEntryDTO;
  }
);

export const fetchCandidateById = createAsyncThunk(
  "candidates/fetchById",
  async (id: number) => {
    const res = await fetch(`/candidates/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as CandidateDTO;
  }
);

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pagination.pageSize = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setStage(state, action: PayloadAction<CandidateStage | "">) {
      state.filters.stage = action.payload;
      state.pagination.page = 1;
    },
    setJobFilter(state, action: PayloadAction<number | undefined>) {
      state.filters.jobId = action.payload;
      state.pagination.page = 1;
    },
    setSelected(state, action: PayloadAction<number[]>) {
      state.selectedIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.pagination.totalCount += 1;
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.timelineById[action.payload.candidateId] = action.payload.events;
      })
      .addCase(addTimelineNote.fulfilled, (state, action) => {
        const cid = action.payload.candidateId;
        if (!state.timelineById[cid]) state.timelineById[cid] = [];
        state.timelineById[cid].push(action.payload);
      });
  },
});

export const {
  setPage,
  setPageSize,
  setSearch,
  setStage,
  setJobFilter,
  setSelected,
} = candidatesSlice.actions;
export default candidatesSlice.reducer;

// selectors for per-job and per-stage views
export const selectCandidatesByJob = (
  state: { candidates: CandidatesState },
  jobId?: number
) => {
  const list = state.candidates.items;
  if (typeof jobId !== "number") return list;
  return list.filter((c) => c.jobId === jobId);
};

export const selectCandidatesByStage = (
  state: { candidates: CandidatesState },
  stage: CandidateStage
) => state.candidates.items.filter((c) => c.stage === stage);
