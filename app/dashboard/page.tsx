"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData } from "@/store/slices/dashboardSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, LoadingSpinner } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { fetchAllDoctors } from "@/store/slices/allDoctorsSlice";
import { fetchPendingDoctors } from "@/store/slices/pendingDoctorsSlice";
import { useRouter } from "next/navigation";
import { Stethoscope, Users, Calendar, XCircle, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { metrics, loading } = useAppSelector((s) => s.dashboard);
  const { list } = useAppSelector((s) => s.allDoctors);
  const { pagination: pendingPagination } = useAppSelector((s) => s.pendingDoctors);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchAllDoctors(1));
    dispatch(fetchPendingDoctors(1));
  }, [dispatch]);

  const row1Cards = [
    { label: "Active Doctors", value: formatNumber(list.filter((d: any) => d.status === "active").length), icon: <Stethoscope size={16} />, onClick: () => router.push("/dashboard/doctors?status=active") },
    { label: "Inactive Doctors", value: formatNumber(list.filter((d: any) => d.status === "inactive").length), icon: <XCircle size={16} />, onClick: () => router.push("/dashboard/doctors?status=inactive") },
    { label: "Pending Doctor Requests", value: formatNumber(pendingPagination.total), icon: <ShieldCheck size={16} />, onClick: () => router.push("/dashboard/doctors/requests") },
  ];

  const row2Cards = [
    { label: "Total Patients", value: formatNumber(metrics.totalPatients), icon: <Users size={16} />, onClick: () => router.push("/patients") },
    { label: "Total Appointments", value: formatNumber(metrics.totalAppointments), icon: <Calendar size={16} />, onClick: () => router.push("/appointments") },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-text-secondary text-sm mt-1">
            Operational precision across Pulse clinical network.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {row1Cards.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {row2Cards.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
