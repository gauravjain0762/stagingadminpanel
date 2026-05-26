import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

export type FilterType = "today" | "yesterday" | "7days" | "custom";

export interface PatientRecord {
  appointmentId: string;
  tokenNumber: string | number;
  fullName: string;
  phone: string;
  date: string;
  slot: string;
  paymentMethod: string;
  consultationFee: number;
  paymentStatus: string;
  status: string;
  isFollowup?: boolean;
}

export interface AnalyticsParams {
  doctorId: string;
  filter: FilterType;
  customStart?: string;
  customEnd?: string;
}

export const fetchDoctorPatients = createAsyncThunk(
  "doctorPatients/fetch",
  async ({ doctorId, filter, customStart, customEnd }: AnalyticsParams, { rejectWithValue }) => {
    try {
      const token = getAdminToken();

      let url = `${BASE_URL}/api/admin/analytics/doctor/${doctorId}/patients?filter=${filter}`;
      if (filter === "custom" && customStart && customEnd) {
        url += `&customStart=${customStart}&customEnd=${customEnd}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { patients: data.patients, total: data.total };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const slice = createSlice({
  name: "doctorPatients",
  initialState: {
    patients: [] as PatientRecord[],
    total: 0,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearPatients: (state) => {
      state.patients = [];
      state.total = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload?.patients || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchDoctorPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPatients } = slice.actions;
export default slice.reducer;

