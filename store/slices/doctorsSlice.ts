import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Doctor } from "@/types";
import { dummyDoctors } from "@/lib/dummyData";

interface DoctorsState {
  list: Doctor[];
  selected: Doctor | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    specialization: string;
    clinic: string;
    status: string;
    verification: string;
  };
  pagination: { page: number; limit: number; total: number };
}

const initialState: DoctorsState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { search: "", specialization: "", clinic: "", status: "", verification: "" },
  pagination: { page: 1, limit: 10, total: 0 },
};

export const fetchDoctors = createAsyncThunk("doctors/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return dummyDoctors;
});

export const fetchDoctorById = createAsyncThunk("doctors/fetchById", async (id: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return dummyDoctors.find((d) => d.id === id) || null;
});

export const updateDoctorStatus = createAsyncThunk(
  "doctors/updateStatus",
  async ({ id, status }: { id: string; status: Doctor["status"] }) => {
    await new Promise((r) => setTimeout(r, 400));
    return { id, status };
  }
);

export const updateDoctorVerification = createAsyncThunk(
  "doctors/updateVerification",
  async ({ id, verificationStatus }: { id: string; verificationStatus: Doctor["verificationStatus"] }) => {
    await new Promise((r) => setTimeout(r, 400));
    return { id, verificationStatus };
  }
);

const doctorsSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<DoctorsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    selectDoctor(state, action: PayloadAction<Doctor | null>) {
      state.selected = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(updateDoctorStatus.fulfilled, (state, action) => {
        const doc = state.list.find((d) => d.id === action.payload.id);
        if (doc) doc.status = action.payload.status;
        if (state.selected?.id === action.payload.id) state.selected.status = action.payload.status;
      })
      .addCase(updateDoctorVerification.fulfilled, (state, action) => {
        const doc = state.list.find((d) => d.id === action.payload.id);
        if (doc) doc.verificationStatus = action.payload.verificationStatus;
        if (state.selected?.id === action.payload.id) state.selected.verificationStatus = action.payload.verificationStatus;
      });
  },
});

export const { setFilter, setPage, selectDoctor, clearFilters } = doctorsSlice.actions;
export default doctorsSlice.reducer;

