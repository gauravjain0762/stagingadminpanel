import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

export type FilterType = "today" | "yesterday" | "7days" | "custom";

export interface AnalyticsParams {
  doctorId: string;
  filter: FilterType;
  customStart?: string;
  customEnd?: string;
}

export const fetchDoctorAnalytics = createAsyncThunk(
  "doctorAnalytics/fetch",
  async ({ doctorId, filter, customStart, customEnd }: AnalyticsParams, { rejectWithValue }) => {
    try {
      const token = getAdminToken();

      let url = `${BASE_URL}/api/admin/analytics/doctor/${doctorId}?filter=${filter}`;
      if (filter === "custom" && customStart && customEnd) {
        url += `&customStart=${customStart}&customEnd=${customEnd}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const slice = createSlice({
  name: "doctorAnalytics",
  initialState: {
    data: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDoctorAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalytics } = slice.actions;
export default slice.reducer;
