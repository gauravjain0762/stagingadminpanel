import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

export type AppKey = "doctorIos" | "doctorAndroid" | "patientIos" | "patientAndroid";

const KEY_MAP: Record<AppKey, { appType: string; platform: string }> = {
  doctorIos:      { appType: "doctor",  platform: "ios" },
  doctorAndroid:  { appType: "doctor",  platform: "android" },
  patientIos:     { appType: "patient", platform: "ios" },
  patientAndroid: { appType: "patient", platform: "android" },
};

function toAppKey(appType: string, platform: string): AppKey | null {
  const entry = (Object.entries(KEY_MAP) as [AppKey, { appType: string; platform: string }][]).find(
    ([, v]) => v.appType === appType && v.platform === platform
  );
  return entry ? entry[0] : null;
}

export interface AppVersionConfig {
  appType: string;
  platform: string;
  latestVersion: string;
  minVersion: string;
  forceUpdate: boolean;
  storeUrl: string;
  releaseNotes: string;
}

// GET /api/admin/app-version — returns array of all configs
export const fetchAppVersions = createAsyncThunk(
  "appSettings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/app-version`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      const list: AppVersionConfig[] = Array.isArray(data) ? data : data.versions ?? data.data ?? [];
      return list.reduce((acc, cfg) => {
        const key = toAppKey(cfg.appType, cfg.platform);
        if (key) acc[key] = cfg;
        return acc;
      }, {} as Record<AppKey, AppVersionConfig>);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// PATCH /api/admin/app-version/:appType/:platform
export const updateAppVersion = createAsyncThunk(
  "appSettings/update",
  async (
    { key, payload }: { key: AppKey; payload: Partial<Omit<AppVersionConfig, "appType" | "platform">> },
    { rejectWithValue }
  ) => {
    try {
      const token = getAdminToken();
      const { appType, platform } = KEY_MAP[key];
      const res = await fetch(`${BASE_URL}/api/admin/app-version/${appType}/${platform}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      return { key, data: data.data ?? data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// POST /api/admin/app-version — seed a new entry
export const createAppVersion = createAsyncThunk(
  "appSettings/create",
  async (payload: AppVersionConfig, { rejectWithValue }) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/app-version`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Create failed");
      const cfg: AppVersionConfig = data.data ?? data;
      const key = toAppKey(cfg.appType, cfg.platform);
      return { key, data: cfg };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface AppSettingsState {
  configs: Partial<Record<AppKey, AppVersionConfig>>;
  loading: boolean;
  saving: AppKey | null;
  error: string | null;
}

const slice = createSlice({
  name: "appSettings",
  initialState: {
    configs: {},
    loading: false,
    saving: null,
    error: null,
  } as AppSettingsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload;
      })
      .addCase(fetchAppVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAppVersion.pending, (state, action) => {
        state.saving = action.meta.arg.key;
      })
      .addCase(updateAppVersion.fulfilled, (state, action) => {
        state.saving = null;
        state.configs[action.payload.key] = action.payload.data;
      })
      .addCase(updateAppVersion.rejected, (state) => {
        state.saving = null;
      })
      .addCase(createAppVersion.fulfilled, (state, action) => {
        if (action.payload.key) {
          state.configs[action.payload.key] = action.payload.data;
        }
      });
  },
});

export default slice.reducer;

