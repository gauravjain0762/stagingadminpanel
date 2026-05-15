"use client";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAppointments, setAppointmentsFilter, setAppointmentsPage } from "@/store/slices/appointmentsSlice";
import { fetchAllDoctors } from "@/store/slices/allDoctorsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, SearchBar, SelectFilter, DataTable, StatusBadge, Pagination, SectionCard, LoadingSpinner } from "@/components/ui";
import { Appointment } from "@/types";
import { Download, Clock } from "lucide-react";

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  const { list, loading, filters, pagination } = useAppSelector((s) => s.appointments);
  const { list: doctorsList } = useAppSelector((s) => s.allDoctors);

  useEffect(() => {
    dispatch(fetchAllDoctors(1));
  }, [dispatch]);

  // Re-fetch from server whenever filters or page change
  useEffect(() => {
    dispatch(fetchAppointments({
      page: pagination.page,
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      doctorName: filters.doctor || undefined,
    }));
  }, [dispatch, pagination.page, filters.status, filters.paymentStatus, filters.doctor]);

  const activeDoctors = useMemo(() =>
    doctorsList.filter((d: any) => d.status === "active").map((d: any) => ({ label: d.name, value: d.name })),
    [doctorsList]
  );

  // Client-side search filter only (search is not a server param)
  const filtered = useMemo(() =>
    list.filter((a) => {
      if (!filters.search) return true;
      const q = filters.search.toLowerCase();
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }),
    [list, filters.search]
  );

  const columns = [
    { key: "id", label: "Appointment ID", render: (a: Appointment) => <span className="text-accent-red-light font-mono text-xs">{a.id}</span> },
    { key: "patientName", label: "Patient", render: (a: Appointment) => <span className="text-text-primary font-medium">{a.patientName}</span> },
    { key: "doctorName", label: "Doctor", render: (a: Appointment) => <span className="text-text-secondary text-sm">{a.doctorName}</span> },
    { key: "clinic", label: "Clinic", render: (a: Appointment) => <span className="text-text-muted text-sm">{a.clinic}</span> },
    {
      key: "date", label: "Date & Time",
      render: (a: Appointment) => (
        <div className="flex flex-col gap-0.5">
          <p className="text-text-primary text-sm">
            {new Date(a.date).toLocaleDateString("en-GB")}
          </p>
          {a.time && (
            <p className="text-text-muted text-xs flex items-center gap-1">
              <Clock size={10} className="shrink-0" />
              {a.time}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "tokenNumber", label: "Token",
      render: (a: Appointment) => (
        <span className="w-8 h-8 rounded-full bg-accent-red-glow border border-accent-red/20 text-accent-red-light text-xs font-bold flex items-center justify-center">
          {a.tokenNumber}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (a: Appointment) => <StatusBadge status={a.status} /> },
    { key: "paymentStatus", label: "Payment", render: (a: Appointment) => <StatusBadge status={a.paymentStatus} /> },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Appointment Management"
          subtitle="Monitor and manage all clinical appointment sessions across the network."
          actions={
            <button className="h-9 px-4 rounded-lg border border-border-default text-text-secondary text-sm hover:text-text-primary flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          }
        />
        <SectionCard noPadding>
          <div className="flex items-center gap-3 p-4 border-b border-border-subtle flex-wrap">
            <SearchBar
              value={filters.search}
              onChange={(v) => dispatch(setAppointmentsFilter({ search: v }))}
              placeholder="Search by patient, doctor, or ID"
              className="flex-1 min-w-52"
            />
            <SelectFilter
              value={filters.status}
              onChange={(v) => dispatch(setAppointmentsFilter({ status: v }))}
              options={[
                { label: "All Status", value: "" },
                { label: "Waiting", value: "waiting" },
                { label: "In Progress", value: "in_progress" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
            <SelectFilter
              value={filters.doctor}
              onChange={(v) => dispatch(setAppointmentsFilter({ doctor: v }))}
              options={[
                { label: "All Doctors", value: "" },
                ...activeDoctors,
              ]}
            />
            <SelectFilter
              value={filters.paymentStatus}
              onChange={(v) => dispatch(setAppointmentsFilter({ paymentStatus: v }))}
              options={[
                { label: "All Payments", value: "" },
                { label: "Paid", value: "paid" },
                { label: "Pending", value: "pending" },
                { label: "Cash Pending", value: "cash_pending" },
              ]}
            />
          </div>
          {loading ? <LoadingSpinner /> : (
            <>
              <DataTable columns={columns} data={filtered} keyExtractor={(a) => a.id} emptyMessage="No appointments found" />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                <p className="text-text-muted text-xs">
                  Page <strong className="text-text-primary">{pagination.page}</strong> of{" "}
                  <strong className="text-text-primary">{pagination.totalPages}</strong>{" "}
                  &mdash; <strong className="text-text-primary">{pagination.total}</strong> total
                </p>
                <Pagination
                  page={pagination.page}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={(p) => dispatch(setAppointmentsPage(p))}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
