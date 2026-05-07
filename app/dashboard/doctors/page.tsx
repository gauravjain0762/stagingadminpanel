"use client";
export const dynamic = "force-dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllDoctors, setFilter, setPage, toggleDoctorStatus, deleteDoctor, deleteDoctors } from "@/store/slices/allDoctorsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  PageHeader, SearchBar, SelectFilter, DataTable, StatusBadge,
  StarRating, ActionButton, Pagination, SectionCard, MetricCard, LoadingSpinner,
} from "@/components/ui";
import { Doctor } from "@/types";
import { Trash2, X } from "lucide-react";

// ✅ Inner component — holds all hooks and UI
function DoctorsContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { list, loading, filters, pagination } = useAppSelector((s) => s.allDoctors);
  const statusFilter = searchParams.get("status") ?? "";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const getDoctorId = (d: Doctor & { _id?: string }) => d.id || d._id || "";

  const handleView = (d: Doctor & { _id?: string }) => {
    const doctorId = getDoctorId(d);
    if (!doctorId) return;
    router.push(`/dashboard/doctors/requests/${encodeURIComponent(doctorId)}`);
  };

  const handleToggleStatus = (id: string, activeStatus: "active" | "inactive") => {
    dispatch(toggleDoctorStatus({ id, activeStatus }));
  };

  const handleResetFilters = () => {
  dispatch(setFilter({ search: "", specialization: "", status: "", verification: "", city: "" }));
  dispatch(setPage(1));
};

const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
 
  const handleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((d: any) => getDoctorId(d)));
    }
  };
 
  const handleDeleteSelected = async () => {
    setDeleting(true);
    if (selectedIds.length === 1) {
      await dispatch(deleteDoctor(selectedIds[0]));
    } else {
      await dispatch(deleteDoctors(selectedIds));
    }
    setSelectedIds([]);
    setShowConfirm(false);
    setDeleting(false);
    setDeleteMode(false);
  };

  useEffect(() => { dispatch(fetchAllDoctors(1)); }, [dispatch]);

  useEffect(() => {
    dispatch(setFilter({ status: statusFilter }));
    dispatch(setPage(1));
  }, [dispatch, statusFilter]);

  const filtered = useMemo(() => {
    return list.filter((d) => {
      const matchesSearch =
        !filters.search ||
        d.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(filters.search.toLowerCase());
      const matchesSpecialization =
        !filters.specialization || d.specialization === filters.specialization;
      const matchesStatus = !filters.status || d.status === filters.status;
      const matchesVerification =
        !filters.verification || d.verificationStatus === filters.verification;
      const matchesCity =
        !filters.city || d.fullData?.clinic?.city === filters.city;
      return matchesSearch && matchesSpecialization && matchesStatus && matchesVerification && matchesCity;
    });
  }, [list, filters]);

  const uniqueCities = useMemo(() => {
    const cities = list.map((d: any) => d.fullData?.clinic?.city).filter(Boolean);
    return [...new Set(cities)] as string[];
  }, [list]);

  const uniqueSpecializations = useMemo(() => {
    const specs = (list as any[]).flatMap((d) => d.fullData?.services || []).filter(Boolean);
    return [...new Set(specs)] as string[];
  }, [list]);

  const filteredTotal = filtered.length;
  const filteredTotalPages = Math.ceil(filteredTotal / pagination.limit) || 1;

  const paginated = filtered.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const columns = [
    {
  key: "select",
  label: deleteMode ? (
    <input
      type="checkbox"
      checked={paginated.length > 0 && selectedIds.length === paginated.length}
      onChange={handleSelectAll}
      className="w-4 h-4 accent-red-500 cursor-pointer"
    />
  ) : null,
  render: (d: Doctor & { _id?: string }) => deleteMode ? (
    <input
      type="checkbox"
      checked={selectedIds.includes(getDoctorId(d))}
      onChange={() => handleSelectOne(getDoctorId(d))}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 accent-red-500 cursor-pointer"
    />
  ) : null,
},
    {
      key: "name",
      label: "Doctor Name",
      render: (d: Doctor) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {d.initials}
          </div>
          <div>
            <p className="text-text-primary font-medium">{d.name}</p>
            <p className="text-text-muted text-xs">{d.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (d: Doctor) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent-red-glow text-accent-red-light border border-accent-red/20 uppercase tracking-wider">
          {d.specialization}
        </span>
      ),
    },
    { key: "clinic", label: "Clinic" },
    {
      key: "status",
      label: "Status",
      render: (d: Doctor) => <StatusBadge status={d.status} />,
    },
    {
      key: "verificationStatus",
      label: "Verification",
      render: (d: Doctor) => <StatusBadge status={d.verificationStatus} />,
    },
    {
      key: "rating",
      label: "Rating",
      render: (d: Doctor) => <StarRating rating={d.rating} />,
    },
    {
      key: "totalAppointments",
      label: "Appointments",
      render: (d: Doctor) => (
        <span className="text-text-primary font-medium">{d.totalAppointments.toLocaleString()}</span>
      ),
    },
    {
  key: "actions",
  label: "Actions",
  render: (d: Doctor & { _id?: string }) => (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <ActionButton label="View" onClick={() => handleView(d)} variant="secondary" size="xs" />
      {d.status === "active" ? (
        <ActionButton label="Inactive" onClick={() => handleToggleStatus(getDoctorId(d), "inactive")} variant="danger" size="xs" />
      ) : (
        <ActionButton label="Active" onClick={() => handleToggleStatus(getDoctorId(d), "active")} variant="success" size="xs" />
      )}
    </div>
  ),
},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Doctor Management"
        subtitle="Orchestrate and verify clinical practitioners across all departments."
        actions={
  deleteMode ? (
    <div className="flex items-center gap-2">
      {selectedIds.length > 0 && (
        <button
          onClick={() => setShowConfirm(true)}
          className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 transition"
        >
          <Trash2 size={14} />
          Delete {selectedIds.length} doctor{selectedIds.length > 1 ? "s" : ""}
        </button>
      )}
      <button
        onClick={() => { setDeleteMode(false); setSelectedIds([]); }}
        className="h-9 px-3 rounded-lg border border-[#333] text-gray-400 text-sm hover:text-white transition"
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      onClick={() => setDeleteMode(true)}
      className="h-9 px-4 rounded-lg border border-red-600 text-red-500 text-sm font-medium flex items-center gap-2 hover:bg-red-600 hover:text-white transition"
    >
      <Trash2 size={14} />
      Delete
    </button>
  )
}
      />
        

      <SectionCard noPadding className="mb-6">
        <div className="flex items-center gap-3 p-4 border-b border-border-subtle flex-wrap">
          <SearchBar
            value={filters.search}
            onChange={(v) => { dispatch(setFilter({ search: v })); dispatch(setPage(1)); }}
            placeholder="Search doctors, email, specialization..."
            className="flex-1 min-w-48"
          />
          <SelectFilter
  value={filters.specialization}
  onChange={(v) => { dispatch(setFilter({ specialization: v })); dispatch(setPage(1)); }}
  options={[
    { label: "All Specializations", value: "" },
    ...uniqueSpecializations.map((s) => ({ label: s, value: s })),
  ]}
  className="min-w-40"
/>
          <SelectFilter
            value={filters.status}
            onChange={(v) => { dispatch(setFilter({ status: v })); dispatch(setPage(1)); }}
            options={[
              { label: "All Status", value: "" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            className="min-w-32"
          />
          <SelectFilter
  value={filters.city}
  onChange={(v) => { dispatch(setFilter({ city: v })); dispatch(setPage(1)); }}
  options={[
    { label: "All Cities", value: "" },
    ...uniqueCities.map((city) => ({ label: city, value: city })),
  ]}
  className="min-w-40"
/>
          <button
  onClick={handleResetFilters}
  className="h-9 px-3 rounded-lg border border-border-subtle text-text-muted text-sm font-medium flex items-center gap-1.5 hover:border-accent-red hover:text-accent-red transition-colors shrink-0"
>
  <X size={14} />
  Reset
</button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginated}
              keyExtractor={(d) => getDoctorId(d)}
              emptyMessage="No doctors found matching your filters"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
              <p className="text-text-muted text-xs">
                Page <span className="text-text-primary font-medium">{pagination.page}</span> of{" "}
                <span className="text-text-primary font-medium">{filteredTotalPages}</span>{" "}
                &mdash; <span className="text-text-primary font-medium">{filteredTotal}</span> total
              </p>
              <Pagination
                page={pagination.page}
                total={filteredTotal}
                limit={pagination.limit}
                onPageChange={(p) => dispatch(setPage(p))}
              />
            </div>
          </>
        )}
      </SectionCard>

        {/* DELETE CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-[90%] max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Delete {selectedIds.length} doctor{selectedIds.length > 1 ? "s" : ""}?</h2>
                <p className="text-gray-400 text-sm">This will also delete all their appointments. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-[#333] text-gray-400 text-sm hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ✅ Default export — wraps content in Suspense
export default function DoctorsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <DoctorsContent />
      </Suspense>
    </DashboardLayout>
  );
}