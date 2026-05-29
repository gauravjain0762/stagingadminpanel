"use client";

import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { fetchPendingDoctors } from "@/store/slices/pendingDoctorsSlice";
import { fetchAllDoctors } from "@/store/slices/allDoctorsSlice";
import { fetchDoctorAnalytics, clearAnalytics, FilterType } from "@/store/slices/doctorAnalyticsSlice";
import PatientsTab from "@/components/PatientsTab";
import { DatePickerInput } from "@/components/ui";
import { FaFilePdf, FaImage } from "react-icons/fa";
import { useRouter } from "next/navigation";

type PreviewModalProps = {
  fileUrl: string;
  onClose: () => void;
};

const PreviewModal = ({ fileUrl, onClose }: PreviewModalProps) => {
  const isPDF = fileUrl.toLowerCase().includes(".pdf");


  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] p-4 rounded-lg w-[90%] h-[90%] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-xl"
          aria-label="Close preview"
        >
          X
        </button>

        <div className="w-full h-full flex items-center justify-center overflow-auto">
          {isPDF ? (
            <iframe
  src={`${fileUrl}#toolbar=0`}
  title="PDF preview"
  className="w-full h-full rounded-md bg-white"
/>
          ) : (
            <img
              src={fileUrl}
              alt="preview"
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ── ANALYTICS COMPONENTS ──────────────────────────────────────────────────────
 
const FILTERS: { label: string; value: FilterType }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Custom", value: "custom" },
];
 
function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}
 
function AnalyticsTab({ doctorId }: { doctorId: string }) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.doctorAnalytics);
 
  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [customApplied, setCustomApplied] = useState(false);
 
  // fetch whenever filter changes (but for custom, only when Apply is clicked)
  useEffect(() => {
    if (activeFilter !== "custom") {
      dispatch(fetchDoctorAnalytics({ doctorId, filter: activeFilter }));
    }
  }, [activeFilter, doctorId, dispatch]);
 
  // clear on unmount
  useEffect(() => () => { dispatch(clearAnalytics()); }, [dispatch]);
 
  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    setCustomApplied(true);
    dispatch(fetchDoctorAnalytics({ doctorId, filter: "custom", customStart, customEnd }));
  };
 
  return (
    <div className="space-y-6">
 
      {/* ── FILTER BAR ── */}
      <div className="flex flex-wrap items-center gap-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setActiveFilter(f.value); setCustomApplied(false); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeFilter === f.value
                ? "bg-accent-red border-accent-red text-white"
                : "border-border-default text-text-muted hover:text-text-primary hover:border-border-default"
            }`}
          >
            {f.label}
          </button>
        ))}
 
        {/* Custom date pickers */}
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
      </div>
 
      {/* ── STATES ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-secondary border border-border-default rounded-xl p-5 h-[110px] animate-pulse" />
          ))}
        </div>
      )}
 
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 rounded-xl p-4 text-sm">
          Failed to load analytics: {error}
        </div>
      )}
 
      {activeFilter === "custom" && !customApplied && !loading && (
        <p className="text-text-muted text-sm">Select a date range and click Apply.</p>
      )}
 
      {/* ── CARDS ── */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 
          {/* Card 1 — Total Appointments */}
          <StatCard
            title="Total Appointments"
            icon="📅"
            value={data.appointments.total}
            sub={`✅ ${data.appointments.completed} completed · ❌ ${data.appointments.cancelled} cancelled · ⏳ ${data.appointments.waiting} waiting`}
          />
 
          {/* Card 2 — Total Revenue */}
          <StatCard
            title="Total Payments"
            icon="💰"
            value={`₹${data.payments.totalRevenue.toLocaleString()}`}
            sub={`Online ₹${data.payments.online.amount.toLocaleString()} (${data.payments.online.count}) · Cash ₹${data.payments.cash.amount.toLocaleString()} (${data.payments.cash.count})`}
          />
 
          {/* Card 3 — Patients */}
          <StatCard
            title="Patients"
            icon="👥"
            value={data.appointments.total}
            sub={`🆕 ${data.patients.newPatients} new · 🔁 ${data.patients.followups} follow-ups`}
          />
 
          {/* Card 4 — Pricing Model */}
          <StatCard
            title="Appointment Fee"
            icon="🏷️"
            value={`₹${data.pricingModel.consultationFee}`}
            sub={
              data.pricingModel.subscriptionPlan
                ? `Plan: ${data.pricingModel.subscriptionPlan}`
                : "Per patient · No subscription"
            }
          />
 
        </div>
      )}
 
    </div>
  );
}

export default function DoctorDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const getDoctorId = (d: any) => d?.id || d?._id || "";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { list: pendingList, loading: pendingLoading } = useAppSelector((s) => s.pendingDoctors);
  const { list: allList, loading: allLoading } = useAppSelector((s) => s.allDoctors);

const getFileIcon = (url: string) => {
  if (url.includes(".pdf")) {
    return <FaFilePdf className="text-red-500 text-2xl" />;
  }
  return <FaImage className="text-blue-400 text-2xl" />;
};

const getFileName = (label: string) => {
  return label + ".pdf"; // you can make dynamic later
};

  useEffect(() => {
    if (!pendingList.length) dispatch(fetchPendingDoctors());
    if (!allList.length) dispatch(fetchAllDoctors());
  }, [dispatch, pendingList.length, allList.length]);

  const doctorFromPending = pendingList.find((d: any) => getDoctorId(d) === id);
  const doctorFromAll = allList.find((d: any) => getDoctorId(d) === id);
  const doctor = doctorFromPending || doctorFromAll;

  const [activeTab, setActiveTab] = useState("analytics");
  const [showAvailability, setShowAvailability] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  if (!doctor && (pendingLoading || allLoading || (!pendingList.length && !allList.length))) {
    return (
      <DashboardLayout>
        <p className="p-6 text-white">Loading doctor details...</p>
      </DashboardLayout>
    );
  }

  if (!doctor) {
    return (
      <DashboardLayout>
        <p className="p-6 text-white">Doctor not found</p>
      </DashboardLayout>
    );
  }

  const data = doctor.fullData || doctor;

  const formatTo12Hour = (time: string) => {
  if (!time) return "";

  // Backend already returns 12-hour format (e.g. "08:00 PM") — just strip leading zero
  if (/AM|PM/i.test(time)) {
    return time.replace(/^0(\d)/, "$1");
  }

  // Handle 24-hour format (e.g. "14:30")
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "D";

  return (
    (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  );
};

  return (
    <DashboardLayout>
      <div className="p-6 text-white">
        <button
  onClick={() => router.back()}
  className="mb-4 px-4 py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary text-sm rounded-lg border border-border-default transition"
>
  ← Back
</button>
        <h1 className="text-xl font-bold mb-4">Doctor Profile</h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border-default mb-6">
          {["analytics", "overview", "Patients"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "text-accent-red border-b-2 border-accent-red"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* PROFILE CARD */}
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6 flex gap-6">

              {/* LEFT SIDE */}
             <div className="w-[250px] flex flex-col items-start text-left border-r border-border-subtle pr-6">

                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg">
  {data.profilePhoto ? (
  <img
    src={data.profilePhoto}
    alt="profile"
    className="w-full h-full object-cover"
  />
) : (
  getInitials(doctor.name)
)}
</div>

                <h2 className="mt-4 text-lg font-semibold text-text-primary">
                  {doctor.name}
                </h2>

                <p className="text-text-muted text-sm">{doctor.email}</p>

                <div className={`mt-3 px-3 py-1 text-xs rounded-full border w-fit ${
                  data.status === "approved"
                    ? "border-green-500 text-green-400"
                    : data.status === "rejected"
                    ? "border-red-500 text-red-400"
                    : "border-yellow-500 text-yellow-400"
                }`}>
                  {(data.status || "pending").toString().toUpperCase()}
                </div>

                <div className="mt-4 text-left w-full space-y-1 text-sm">
                  <p><b>Phone:</b> {data.phone}</p>
                  {data.secondaryPhone && <p><b>Alt Phone:</b> {data.secondaryPhone}</p>}
                  <p><b>Experience:</b> {data.experience || "N/A"} years</p>
                  {data.gender && <p><b>Gender:</b> {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}</p>}
                  {data.maxPatientsPerSlot && <p><b>Max Patients/Slot:</b> {data.maxPatientsPerSlot}</p>}
                  <p><b>Available:</b> <span className={data.doctorAvailable ? "text-green-400" : "text-red-400"}>{data.doctorAvailable ? "Yes" : "No"}</span></p>
                </div>

<br />
                {/* RATING */}
                {data.clinic?.rating !== undefined && (
                  <div className="mt-2 w-full text-left">
                    <p className="text-sm font-semibold text-white mb-1">Rating</p>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(data.clinic.rating) ? "text-yellow-400" : "text-gray-600"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{data.clinic.rating} / 5</span>
                    </div>
                  </div>
                )}

                {/* QUALIFICATIONS */}
                {data.qualifications?.length > 0 && (
                  <div className="mt-4 w-full text-left">
                    <p className="text-sm font-semibold text-white mb-1">Qualifications</p>
                    <div className="flex flex-wrap gap-1">
                      {data.qualifications.map((q: string, i: number) => (
                        <span key={i} className="text-xs bg-bg-elevated border border-border-default rounded px-2 py-0.5 text-text-secondary">
                          {q.replace(/"/g, "")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACHIEVEMENTS */}
                {data.achievements?.length > 0 && (
                  <div className="mt-4 w-full text-left">
                    <p className="text-sm font-semibold text-white mb-1">Achievements</p>
                    <ul className="space-y-0.5">
                      {data.achievements.map((a: string, i: number) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                          <span className="text-yellow-400 mt-0.5">★</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AWARDS */}
                {data.awards?.length > 0 && (
                  <div className="mt-4 w-full text-left">
                    <p className="text-sm font-semibold text-white mb-1">Awards</p>
                    <ul className="space-y-0.5">
                      {data.awards.map((a: string, i: number) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                          <span className="text-yellow-400 mt-0.5">🏆</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ABOUT */}
                {data.clinic?.about && (
                  <div className="mt-4 w-full text-left">
                    <p className="text-sm font-semibold text-white mb-1">About</p>
                    <p className="text-xs text-gray-400 leading-relaxed break-words">
                      {data.clinic.about}
                    </p>
                  </div>
                )}
  
              </div>

              {/* RIGHT SIDE */}
              <div className="flex-1 grid grid-cols-2 gap-6">

                {/* CLINIC */}
                <div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
                  <h3 className="font-semibold text-text-primary mb-2">Clinic Name / Doctor Name</h3>

                  <p className="text-text-muted text-sm">{data.clinic?.clinicName}</p>
                  <p className="text-text-muted text-sm">{data.clinic?.address}</p>
                  <p className="text-text-muted text-sm">{data.clinic?.city} - {data.clinic?.pincode}</p>

                  <p className="text-sm mt-2">
                    <b>Consultation Fee:</b> ₹{data.clinic?.consultationFee}
                  </p>
                  <p className="text-sm">
  <b>Free Followup Days:</b> {data.clinic?.freeFollowupDays ?? "N/A"} days
</p>
                  {data.clinicId && (
                    <p className="text-sm mt-1">
                      <b>Clinic ID:</b>{" "}
                      <span className="font-mono text-base text-text-muted break-all">{data.clinicId}</span>
                    </p>
                  )}

                  <div className="flex flex-col gap-1 mt-2">
                    {data.clinic?.latitude && data.clinic?.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${data.clinic.latitude},${data.clinic.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-red text-sm hover:underline inline-block"
                      >
                        View on Google Maps
                      </a>
                    )}
                    {data.clinic?.googleBusinessLink && (
                      <a
                        href={data.clinic.googleBusinessLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-red text-sm hover:underline inline-block"
                      >
                        Google Business Link
                      </a>
                    )}
                  </div>
                  </div>

              {/* DOCUMENTS */}
<div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
  <h3 className="font-semibold text-text-primary mb-4">Documents</h3>

  {[
    { key: "aadharFront", label: "Aadhaar Front" },
    { key: "aadharBack", label: "Aadhaar Back" },
    { key: "panCard", label: "PAN Card" },
  ].filter(({ key }) => data.documents?.[key]).length === 0 ? (
    <p className="text-gray-500 text-sm">No documents uploaded</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { key: "aadharFront", label: "Aadhaar Front" },
        { key: "aadharBack", label: "Aadhaar Back" },
        { key: "panCard", label: "PAN Card" },
      ].map(({ key, label }) =>
        data.documents?.[key] ? (
          <div
            key={key}
            onClick={() => setPreviewFile(data.documents[key])}
            className="flex items-center gap-3 p-3 bg-bg-card hover:bg-bg-hover rounded-lg cursor-pointer transition border border-border-subtle hover:border-border-default"
          >
            {getFileIcon(data.documents[key])}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">{label}</span>
              <span className="text-xs text-text-muted">Click to preview</span>
            </div>
          </div>
        ) : null
      )}
    </div>
  )}
</div>

                {/* PAYMENT DETAILS */}
                <div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
                  <h3 className="font-semibold text-text-primary mb-3">Payment Details</h3>
                  {data.paymentDetails?.upiId ? (
                    <p className="text-sm"><b>UPI ID:</b> {data.paymentDetails.upiId}</p>
                  ) : (
                    <p className="text-sm text-gray-500">No UPI ID added</p>
                  )}
                  {data.paymentDetails?.qrCode && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-white mb-2">QR Code</p>
                      <img
                        src={data.paymentDetails.qrCode}
                        alt="Payment QR Code"
                        onClick={() => setPreviewFile(data.paymentDetails.qrCode)}
                        className="w-32 h-32 object-contain rounded-lg border border-border-default cursor-pointer hover:border-accent-red transition"
                      />
                    </div>
                  )}
                </div>

                {/* AVAILABILITY */}
               {/* AVAILABILITY */}
<div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
  <h3 className="font-semibold text-text-primary mb-4">Availability</h3>

  {data.availability?.length > 0 ? (
    <div className="grid grid-cols-4 gap-x-4 gap-y-2">
      {data.availability.map((day: any) => (
        <div key={day.day} className="flex flex-col gap-1">
          <p className={`text-xs font-semibold uppercase mb-1 ${day.isActive ? "text-white" : "text-gray-600"}`}>
            {day.day.slice(0, 3)}
          </p>
          {day.slots?.length > 0 ? (
            day.slots.map((s: any) => (
              <span key={s._id} className="text-xs text-green-400">
                {formatTo12Hour(s.startTime)} – {formatTo12Hour(s.endTime)}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-600 italic">
              {day.isActive ? "No slots" : "Off"}
            </span>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No availability added</p>
  )}
</div>

{/* SERVICES BLOCK */}
<div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
  <h3 className="font-semibold text-text-primary mb-3">Speciality</h3>

  {data.services?.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {data.services.map((service: string, index: number) => (
        <span
          key={index}
          className="px-3 py-1 text-xs bg-bg-elevated text-text-secondary rounded border border-border-default hover:border-accent-red transition"
        >
          {service}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No services added</p>
  )}
</div>

{/* CLINIC PHOTOS */}
<div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
  <h3 className="font-semibold text-text-primary mb-4">Clinic Photos</h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

    {data.clinic?.photos?.length > 0 ? (
      data.clinic?.photos.map((photo: string, index: number) => (
        <div
          key={index}
          onClick={() => setPreviewFile(photo)}
          className="flex items-center gap-3 p-3 bg-bg-card hover:bg-bg-hover rounded-lg cursor-pointer transition border border-border-subtle hover:border-border-default"
        >
          {getFileIcon(photo)}

          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">
              Clinic Photo {index + 1}
            </span>
            <span className="text-xs text-text-muted">
              image_{index + 1}.jpg
            </span>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No clinic photos uploaded</p>
    )}

  </div>
</div>

              </div>
            </div>

          </div>
        )}

        {activeTab === "Patients" && id && (
  <PatientsTab doctorId={id} />
)}

{activeTab === "analytics" && id && (
  <AnalyticsTab doctorId={id} />
)}
      </div>

      {/* AVAILABILITY MODAL */}
      {showAvailability && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-secondary w-[500px] max-h-[80vh] overflow-y-auto rounded-xl border border-border-default p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Full Availability</h2>
              <button
                onClick={() => setShowAvailability(false)}
                className="text-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Days */}
            <div className="space-y-3">
              {data.availability?.map((day: any) => (
                <div
                  key={day.day}
                  className="border border-border-subtle rounded-lg p-3"
                >
                  <p className="font-medium mb-1">
                    {day.day}{" "}
                    {!day.isActive && (
                      <span className="text-xs text-red-400">(Inactive)</span>
                    )}
                  </p>
                  {day.slots.length > 0 ? (
                    <div className="text-sm text-text-muted">
                      {day.slots.map((s: any) => (
                        <div key={s._id}>
                         {formatTo12Hour(s.startTime)} – {formatTo12Hour(s.endTime)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">No slots</p>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {previewFile && (
        <PreviewModal
          fileUrl={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </DashboardLayout>
  );
}
