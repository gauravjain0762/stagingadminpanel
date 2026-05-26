import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteDoctor, deleteDoctors } from "./allDoctorsSlice";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

// FETCH PENDING DOCTORS (server-side pagination)
export const fetchPendingDoctors = createAsyncThunk(
  "pendingDoctors/fetch",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/pending-users?page=${page}&sort=-createdAt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pending doctors");

      const users = data.users
        .map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          specialization: user.services?.[0] || "General",
          clinic: user.clinic?.clinicName || "N/A",
          rating: user.clinic?.rating ?? 0,
          verificationStatus: user.status,
          profilePhoto: user.profilePhoto || "",
          createdAt: user.createdAt || "",
          fullData: user,
        }))
        .sort((a: any, b: any) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
          if (isNaN(aTime) && isNaN(bTime)) return 0;
          if (isNaN(aTime)) return 1;
          if (isNaN(bTime)) return -1;
          return bTime - aTime;
        });

      const total = data.total ?? users.length;
      return {
        users,
        total,
        page: data.page ?? page,
        totalPages: data.totalPages ?? (Math.ceil(total / 10) || 1),
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveDoctor = createAsyncThunk(
  "pendingDoctors/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${BASE_URL}/api/admin/approve/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to approve doctor");
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectDoctor = createAsyncThunk(
  "pendingDoctors/reject",
  async ({ id, rejections }: { id: string; rejections: { step: number; reason: string }[] }, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${BASE_URL}/api/admin/reject/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rejections }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to reject doctor");
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const slice = createSlice({
  name: "pendingDoctors",
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
    setPendingPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.pagination.page = action.payload.page;
        state.pagination.total = action.payload.total;
        state.pagination.totalPages = action.payload.totalPages;
        state.list = action.payload.users;
      })
      .addCase(fetchPendingDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveDoctor.fulfilled, (state, action) => {
        state.list = state.list.filter((d: any) => d.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(rejectDoctor.fulfilled, (state, action) => {
        state.list = state.list.filter((d: any) => d.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.list = state.list.filter((d: any) => d.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteDoctors.fulfilled, (state, action) => {
        state.list = state.list.filter((d: any) => !action.payload.includes(d.id));
        state.pagination.total = Math.max(0, state.pagination.total - action.payload.length);
      });
  },
});

export const { setPendingPage } = slice.actions;
export default slice.reducer;

