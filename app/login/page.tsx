"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, []);

  const [email, setEmail] = useState("admin@saas.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://hospital-saas-backend-production.up.railway.app/api/auth/admin-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0f0f0f] border-r border-[#1f1f1f] p-10">
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1777037423/motion.div_dyp8fc.png"
            alt="Queue Token"
            className="w-9 h-9 rounded-xl object-contain"
          />
          <span className="text-white font-bold text-lg">Queue Token</span>
        </div>

        <div>
          <div className="mb-8">
            <img
              src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1777037423/motion.div_dyp8fc.png"
              alt="Queue Token"
              className="w-20 h-20 rounded-2xl object-contain mb-6"
            />
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Precision Admin<br />for Clinical Networks
            </h2>
            <p className="text-[#666] text-sm leading-relaxed max-w-xs">
              Manage doctors, appointments, and patient queues across your entire clinical network from one place.
            </p>
          </div>

          <div className="space-y-3">
            {["Doctor onboarding & verification", "Real-time appointment tracking", "Patient queue management"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-[#888] text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#444] text-xs">© 2026 Queue Token · Pulse Clinical</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img
              src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1777037423/motion.div_dyp8fc.png"
              alt="Queue Token"
              className="w-9 h-9 rounded-xl object-contain"
            />
            <span className="text-white font-bold text-lg">Queue Token</span>
          </div>


          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-[#666] text-sm">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[#888] text-xs font-medium mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="email"
                  placeholder="admin@saas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-[#555] focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[#888] text-xs font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-[#555] focus:outline-none focus:border-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </div>

          <p className="text-center text-[#444] text-xs mt-8">
            Pulse Clinical Admin Panel · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
