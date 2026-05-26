import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Appointment } from "@/types";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

interface AppointmentsState {
  list: Appointment[];
  selected: Appointment | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
    paymentStatus: string;
    doctor: string;
    clinic: string;
    date: string;
  };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const initialState: AppointmentsState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { search: "", status: "", paymentStatus: "", doctor: "", clinic: "", date: "" },
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
};

export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (
    params: { page?: number; status?: string; paymentStatus?: string; doctorName?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = getAdminToken();
      const query = new URLSearchParams();
      if (params.page) query.set("page", String(params.page));
      if (params.status) query.set("status", params.status);
      if (params.paymentStatus) query.set("paymentStatus", params.paymentStatus);
      if (params.doctorName) query.set("doctorName", params.doctorName);

      const res = await fetch(`${BASE_URL}/api/admin/appointments?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");

      const appointments = (data.appointments ?? data.data ?? data).map((a: any) => ({
        id: a._id ?? a.id,
        patientName: a.patientName ?? (typeof a.patient === "string" ? a.patient : a.patient?.name) ?? "",
        patientId: a.patientId ?? a.patient?._id ?? "",
        doctorName: a.doctorName ?? (typeof a.doctor === "string" ? a.doctor : a.doctor?.name) ?? "",
        doctorId: a.doctorId ?? a.doctor?._id ?? "",
        clinic: a.clinicName ?? a.clinic?.clinicName ?? a.clinic?.name ?? (typeof a.clinic === "string" ? a.clinic : "") ?? "",
        clinicId: a.clinicId ?? a.clinic?._id ?? "",
        date: a.date ?? "",
        time: a.time ?? a.timeSlot ?? a.slot ?? a.slotTime ?? a.appointmentSlot ?? a.slot?.startTime ?? "",
        tokenNumber: a.tokenNumber ?? a.token ?? 0,
        status: a.status ?? "waiting",
        paymentStatus: a.paymentStatus ?? "pending",
        amount: a.amount ?? a.consultationFee ?? 0,
        notes: a.notes ?? "",
      })) as Appointment[];

      return {
        appointments,
        total: data.total ?? appointments.length,
        page: data.page ?? params.page ?? 1,
        totalPages: data.totalPages ?? (Math.ceil((data.total ?? appointments.length) / 20) || 1),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<AppointmentsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    selectAppointment(state, action: PayloadAction<Appointment | null>) {
      state.selected = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilter: setAppointmentsFilter,
  setPage: setAppointmentsPage,
  selectAppointment,
  clearFilters: clearAppointmentsFilters,
} = appointmentsSlice.actions;
export default appointmentsSlice.reducer;

