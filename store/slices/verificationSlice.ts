import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { VerificationDoc } from "@/types";
import { dummyVerifications } from "@/lib/dummyData";

interface VerificationState {
  list: VerificationDoc[];
  selected: VerificationDoc | null;
  loading: boolean;
  error: string | null;
  filters: { status: string; search: string };
  pagination: { page: number; limit: number; total: number };
}

const initialState: VerificationState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { status: "", search: "" },
  pagination: { page: 1, limit: 10, total: 0 },
};

export const fetchVerifications = createAsyncThunk("verification/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return dummyVerifications;
});

export const approveVerification = createAsyncThunk("verification/approve", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return id;
});

export const rejectVerification = createAsyncThunk("verification/reject", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return id;
});

const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<VerificationState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    selectDoc(state, action: PayloadAction<VerificationDoc | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerifications.pending, (state) => { state.loading = true; })
      .addCase(fetchVerifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchVerifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(approveVerification.fulfilled, (state, action) => {
        const doc = state.list.find((d) => d.id === action.payload);
        if (doc) doc.status = "verified";
        if (state.selected?.id === action.payload) state.selected.status = "verified";
      })
      .addCase(rejectVerification.fulfilled, (state, action) => {
        const doc = state.list.find((d) => d.id === action.payload);
        if (doc) doc.status = "rejected";
        if (state.selected?.id === action.payload) state.selected.status = "rejected";
      });
  },
});

export const { setFilter: setVerificationFilter, selectDoc } = verificationSlice.actions;
export default verificationSlice.reducer;

