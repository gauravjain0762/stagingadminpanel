import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || ""
    : "";

export const fetchPlans = createAsyncThunk("plans/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/plans`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return (data.plans || []) as any[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchAssignedDoctors = createAsyncThunk("plans/fetchAssigned", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/plans/assigned`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return (data.doctors || []) as any[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createPlan = createAsyncThunk(
  "plans/create",
  async (body: Record<string, any>, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.plan;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const editPlan = createAsyncThunk(
  "plans/edit",
  async ({ planId, body }: { planId: string; body: Record<string, any> }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { planId, updates: body };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deactivatePlan = createAsyncThunk(
  "plans/deactivate",
  async (planId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/plans/${planId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return planId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const grantFreeTokens = createAsyncThunk(
  "plans/grantTokens",
  async (
    { doctorId, tokens, days }: { doctorId: string; tokens: number; days: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/doctors/${doctorId}/grant-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ tokens, days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { doctorId, tokenPlan: data.tokenPlan, message: data.message };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const assignPlanToDoctor = createAsyncThunk(
  "plans/assignPlan",
  async ({ doctorId, planId }: { doctorId: string; planId: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/doctors/${doctorId}/assign-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { doctorId, tokenPlan: data.tokenPlan, message: data.message };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addWalletBalance = createAsyncThunk(
  "plans/addWallet",
  async ({ doctorId, amount }: { doctorId: string; amount: number }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/doctors/${doctorId}/wallet/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { doctorId, walletBalance: data.walletBalance, message: data.message };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const plansSlice = createSlice({
  name: "plans",
  initialState: {
    plans: [] as any[],
    assignedDoctors: [] as any[],
    loading: false,
    assignedLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.loading = true; })
      .addCase(fetchPlans.fulfilled, (state, action) => { state.loading = false; state.plans = action.payload; })
      .addCase(fetchPlans.rejected, (state) => { state.loading = false; })

      .addCase(fetchAssignedDoctors.pending, (state) => { state.assignedLoading = true; })
      .addCase(fetchAssignedDoctors.fulfilled, (state, action) => {
        state.assignedLoading = false;
        state.assignedDoctors = action.payload;
      })
      .addCase(fetchAssignedDoctors.rejected, (state) => { state.assignedLoading = false; })

      .addCase(createPlan.fulfilled, (state, action) => {
        if (action.payload) state.plans.unshift(action.payload);
      })
      .addCase(editPlan.fulfilled, (state, action) => {
        const { planId, updates } = action.payload;
        const idx = state.plans.findIndex((p) => p._id === planId);
        if (idx !== -1) state.plans[idx] = { ...state.plans[idx], ...updates };
      })
      .addCase(deactivatePlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex((p) => p._id === action.payload);
        if (idx !== -1) state.plans[idx].isActive = false;
      });
  },
});

export default plansSlice.reducer;

