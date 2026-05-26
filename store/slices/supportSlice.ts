import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SupportTicket } from "@/types";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

interface SupportState {
  list: SupportTicket[];
  loading: boolean;
  error: string | null;
  updatingId: string | null;
  filters: { search: string; status: string; priority: string; category: string };
  pagination: { page: number; limit: number };
}

const initialState: SupportState = {
  list: [],
  loading: false,
  error: null,
  updatingId: null,
  filters: { search: "", status: "", priority: "", category: "" },
  pagination: { page: 1, limit: 10 },
};

// GET /api/admin/reports
export const fetchTickets = createAsyncThunk(
  "support/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAdminToken();

      const [doctorRes, patientRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/api/admin/patient-reports`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const doctorData = await doctorRes.json();
      const patientData = await patientRes.json();

      if (!doctorRes.ok) throw new Error(doctorData.message);
      if (!patientRes.ok) throw new Error(patientData.message);

      const doctorReports = (doctorData.reports || []).map((r: any) => ({
        id: r.ticketId,
        userName: r.userName || "",
        phone: r.phone || "",
        subject: r.subject || "",
        category: r.category || "",
        priority: r.priority || "",
        status: r.status || "open",
        description: r.description || "",
        createdAt: r.createdAt || "",
        userType: "doctor",
      }));

      const patientReports = (patientData.reports || []).map((r: any) => ({
        id: r.ticketId,
        userName: r.patientName || "",
        phone: r.mobile || "",
        subject: r.subject || "",
        category: r.category || "",
        priority: r.priority || "",
        status: r.status || "open",
        description: r.description || "",
        createdAt: r.createdAt || "",
        userType: "patient",
      }));

      return [...doctorReports, ...patientReports].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// PATCH /api/admin/reports/:ticketId/status
export const updateTicketStatus = createAsyncThunk(
  "support/updateStatus",
  async ({ ticketId, status }: { ticketId: string; status: "open" | "closed" }, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/reports/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      return { ticketId, status };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    setSupportFilter(state, action: PayloadAction<Partial<SupportState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setSupportPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTicketStatus.pending, (state, action) => {
        state.updatingId = action.meta.arg.ticketId;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.updatingId = null;
        const ticket = state.list.find((t) => t.id === action.payload.ticketId);
        if (ticket) ticket.status = action.payload.status;
      })
      .addCase(updateTicketStatus.rejected, (state) => {
        state.updatingId = null;
      });
  },
});

export const { setSupportFilter, setSupportPage } = supportSlice.actions;
export default supportSlice.reducer;

