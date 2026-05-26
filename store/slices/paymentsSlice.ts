import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

export interface PaymentSummary {
  totalRevenue: number;
  totalBookings: number;
}

export interface DoctorPaymentStats {
  earnings: number;
  bookings: number;
}

interface PaymentsState {
  summary: PaymentSummary;
  doctorStats: DoctorPaymentStats | null;
  summaryLoading: boolean;
  doctorLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  summary: { totalRevenue: 0, totalBookings: 0 },
  doctorStats: null,
  summaryLoading: false,
  doctorLoading: false,
  error: null,
};

export const fetchPaymentSummary = createAsyncThunk(
  "payments/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/payments/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch payment summary");
      return {
        totalRevenue: data.totalRevenue ?? data.data?.totalRevenue ?? 0,
        totalBookings: data.totalBookings ?? data.data?.totalBookings ?? 0,
      } as PaymentSummary;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDoctorPaymentStats = createAsyncThunk(
  "payments/fetchDoctorStats",
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(
        `${BASE_URL}/api/admin/analytics/doctor/${doctorId}?filter=7days`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch doctor stats");
      const d = data.data ?? data;
      return {
        earnings: d.payments?.totalRevenue ?? d.totalRevenue ?? 0,
        bookings: d.appointments?.total ?? d.totalAppointments ?? 0,
      } as DoctorPaymentStats;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearDoctorStats(state) {
      state.doctorStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentSummary.pending, (state) => { state.summaryLoading = true; state.error = null; })
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchPaymentSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDoctorPaymentStats.pending, (state) => { state.doctorLoading = true; })
      .addCase(fetchDoctorPaymentStats.fulfilled, (state, action) => {
        state.doctorLoading = false;
        state.doctorStats = action.payload;
      })
      .addCase(fetchDoctorPaymentStats.rejected, (state, action) => {
        state.doctorLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDoctorStats } = paymentsSlice.actions;
export default paymentsSlice.reducer;

