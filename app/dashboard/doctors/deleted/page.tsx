"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest,
  setDeletedPage,
} from "@/store/slices/deletedDoctorsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  PageHeader, SearchBar, DataTable, ActionButton, Pagination, SectionCard, LoadingSpinner, StatusBadge,
} from "@/components/ui";
import { X, Trash2, MapPin, Phone, Mail, Calendar, CheckCircle, History, UserX, ShieldAlert } from "lucide-react";

const BASE_URL = "https://staging-api.queuetoken.in";
const getAdminToken = () =>
  localStorage.getItem("token") || localStorage.getItem("pulse_admin_token") || "";

export default function DeleteRequestsPage() {
  const dispatch = useAppDispatch();
  const { list, loading, pagination } = useAppSelector((s) => s.deletedDoctors);

  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "reject"; doctor: any } | null>(null);

  // History panel state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const getDoctorId = (d: any) => d?.id || "";

  useEffect(() => {
    dispatch(fetchDeletionRequests(pagination.page));
  }, [dispatch, pagination.page]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${BASE_URL}/api/admin/deleted-doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const doctors = (data.doctors ?? data.users ?? []).map((d: any) => ({
        id: d.doctorId || d._id,
        name: d.name,
        email: d.email || "",
        clinic: d.clinic?.clinicName || (typeof d.clinic === "string" ? d.clinic : "N/A"),
        city: d.clinic?.city || "",
        reason: d.reason || "",
        deletedBy: d.deletedBy || "admin",
        deletedAt: d.deletedAt || "",
      }));
      setHistoryList(doctors);
    } catch {
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleOpenHistory = () => {
    setHistoryOpen(true);
    fetchHistory();
  };

  const filteredHistory = useMemo(() => {
    const q = historySearch.toLowerCase();
    return historyList.filter((d) =>
      !historySearch ||
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.clinic?.toLowerCase().includes(q)
    );
  }, [historyList, historySearch]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((d: any) =>
      !search ||
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.clinic?.toLowerCase().includes(q)
    );
  }, [list, search]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await dispatch(approveDeletionRequest(id));
    } finally {
      setApprovingId(null);
      setConfirmAction(null);
      setSelectedDoctor(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await dispatch(rejectDeletionRequest(id));
    } finally {
      setRejectingId(null);
      setConfirmAction(null);
      setSelectedDoctor(null);
    }
  };

  const historyColumns = [
    {
      key: "name",
      label: "Doctor",
      render: (d: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {d.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="text-text-primary font-medium">{d.name}</p>
            <p className="text-text-muted text-xs">{d.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "clinic",
      label: "Clinic",
      render: (d: any) => (
        <span className="text-text-primary text-sm">{d.clinic || "—"}</span>
      ),
    },
    {
      key: "deletedBy",
      label: "Deleted By",
      render: (d: any) =>
        d.deletedBy === "self_requested" ? (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
            <UserX size={10} />
            Self Requested
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">
            <ShieldAlert size={10} />
            By Admin
          </span>
        ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (d: any) => (
        <span className="text-text-muted text-xs">{d.reason || "—"}</span>
      ),
    },
    {
      key: "deletedAt",
      label: "Deleted At",
      render: (d: any) => (
        <span className="text-text-muted text-xs">
          {d.deletedAt
            ? new Date(d.deletedAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ];

  const columns = [
    {
      key: "name",
      label: "Doctor",
      render: (d: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {d.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="text-text-primary font-medium">{d.name}</p>
            <p className="text-text-muted text-xs">{d.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "clinic",
      label: "Clinic",
      render: (d: any) => (
        <span className="text-text-primary text-sm">{d.clinic || "—"}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (d: any) => (
        <span className="text-text-secondary text-sm">{d.phone || "—"}</span>
      ),
    },
    {
      key: "city",
      label: "City",
      render: (d: any) => (
        <span className="text-text-secondary text-sm">{d.city || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d: any) => <StatusBadge status={d.status} />,
    },
    {
      key: "requestedAt",
      label: "Requested At",
      render: (d: any) => (
        <span className="text-text-muted text-xs">
          {d.requestedAt
            ? new Date(d.requestedAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (d: any) => {
        const id = getDoctorId(d);
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <ActionButton label="View" onClick={() => setSelectedDoctor(d)} variant="secondary" size="xs" />
            <button
              onClick={() => setConfirmAction({ type: "approve", doctor: d })}
              disabled={approvingId === id}
              className="h-6 px-2 rounded text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white flex items-center gap-1 transition"
            >
              {approvingId === id ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : "Approve"}
            </button>
            <button
              onClick={() => setConfirmAction({ type: "reject", doctor: d })}
              disabled={rejectingId === id}
              className="h-6 px-2 rounded text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white flex items-center gap-1 transition"
            >
              {rejectingId === id ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : "Reject"}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Delete Requests"
          subtitle="Review and action doctor account deletion requests."
        />

        <SectionCard noPadding className="mb-6">
          <div className="flex items-center gap-3 p-4 border-b border-border-subtle flex-wrap">
            <SearchBar
              value={search}
              onChange={(v) => { setSearch(v); dispatch(setDeletedPage(1)); }}
              placeholder="Search by name, email, clinic"
              className="flex-1 max-w-sm"
            />
            <button
              onClick={handleOpenHistory}
              className="h-9 px-4 rounded-lg border border-border-default text-text-secondary text-sm font-medium flex items-center gap-2 hover:border-accent-red/40 hover:text-accent-red transition-colors"
            >
              <History size={14} />
              History
            </button>
            <p className="text-text-muted text-xs ml-auto">
              {pagination.total} pending request{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filtered}
                keyExtractor={(d) => getDoctorId(d)}
                emptyMessage="No deletion requests found"
                onRowClick={(d) => setSelectedDoctor(d)}
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                <p className="text-text-muted text-xs">
                  Page{" "}
                  <span className="text-text-primary font-medium">{pagination.page}</span>{" "}
                  of{" "}
                  <span className="text-text-primary font-medium">{pagination.totalPages}</span>
                  {" "}&mdash;{" "}
                  <span className="text-text-primary font-medium">{pagination.total}</span> total
                </p>
                <Pagination
                  page={pagination.page}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={(p) => dispatch(setDeletedPage(p))}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-default rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2">
                <History size={16} className="text-accent-red" />
                <h2 className="text-text-primary font-semibold text-base">Deletion History</h2>
              </div>
              <button
                onClick={() => { setHistoryOpen(false); setHistorySearch(""); }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle shrink-0">
              <SearchBar
                value={historySearch}
                onChange={setHistorySearch}
                placeholder="Search deleted doctors..."
                className="flex-1 max-w-sm"
              />
              <p className="text-text-muted text-xs ml-auto">
                {filteredHistory.length} of {historyList.length} record{historyList.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center h-40">
                  <LoadingSpinner />
                </div>
              ) : (
                <DataTable
                  columns={historyColumns}
                  data={filteredHistory}
                  keyExtractor={(d) => d.id}
                  emptyMessage="No deleted doctors found"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-default rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {selectedDoctor.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h2 className="text-text-primary font-semibold text-base leading-tight">{selectedDoctor.name}</h2>
                  <p className="text-text-muted text-xs">{selectedDoctor.clinic}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">{selectedDoctor.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">{selectedDoctor.phone || "—"}</span>
              </div>
              {selectedDoctor.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">{selectedDoctor.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">
                  Requested on{" "}
                  {selectedDoctor.requestedAt
                    ? new Date(selectedDoctor.requestedAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Trash2 size={13} className="text-red-400" />
                <p className="text-red-400 text-xs font-semibold uppercase tracking-wide">Deletion Reason</p>
              </div>
              <p className="text-text-primary text-sm leading-relaxed">
                {selectedDoctor.reason || "No reason provided."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="h-9 px-4 rounded-lg border border-border-default text-text-secondary text-sm hover:text-text-primary transition-all"
              >
                Close
              </button>
              <button
                onClick={() => { setSelectedDoctor(null); setConfirmAction({ type: "reject", doctor: selectedDoctor }); }}
                className="h-9 px-4 rounded-lg border border-red-600 text-red-500 text-sm font-medium hover:bg-red-600 hover:text-white transition"
              >
                Reject
              </button>
              <button
                onClick={() => { setSelectedDoctor(null); setConfirmAction({ type: "approve", doctor: selectedDoctor }); }}
                className="h-9 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-[90%] max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmAction.type === "approve" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {confirmAction.type === "approve"
                  ? <CheckCircle size={18} className="text-green-500" />
                  : <Trash2 size={18} className="text-red-500" />}
              </div>
              <div>
                <h2 className="text-white font-semibold">
                  {confirmAction.type === "approve" ? "Approve deletion?" : "Reject deletion request?"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {confirmAction.type === "approve"
                    ? "This will permanently delete the doctor and invalidate all patient tokens. This cannot be undone."
                    : "The doctor's account will be restored and they will be able to log in again."}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg border border-[#333] text-gray-400 text-sm hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmAction.type === "approve"
                    ? handleApprove(getDoctorId(confirmAction.doctor))
                    : handleReject(getDoctorId(confirmAction.doctor))
                }
                disabled={approvingId !== null || rejectingId !== null}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition ${
                  confirmAction.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {approvingId !== null || rejectingId !== null
                  ? confirmAction.type === "approve" ? "Approving..." : "Rejecting..."
                  : confirmAction.type === "approve" ? "Yes, approve" : "Yes, reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
