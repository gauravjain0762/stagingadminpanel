"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAppVersions,
  updateAppVersion,
  createAppVersion,
  AppKey,
  AppVersionConfig,
} from "@/store/slices/appSettingsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LoadingSpinner } from "@/components/ui";
import { Apple, Smartphone, Save } from "lucide-react";

const ROWS: { key: AppKey; label: string; sub: string; icon: "apple" | "android"; appType: string; platform: string }[] = [
  { key: "doctorIos",      label: "Doctor iOS",      sub: "iOS App",     icon: "apple",   appType: "doctor",  platform: "ios" },
  { key: "doctorAndroid",  label: "Doctor Android",  sub: "Android App", icon: "android", appType: "doctor",  platform: "android" },
  { key: "patientIos",     label: "Patient iOS",     sub: "iOS App",     icon: "apple",   appType: "patient", platform: "ios" },
  { key: "patientAndroid", label: "Patient Android", sub: "Android App", icon: "android", appType: "patient", platform: "android" },
];

export default function AppSettingsPage() {
  const dispatch = useAppDispatch();
  const { configs, loading, saving } = useAppSelector((s) => s.appSettings);

  const [drafts, setDrafts] = useState<Record<AppKey, string>>({
    doctorIos: "", doctorAndroid: "", patientIos: "", patientAndroid: "",
  });

  useEffect(() => { dispatch(fetchAppVersions()); }, [dispatch]);

  useEffect(() => {
    setDrafts({
      doctorIos:      configs.doctorIos?.latestVersion ?? "",
      doctorAndroid:  configs.doctorAndroid?.latestVersion ?? "",
      patientIos:     configs.patientIos?.latestVersion ?? "",
      patientAndroid: configs.patientAndroid?.latestVersion ?? "",
    });
  }, [configs]);

  const handleSave = async (key: AppKey, appType: string, platform: string) => {
    const latestVersion = drafts[key];
    if (!latestVersion.trim()) return;
    const isNew = !configs[key];
    if (isNew) {
      await dispatch(createAppVersion({ appType, platform, latestVersion, minVersion: latestVersion, forceUpdate: false, storeUrl: "", releaseNotes: "" } as AppVersionConfig));
    } else {
      await dispatch(updateAppVersion({ key, payload: { latestVersion } }));
    }
    dispatch(fetchAppVersions());
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">App Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage version control for all mobile apps.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_auto] gap-4 px-6 py-3 border-b border-border-subtle">
              <span className="text-text-muted text-xs uppercase tracking-wider">App</span>
              <span className="text-text-muted text-xs uppercase tracking-wider">Current Version</span>
              <span className="text-text-muted text-xs uppercase tracking-wider w-20 text-center">Action</span>
            </div>

            {ROWS.map(({ key, label, sub, icon, appType, platform }, i) => {
              const isSaving = saving === key;
              return (
                <div
                  key={key}
                  className={`grid grid-cols-[2fr_1fr_auto] gap-4 items-center px-6 py-4 ${i !== ROWS.length - 1 ? "border-b border-border-subtle" : ""} hover:bg-bg-hover transition-colors`}
                >
                  {/* App name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center shrink-0">
                      {icon === "apple" ? <Apple size={16} className="text-text-secondary" /> : <Smartphone size={16} className="text-text-secondary" />}
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-medium">{label}</p>
                      <p className="text-text-muted text-xs">{sub}</p>
                    </div>
                  </div>

                  {/* Version input */}
                  <input
                    type="text"
                    value={drafts[key]}
                    onChange={(e) => setDrafts((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder="e.g. 1.0.0"
                    className="h-9 w-full bg-bg-secondary border border-border-default rounded-lg px-3 text-text-primary text-sm focus:outline-none focus:border-accent-red transition-colors"
                  />

                  {/* Save */}
                  <button
                    onClick={() => handleSave(key, appType, platform)}
                    disabled={isSaving}
                    className="h-9 w-20 rounded-lg bg-accent-red hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isSaving ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <>
                        <Save size={13} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
