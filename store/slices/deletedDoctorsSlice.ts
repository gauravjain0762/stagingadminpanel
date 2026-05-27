import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

export const fetchDeletionRequests = createAsyncThunk(
  "deletedDoctors/fetch",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/deletion-requests?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch deletion requests");

      const requests = (data.doctors ?? data.requests ?? []).map((item: any) => ({
        id: item.id || item._id || item.doctorId,
        name: item.name,
        email: item.email || "",
        phone: item.phone || "",
        clinic: item.clinic?.clinicName || (typeof item.clinic === "string" ? item.clinic : item.clinic ?? "N/A"),
        city: item.clinic?.city || "",
        status: item.activeStatus || item.status || "inactive",
        reason: item.reason || "",
        requestedAt: item.requestedAt || item.createdAt || "",
        fullData: item,
      }));

      const total = data.total ?? requests.length;
      return {
        requests,
        total,
        page: data.page ?? page,
        totalPages: data.totalPages ?? (Math.ceil(total / 10) || 1),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveDeletionRequest = createAsyncThunk(
  "deletedDoctors/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/deletion-requests/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to approve deletion request");
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectDeletionRequest = createAsyncThunk(
  "deletedDoctors/reject",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/deletion-requests/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to reject deletion request");
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const slice = createSlice({
  name: "deletedDoctors",
  initialState: {
    list: [] as any[],
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  },
  reducers: {
    setDeletedPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeletionRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletionRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.requests;
        state.pagination.page = action.payload.page;
        state.pagination.total = action.payload.total;
        state.pagination.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDeletionRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveDeletionRequest.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(rejectDeletionRequest.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { setDeletedPage } = slice.actions;
export default slice.reducer;
