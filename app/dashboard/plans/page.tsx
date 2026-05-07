"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  PageHeader, SearchBar, DataTable, StatusBadge,
  SectionCard, LoadingSpinner, MetricCard,
} from "@/components/ui";
import {
  fetchPlans, fetchAssignedDoctors, createPlan, editPlan, deactivatePlan,
  grantFreeTokens, assignPlanToDoctor, addWalletBalance,
} from "@/store/slices/plansSlice";
import { fetchAllDoctors } from "@/store/slices/allDoctorsSlice";
import { Plus, CreditCard, Users, Package, Edit2, XCircle, X, CheckCircle, Gift, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PlanTypeBadge({ type }: { type: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    free: { label: "Free", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    monthly_unlimited: { label: "Monthly Unlimited", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    pay_per_token: { label: "Pay Per Token", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  };
  const c = cfg[type] ?? { label: type, cls: "bg-bg-elevated text-text-muted border-border-default" };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border", c.cls)}>
      {c.label}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[#333] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
          <h2 className="text-white font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-red/50 transition-colors";

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onDeactivate,
}: {
  plan: any;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const borderMap: Record<string, string> = {
    monthly_unlimited: "border-l-blue-500/40",
    pay_per_token: "border-l-amber-500/40",
    free: "border-l-emerald-500/40",
  };

  return (
    <div
      className={cn(
        "bg-bg-card border border-border-subtle border-l-4 rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-border-default",
        borderMap[plan.planType] ?? "border-l-border-default",
        !plan.isActive && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-base leading-tight">{plan.name}</h3>
          <div className="mt-1.5">
            <PlanTypeBadge type={plan.planType} />
          </div>
        </div>
        <StatusBadge status={plan.isActive ? "active" : "inactive"} />
      </div>

      {plan.description && (
        <p className="text-text-muted text-xs leading-relaxed">{plan.description}</p>
      )}

      <div className="space-y-1.5">
        {plan.planType === "monthly_unlimited" && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Price</span>
              <span className="text-white font-medium">₹{plan.price?.toLocaleString()}/month</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Validity</span>
              <span className="text-white font-medium">{plan.validityDays} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Appointments</span>
              <span className="text-blue-400 font-medium">Unlimited</span>
            </div>
          </>
        )}
        {plan.planType === "pay_per_token" && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Rate</span>
              <span className="text-white font-medium">₹{plan.pricePerToken}/token</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Billing</span>
              <span className="text-amber-400 font-medium">Per appointment</span>
            </div>
          </>
        )}
        {plan.planType === "free" && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Type</span>
            <span className="text-emerald-400 font-medium">Free Trial Tokens</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-border-default hover:text-text-primary hover:border-accent-red/30 transition-all"
        >
          <Edit2 size={11} />
          Edit
        </button>
        {plan.isActive && (
          <button
            onClick={onDeactivate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all"
          >
            <XCircle size={11} />
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Create / Edit Plan Modal ────────────────────────────────────────────────

function CreateEditPlanModal({
  plan,
  onClose,
  onSubmit,
}: {
  plan: any | null;
  onClose: () => void;
  onSubmit: (body: Record<string, any>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: plan?.name ?? "",
    planType: plan?.planType ?? "monthly_unlimited",
    price: plan?.price?.toString() ?? "",
    pricePerToken: plan?.pricePerToken?.toString() ?? "",
    validityDays: plan?.validityDays?.toString() ?? "",
    description: plan?.description ?? "",
    isActive: plan?.isActive ?? true,
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const body: Record<string, any> = {
      name: form.name.trim(),
      planType: form.planType,
      description: form.description.trim(),
    };
    if (plan) body.isActive = form.isActive;
    if (form.planType === "monthly_unlimited") {
      body.price = Number(form.price);
      body.validityDays = Number(form.validityDays);
    } else if (form.planType === "pay_per_token") {
      body.pricePerToken = Number(form.pricePerToken);
    }
    await onSubmit(body);
    setSaving(false);
  };

  return (
    <Modal title={plan ? "Edit Plan" : "Create New Plan"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
            Plan Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Monthly Unlimited"
            className={inputCls}
          />
        </div>

        {!plan && (
          <div>
            <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
              Plan Type *
            </label>
            <div className="flex gap-2">
              {[
                { val: "monthly_unlimited", label: "Monthly Unlimited" },
                { val: "pay_per_token", label: "Pay Per Token" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => set("planType", val)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                    form.planType === val
                      ? "bg-accent-red-glow border-accent-red/40 text-accent-red-light"
                      : "border-border-default text-text-secondary hover:text-text-primary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {form.planType === "monthly_unlimited" && (
          <>
            <div>
              <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
                Price (₹/month)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="5000"
                min="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
                Validity (days)
              </label>
              <input
                type="number"
                value={form.validityDays}
                onChange={(e) => set("validityDays", e.target.value)}
                placeholder="30"
                min="1"
                className={inputCls}
              />
            </div>
          </>
        )}

        {form.planType === "pay_per_token" && (
          <div>
            <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
              Price per Token (₹)
            </label>
            <input
              type="number"
              value={form.pricePerToken}
              onChange={(e) => set("pricePerToken", e.target.value)}
              placeholder="1"
              min="0"
              className={inputCls}
            />
          </div>
        )}

        <div>
          <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Optional description..."
            rows={2}
            className="w-full px-3 py-2 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-red/50 transition-colors resize-none"
          />
        </div>

        {plan && (
          <div className="flex items-center justify-between py-2">
            <span className="text-text-muted text-sm">Active</span>
            <button
              onClick={() => set("isActive", !form.isActive)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                form.isActive ? "bg-accent-red" : "bg-border-default"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  form.isActive ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-default text-text-muted text-sm hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-accent text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {saving ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Grant Free Tokens Modal ─────────────────────────────────────────────────

function GrantTokensModal({
  doctor,
  onClose,
  onSubmit,
}: {
  doctor: any;
  onClose: () => void;
  onSubmit: (tokens: number, days: number) => Promise<void>;
}) {
  const [tokens, setTokens] = useState("10");
  const [days, setDays] = useState("7");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await onSubmit(Number(tokens), Number(days));
    setSaving(false);
  };

  return (
    <Modal title="Grant Free Tokens" onClose={onClose}>
      <div className="flex items-center gap-3 mb-5 p-3 bg-bg-elevated rounded-lg">
        <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
          {doctor.initials}
        </div>
        <div>
          <p className="text-text-primary font-medium text-sm">{doctor.name}</p>
          <p className="text-text-muted text-xs">{doctor.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
            Number of Tokens
          </label>
          <input
            type="number"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            min="1"
            className={inputCls}
          />
          <p className="text-text-muted text-xs mt-1">Each appointment uses 1 token.</p>
        </div>
        <div>
          <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
            Valid for (days)
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            className={inputCls}
          />
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400">
          <Gift size={12} className="inline mr-1.5" />
          {tokens} free tokens · valid for {days} day{Number(days) !== 1 ? "s" : ""}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-default text-text-muted text-sm hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !tokens || !days || Number(tokens) < 1 || Number(days) < 1}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition"
          >
            {saving ? "Granting..." : "Grant Tokens"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Assign Plan Modal ────────────────────────────────────────────────────────

function AssignPlanModal({
  doctor,
  plans,
  onClose,
  onSubmit,
}: {
  doctor: any;
  plans: any[];
  onClose: () => void;
  onSubmit: (planId: string) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState(plans[0]?._id ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSaving(true);
    await onSubmit(selectedId);
    setSaving(false);
  };

  return (
    <Modal title="Assign Plan" onClose={onClose}>
      <div className="flex items-center gap-3 mb-5 p-3 bg-bg-elevated rounded-lg">
        <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
          {doctor.initials}
        </div>
        <div>
          <p className="text-text-primary font-medium text-sm">{doctor.name}</p>
          <p className="text-text-muted text-xs">{doctor.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-sm">
            No active plans available. Create a plan first.
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan._id}
                onClick={() => setSelectedId(plan._id)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 rounded-lg border transition-all text-left",
                  selectedId === plan._id
                    ? "bg-accent-red-glow border-accent-red/40"
                    : "border-border-default bg-bg-elevated hover:border-border-default"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors flex items-center justify-center",
                    selectedId === plan._id ? "border-accent-red bg-accent-red" : "border-border-default"
                  )}
                >
                  {selectedId === plan._id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-text-primary font-medium text-sm">{plan.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {plan.planType === "monthly_unlimited"
                      ? `₹${plan.price?.toLocaleString()}/month · ${plan.validityDays} days`
                      : `₹${plan.pricePerToken}/token · per appointment`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-default text-text-muted text-sm hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !selectedId || plans.length === 0}
            className="px-4 py-2 rounded-lg bg-gradient-accent text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {saving ? "Assigning..." : "Assign Plan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Wallet Balance Modal ─────────────────────────────────────────────────

function AddWalletModal({
  doctor,
  onClose,
  onSubmit,
}: {
  doctor: any;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState("500");
  const [saving, setSaving] = useState(false);

  const currentBalance = doctor.planInfo?.walletBalance ?? 0;
  const newBalance = currentBalance + Number(amount || 0);

  const handleSubmit = async () => {
    setSaving(true);
    await onSubmit(Number(amount));
    setSaving(false);
  };

  return (
    <Modal title="Add Wallet Balance" onClose={onClose}>
      <div className="flex items-center gap-3 mb-5 p-3 bg-bg-elevated rounded-lg">
        <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
          {doctor.initials}
        </div>
        <div>
          <p className="text-text-primary font-medium text-sm">{doctor.name}</p>
          <p className="text-text-muted text-xs">{doctor.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated rounded-lg">
          <span className="text-text-muted text-sm">Current Balance</span>
          <span className="text-emerald-400 font-semibold">₹{currentBalance.toLocaleString()}</span>
        </div>

        <div>
          <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-1.5">
            Amount to Add (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            className={inputCls}
          />
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400">
          <Wallet size={12} className="inline mr-1.5" />
          New balance: ₹{newBalance.toLocaleString()} · {newBalance} tokens available
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-default text-text-muted text-sm hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !amount || Number(amount) < 1}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-50 transition"
          >
            {saving ? "Adding..." : "Add Balance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function PlansContent() {
  const dispatch = useAppDispatch();
  const { plans, assignedDoctors, loading, assignedLoading } = useAppSelector((s) => s.plans);
  const { list: allDoctors } = useAppSelector((s) => s.allDoctors);

  const [activeTab, setActiveTab] = useState<"plans" | "doctors">("plans");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [grantDoctor, setGrantDoctor] = useState<any | null>(null);
  const [assignDoctor, setAssignDoctor] = useState<any | null>(null);
  const [walletDoctor, setWalletDoctor] = useState<any | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchAssignedDoctors());
    dispatch(fetchAllDoctors(1));
  }, [dispatch]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activePlans = useMemo(() => plans.filter((p) => p.isActive), [plans]);

  const enrichedDoctors = useMemo(() => {
    const map = new Map(assignedDoctors.map((d: any) => [d.doctorId, d]));
    return allDoctors.map((d: any) => ({ ...d, planInfo: map.get(d.id) ?? null }));
  }, [allDoctors, assignedDoctors]);

  const filteredDoctors = useMemo(() => {
    if (!search) return enrichedDoctors;
    const q = search.toLowerCase();
    return enrichedDoctors.filter(
      (d) => d.name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q)
    );
  }, [enrichedDoctors, search]);

  const handleCreatePlan = async (body: Record<string, any>) => {
    const res = await dispatch(createPlan(body));
    if (createPlan.fulfilled.match(res)) {
      showToast("Plan created successfully");
      setCreateOpen(false);
    } else {
      showToast(String(res.payload) || "Failed to create plan", "error");
    }
  };

  const handleEditPlan = async (body: Record<string, any>) => {
    if (!editingPlan) return;
    const res = await dispatch(editPlan({ planId: editingPlan._id, body }));
    if (editPlan.fulfilled.match(res)) {
      showToast("Plan updated successfully");
      setEditingPlan(null);
    } else {
      showToast(String(res.payload) || "Failed to update plan", "error");
    }
  };

  const handleDeactivate = async (planId: string) => {
    const res = await dispatch(deactivatePlan(planId));
    if (deactivatePlan.fulfilled.match(res)) showToast("Plan deactivated");
    else showToast(String(res.payload) || "Failed to deactivate", "error");
  };

  const handleGrantTokens = async (tokens: number, days: number) => {
    if (!grantDoctor) return;
    const res = await dispatch(grantFreeTokens({ doctorId: grantDoctor.id, tokens, days }));
    if (grantFreeTokens.fulfilled.match(res)) {
      showToast((res.payload as any).message || "Tokens granted!");
      dispatch(fetchAssignedDoctors());
    } else {
      showToast(String(res.payload) || "Failed to grant tokens", "error");
    }
    setGrantDoctor(null);
  };

  const handleAssignPlan = async (planId: string) => {
    if (!assignDoctor) return;
    const res = await dispatch(assignPlanToDoctor({ doctorId: assignDoctor.id, planId }));
    if (assignPlanToDoctor.fulfilled.match(res)) {
      showToast((res.payload as any).message || "Plan assigned!");
      dispatch(fetchAssignedDoctors());
    } else {
      showToast(String(res.payload) || "Failed to assign plan", "error");
    }
    setAssignDoctor(null);
  };

  const handleAddWallet = async (amount: number) => {
    if (!walletDoctor) return;
    const res = await dispatch(addWalletBalance({ doctorId: walletDoctor.id, amount }));
    if (addWalletBalance.fulfilled.match(res)) {
      showToast((res.payload as any).message || "Balance added!");
      dispatch(fetchAssignedDoctors());
    } else {
      showToast(String(res.payload) || "Failed to add balance", "error");
    }
    setWalletDoctor(null);
  };

  const doctorColumns = [
    {
      key: "doctor",
      label: "Doctor",
      render: (d: any) => (
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
      key: "plan",
      label: "Current Plan",
      render: (d: any) =>
        d.planInfo ? (
          <PlanTypeBadge type={d.planInfo.plan?.planType} />
        ) : (
          <span className="text-text-muted text-xs italic">No plan</span>
        ),
    },
    {
      key: "balance",
      label: "Tokens / Wallet",
      render: (d: any) => {
        if (!d.planInfo) return <span className="text-text-muted text-xs">—</span>;
        const { plan, walletBalance, tokensAvailable } = d.planInfo;
        if (plan?.planType === "pay_per_token")
          return <span className="text-amber-400 font-medium">₹{walletBalance?.toLocaleString()}</span>;
        if (plan?.planType === "monthly_unlimited")
          return <span className="text-blue-400 font-medium">Unlimited</span>;
        return <span className="text-emerald-400 font-medium">{tokensAvailable} tokens</span>;
      },
    },
    {
      key: "status",
      label: "Plan Status",
      render: (d: any) =>
        d.planInfo ? (
          <StatusBadge status={d.planInfo.plan?.isActive ? "active" : "inactive"} />
        ) : (
          <span className="text-text-muted text-xs">—</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (d: any) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setGrantDoctor(d)}
            className="h-6 px-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/10 transition-all flex items-center gap-1"
          >
            <Gift size={10} />
            Grant Tokens
          </button>
          <button
            onClick={() => setAssignDoctor(d)}
            className="h-6 px-2 rounded-lg border border-border-default bg-bg-elevated text-text-secondary text-[10px] font-medium hover:text-text-primary hover:border-accent-red/30 transition-all flex items-center gap-1"
          >
            <Package size={10} />
            Assign Plan
          </button>
          <button
            onClick={() => setWalletDoctor(d)}
            className="h-6 px-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-medium hover:bg-amber-500/10 transition-all flex items-center gap-1"
          >
            <Wallet size={10} />
            Add Wallet
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Plans & Tokens"
        subtitle="Manage subscription plans and grant tokens to doctors."
        actions={
          activeTab === "plans" ? (
            <button
              onClick={() => setCreateOpen(true)}
              className="h-9 px-4 rounded-lg bg-gradient-accent text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
            >
              <Plus size={14} />
              Create Plan
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Plans" value={plans.length} icon={<Package size={16} />} />
        <MetricCard label="Active Plans" value={activePlans.length} icon={<CheckCircle size={16} />} />
        <MetricCard label="Doctors on Plans" value={assignedDoctors.length} icon={<CreditCard size={16} />} />
        <MetricCard label="Total Doctors" value={allDoctors.length} icon={<Users size={16} />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-bg-card border border-border-subtle rounded-lg p-1 w-fit">
        {(["plans", "doctors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-accent-red text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab === "plans" ? "Plans" : "Doctors & Tokens"}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <>
          {loading ? (
            <LoadingSpinner />
          ) : plans.length === 0 ? (
            <SectionCard>
              <div className="py-16 text-center">
                <Package size={44} className="mx-auto mb-3 text-text-muted opacity-30" />
                <p className="text-text-muted text-sm">No plans created yet.</p>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 h-9 px-4 rounded-lg bg-gradient-accent text-white text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition"
                >
                  <Plus size={14} />
                  Create your first plan
                </button>
              </div>
            </SectionCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onEdit={() => setEditingPlan(plan)}
                  onDeactivate={() => handleDeactivate(plan._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Doctors & Tokens Tab */}
      {activeTab === "doctors" && (
        <SectionCard noPadding>
          <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search doctors by name or email..."
              className="flex-1 max-w-sm"
            />
            <p className="text-text-muted text-xs ml-auto">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
            </p>
          </div>
          {assignedLoading ? (
            <LoadingSpinner />
          ) : (
            <DataTable
              columns={doctorColumns}
              data={filteredDoctors}
              keyExtractor={(d: any) => d.id}
              emptyMessage="No doctors found"
            />
          )}
        </SectionCard>
      )}

      {/* Modals */}
      {(createOpen || editingPlan) && (
        <CreateEditPlanModal
          plan={editingPlan}
          onClose={() => { setCreateOpen(false); setEditingPlan(null); }}
          onSubmit={editingPlan ? handleEditPlan : handleCreatePlan}
        />
      )}
      {grantDoctor && (
        <GrantTokensModal
          doctor={grantDoctor}
          onClose={() => setGrantDoctor(null)}
          onSubmit={handleGrantTokens}
        />
      )}
      {assignDoctor && (
        <AssignPlanModal
          doctor={assignDoctor}
          plans={activePlans}
          onClose={() => setAssignDoctor(null)}
          onSubmit={handleAssignPlan}
        />
      )}
      {walletDoctor && (
        <AddWalletModal
          doctor={walletDoctor}
          onClose={() => setWalletDoctor(null)}
          onSubmit={handleAddWallet}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-xl z-50 transition-all animate-fade-in",
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          )}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default function PlansPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <PlansContent />
      </Suspense>
    </DashboardLayout>
  );
}
