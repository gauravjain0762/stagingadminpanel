import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { QueueEntry } from "@/types";
import { dummyQueue } from "@/lib/dummyData";

interface QueueState {
  list: QueueEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: QueueState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchQueue = createAsyncThunk("queue/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return dummyQueue;
});

export const callNextToken = createAsyncThunk("queue/callNext", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return id;
});

export const skipToken = createAsyncThunk("queue/skip", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return id;
});

export const pauseQueue = createAsyncThunk("queue/pause", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return id;
});

export const resumeQueue = createAsyncThunk("queue/resume", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return id;
});

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    updateQueueEntry(state, action: PayloadAction<Partial<QueueEntry> & { id: string }>) {
      const idx = state.list.findIndex((q) => q.id === action.payload.id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueue.pending, (state) => { state.loading = true; })
      .addCase(fetchQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(callNextToken.fulfilled, (state, action) => {
        const q = state.list.find((q) => q.id === action.payload);
        if (q) {
          q.currentToken += 1;
          if (q.waitingPatients > 0) q.waitingPatients -= 1;
        }
      })
      .addCase(skipToken.fulfilled, (state, action) => {
        const q = state.list.find((q) => q.id === action.payload);
        if (q) {
          q.currentToken += 1;
        }
      })
      .addCase(pauseQueue.fulfilled, (state, action) => {
        const q = state.list.find((q) => q.id === action.payload);
        if (q) q.status = "paused";
      })
      .addCase(resumeQueue.fulfilled, (state, action) => {
        const q = state.list.find((q) => q.id === action.payload);
        if (q) q.status = "active";
      });
  },
});

export const { updateQueueEntry } = queueSlice.actions;
export default queueSlice.reducer;

