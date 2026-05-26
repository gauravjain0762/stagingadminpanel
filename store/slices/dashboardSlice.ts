import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

interface DashboardState {
  metrics: {
    totalPatients: number;
    totalAppointments: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: {
    totalPatients: 0,
    totalAppointments: 0,
  },
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch dashboard stats");
      return {
        totalPatients: data.totalPatients ?? 0,
        totalAppointments: data.totalAppointments ?? 0,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics.totalPatients = action.payload.totalPatients;
        state.metrics.totalAppointments = action.payload.totalAppointments;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch dashboard data";
      });
  },
});

export default dashboardSlice.reducer;

