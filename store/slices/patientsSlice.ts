import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Patient } from "@/types";
import { dummyPatients } from "@/lib/dummyData";

interface PatientsState {
  list: Patient[];
  selected: Patient | null;
  loading: boolean;
  error: string | null;
  filters: { search: string; status: string };
  pagination: { page: number; limit: number; total: number };
}

const initialState: PatientsState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { search: "", status: "" },
  pagination: { page: 1, limit: 10, total: 0 },
};

export const fetchPatients = createAsyncThunk("patients/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return dummyPatients;
});

export const updatePatientStatus = createAsyncThunk(
  "patients/updateStatus",
  async ({ id, status }: { id: string; status: "active" | "blocked" }) => {
    await new Promise((r) => setTimeout(r, 300));
    return { id, status };
  }
);

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<PatientsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    selectPatient(state, action: PayloadAction<Patient | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.loading = true; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(updatePatientStatus.fulfilled, (state, action) => {
        const p = state.list.find((p) => p.id === action.payload.id);
        if (p) p.status = action.payload.status;
      });
  },
});

export const { setFilter: setPatientsFilter, setPage: setPatientsPage, selectPatient } = patientsSlice.actions;
export default patientsSlice.reducer;

