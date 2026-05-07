import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://hospital-saas-backend.onrender.com";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

// FETCH ALL DOCTORS (server-side pagination)
export const fetchAllDoctors = createAsyncThunk(
  "allDoctors/fetch",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/all-users?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const users = data.users
        .map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          initials: user.name?.charAt(0),
          specialization: user.services?.[0] || "General",
          clinic: user.clinic?.clinicName || "N/A",
          status: user.activeStatus || "inactive",
          verificationStatus: user.status,
          rating: user.clinic?.rating || 0,
          totalAppointments: user.totalAppointments || 0,
          profilePhoto: user.profilePhoto || "",
          createdAt: user.createdAt || "",
          updatedAt: user.updatedAt || "",
          fullData: user,
        }))
        .sort((a: any, b: any) => {
          const getTime = (item: any): number => {
            if (item.createdAt) {
              const t = new Date(item.createdAt).getTime();
              if (!isNaN(t)) return t;
            }
            if (typeof item.id === "string" && item.id.length >= 8) {
              return parseInt(item.id.substring(0, 8), 16) * 1000;
            }
            return 0;
          };
          return getTime(b) - getTime(a);
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

export const toggleDoctorStatus = createAsyncThunk(
  "allDoctors/toggleStatus",
  async ({ id, activeStatus }: { id: string; activeStatus: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/toggle-status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activeStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { id, activeStatus };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  "allDoctors/deleteOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/delete-doctor/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteDoctors = createAsyncThunk(
  "allDoctors/deleteMany",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/delete-doctors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return ids;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const slice = createSlice({
  name: "allDoctors",
  initialState: {
    list: [] as any[],
    loading: false,
    recentlyApprovedId: null as string | null,
    filters: {
      search: "",
      status: "",
      verification: "",
      specialization: "",
      city: "",
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.pagination.page = action.payload.page;
        state.pagination.total = action.payload.total;
        state.pagination.totalPages = action.payload.totalPages;

        const sorted = [...action.payload.users];
        if (state.recentlyApprovedId) {
          const idx = sorted.findIndex((d: any) => d.id === state.recentlyApprovedId);
          if (idx > 0) {
            const [pinned] = sorted.splice(idx, 1);
            sorted.unshift(pinned);
          }
        }
        state.list = sorted;
      })
      .addCase(fetchAllDoctors.rejected, (state) => {
        state.loading = false;
      })
      .addCase(toggleDoctorStatus.fulfilled, (state, action) => {
        const doc = state.list.find((d: any) => d.id === action.payload.id);
        if (doc) doc.status = action.payload.activeStatus;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.list = state.list.filter((d: any) => d.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteDoctors.fulfilled, (state, action) => {
        state.list = state.list.filter((d: any) => !action.payload.includes(d.id));
        state.pagination.total = Math.max(0, state.pagination.total - action.payload.length);
      })
      .addCase("pendingDoctors/approve/fulfilled", (state, action: any) => {
        state.recentlyApprovedId = action.payload;
      });
  },
});

export const { setFilter, setPage } = slice.actions;
export default slice.reducer;
