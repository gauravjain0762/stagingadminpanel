// clinicsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Clinic } from "@/types";
import { dummyClinics } from "@/lib/dummyData";

interface ClinicsState {
  list: Clinic[];
  selected: Clinic | null;
  loading: boolean;
  error: string | null;
  filters: { search: string; status: string; city: string };
  pagination: { page: number; limit: number; total: number };
}

const initialState: ClinicsState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { search: "", status: "", city: "" },
  pagination: { page: 1, limit: 10, total: 0 },
};

export const fetchClinics = createAsyncThunk("clinics/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return dummyClinics;
});

const clinicsSlice = createSlice({
  name: "clinics",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<ClinicsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    selectClinic(state, action: PayloadAction<Clinic | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinics.pending, (state) => { state.loading = true; })
      .addCase(fetchClinics.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      });
  },
});

export const { setFilter: setClinicsFilter, setPage: setClinicsPage, selectClinic } = clinicsSlice.actions;
export default clinicsSlice.reducer;

