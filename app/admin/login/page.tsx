"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    // Demo credentials — replace with Supabase auth
    if (email === "admin@autocore.com" && password === "admin123") {
      document.cookie = "admin_auth=demo_token; path=/; max-age=86400";
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Use admin@autocore.com / admin123");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px,#d4f000 1px,transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#d4f000] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="font-black text-[#0d0d0d] text-2xl">AC</span>
          </div>
          <div className="font-black text-white text-xl">AUTO CORE</div>
          <div className="text-xs text-gray-500 mt-0.5">Admin Management System</div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={16} className="text-[#d4f000]" />
            <h1 className="font-extrabold text-white text-lg">Admin Sign In</h1>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@autocore.com"
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d4f000]" />
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d4f000]" />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] disabled:opacity-60 transition-colors text-sm mt-2">
              {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Signing in…</> : "Sign In to Admin"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-5">
            Demo: admin@autocore.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
