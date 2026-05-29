"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");

    const saved = localStorage.getItem("theme");
    if (saved === "light") setIsDark(false);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

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
        "https://staging-api.queuetoken.in/api/auth/admin-login",
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

  const d = isDark;

  return (
    <div className={`min-h-screen flex ${d ? "bg-[#0a0a0a]" : "bg-[#f5f5f5]"}`}>
      {/* Left panel — branding */}
      <div
        className={`hidden lg:flex flex-col justify-between w-[45%] border-r p-10 ${
          d ? "bg-[#0f0f0f] border-[#1f1f1f]" : "bg-white border-[#e5e5e5]"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1780046292/icon-removebg-preview_jirlb4.png"
            alt="Queue Token"
            className="w-9 h-9 rounded-xl object-contain"
          />
          <span className={`font-bold text-lg ${d ? "text-white" : "text-[#111]"}`}>
            Queue Token
          </span>
        </div>

        <div>
          <div className="mb-8">
            <img
              src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1780046292/icon-removebg-preview_jirlb4.png"
              alt="Queue Token"
              className="w-20 h-20 rounded-2xl object-contain mb-6"
            />
            <h2 className={`text-3xl font-bold leading-tight mb-3 ${d ? "text-white" : "text-[#111]"}`}>
              Precision Admin<br />for Clinical Networks
            </h2>
            <p className={`text-sm leading-relaxed max-w-xs ${d ? "text-[#666]" : "text-[#777]"}`}>
              Manage doctors, appointments, and patient queues across your entire clinical network from one place.
            </p>
          </div>

          <div className="space-y-3">
            {["Doctor onboarding & verification", "Real-time appointment tracking", "Patient queue management"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className={`text-sm ${d ? "text-[#888]" : "text-[#555]"}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className={`text-xs ${d ? "text-[#444]" : "text-[#bbb]"}`}>© 2026 Queue Token</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`absolute top-5 right-5 p-2 rounded-lg border transition-colors ${
            d
              ? "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444]"
              : "bg-white border-[#e0e0e0] text-[#888] hover:text-[#333] hover:border-[#ccc]"
          }`}
          title={d ? "Switch to light theme" : "Switch to dark theme"}
        >
          {d ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img
              src="https://res.cloudinary.com/dbazlbkfj/image/upload/v1777037423/motion.div_dyp8fc.png"
              alt="Queue Token"
              className="w-9 h-9 rounded-xl object-contain"
            />
            <span className={`font-bold text-lg ${d ? "text-white" : "text-[#111]"}`}>
              Queue Token
            </span>
          </div>

          <div className="mb-8">
            <h1 className={`text-2xl font-bold mb-1 ${d ? "text-white" : "text-[#111]"}`}>
              Welcome back
            </h1>
            <p className={`text-sm ${d ? "text-[#666]" : "text-[#777]"}`}>
              Sign in to your admin account
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${d ? "text-[#888]" : "text-[#555]"}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${d ? "text-[#555]" : "text-[#aaa]"}`} />
                <input
                  type="email"
                  placeholder="admin@saas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors ${
                    d
                      ? "bg-[#141414] border-[#2a2a2a] text-white placeholder-[#555]"
                      : "bg-white border-[#e0e0e0] text-[#111] placeholder-[#bbb]"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`text-xs font-medium mb-1.5 block ${d ? "text-[#888]" : "text-[#555]"}`}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${d ? "text-[#555]" : "text-[#aaa]"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors ${
                    d
                      ? "bg-[#141414] border-[#2a2a2a] text-white placeholder-[#555]"
                      : "bg-white border-[#e0e0e0] text-[#111] placeholder-[#bbb]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    d ? "text-[#555] hover:text-[#888]" : "text-[#aaa] hover:text-[#555]"
                  }`}
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

          <p className={`text-center text-xs mt-8 ${d ? "text-[#444]" : "text-[#bbb]"}`}>
            Admin Panel · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
