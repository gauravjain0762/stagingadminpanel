"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDoctorPatients, clearPatients } from "@/store/slices/doctorPatientsSlice";
import { FilterType } from "@/store/slices/doctorAnalyticsSlice";
import { DatePickerInput } from "@/components/ui";

const fmtDate = (d: string) => {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Custom", value: "custom" },
];

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  waiting: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  skipped: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "text-green-400 bg-green-400/10 border-green-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  cash_pending: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function PatientsTab({ doctorId }: { doctorId: string }) {
  const dispatch = useAppDispatch();
  const { patients, total, loading, error } = useAppSelector((s) => s.doctorPatients);

  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [customApplied, setCustomApplied] = useState(false);

  useEffect(() => {
    if (activeFilter !== "custom") {
      dispatch(fetchDoctorPatients({ doctorId, filter: activeFilter }));
    }
  }, [activeFilter, doctorId, dispatch]);

  useEffect(() => () => {
    dispatch(clearPatients());
  }, [dispatch]);

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    setCustomApplied(true);
    dispatch(fetchDoctorPatients({ doctorId, filter: "custom", customStart, customEnd }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setActiveFilter(f.value);
              setCustomApplied(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeFilter === f.value
                ? "bg-accent-red border-accent-red text-white"
                : "border-border-default text-text-muted hover:text-text-primary hover:border-border-default"
            }`}
          >
            {f.label}
          </button>
        ))}

        {activeFilter === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <DatePickerInput value={customStart} onChange={setCustomStart} />
            <span className="text-text-muted text-sm">to</span>
            <DatePickerInput value={customEnd} onChange={setCustomEnd} />
            <button
              onClick={handleApplyCustom}
              disabled={!customStart || !customEnd}
              className="px-4 py-1.5 bg-accent-red text-white text-sm rounded-lg disabled:opacity-40 hover:bg-red-700 transition"
            >
              Apply
            </button>
          </div>
        )}

        {!loading && patients.length > 0 && (
          <span className="ml-auto text-sm text-text-muted">
            {total} patient{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-bg-secondary border border-border-default rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 rounded-xl p-4 text-sm">
          Failed to load patients: {error}
        </div>
      )}

      {activeFilter === "custom" && !customApplied && !loading && (
        <p className="text-text-muted text-sm">Select a date range and click Apply.</p>
      )}

      {!loading && !error && patients.length === 0 && (activeFilter !== "custom" || customApplied) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-text-muted text-sm">No patients found for this period</p>
        </div>
      )}

      {!loading && !error && patients.length > 0 && (
        <div className="bg-bg-secondary border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-muted text-xs uppercase">
                <th className="text-left px-5 py-3 font-medium">Token</th>
                <th className="text-left px-5 py-3 font-medium">Patient</th>
                <th className="text-left px-5 py-3 font-medium">Mobile</th>
                <th className="text-left px-5 py-3 font-medium">Date / Slot</th>
                <th className="text-left px-5 py-3 font-medium">Payment</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.appointmentId}
                  className="border-b border-border-default last:border-0 hover:bg-bg-hover transition"
                >
                  <td className="px-5 py-4 text-text-muted">{p.tokenNumber}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-red/20 flex items-center justify-center text-xs font-semibold text-accent-red flex-shrink-0">
                        {p.fullName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{p.fullName}</p>
                        {p.isFollowup && <span className="text-xs text-blue-400">Follow-up</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-muted">{p.phone}</td>
                  <td className="px-5 py-4">
                    <p className="text-white">{fmtDate(p.date)}</p>
                    <p className="text-xs text-text-muted">{p.slot}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border font-medium capitalize ${
                        p.paymentMethod === "online"
                          ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
                          : "text-gray-300 bg-gray-400/10 border-gray-400/20"
                      }`}
                    >
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white font-medium">₹{p.consultationFee}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border font-medium ${
                        PAYMENT_COLORS[p.paymentStatus] || "text-gray-400"
                      }`}
                    >
                      {p.paymentStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs border font-medium capitalize ${
                        STATUS_COLORS[p.status] || "text-gray-400"
                      }`}
                    >
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
