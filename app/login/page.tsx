"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Background image URL — change here to swap the image ─────
const BG_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90&fit=crop";

// ─── Shared AutoCore logo mark ────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="Auto Core home">
      <div className="w-10 h-10 bg-[#D8FF00] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#c8ef00] transition-colors">
        <span className="text-[#0A0A0A] font-black text-sm leading-none tracking-tight">AC</span>
      </div>
      <div>
        <div className="font-black text-white text-lg tracking-tight leading-none">AUTO CORE</div>
        <div className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.22em] mt-0.5">
          Parts &amp; Accessories
        </div>
      </div>
    </Link>
  );
}

// ─── Google SVG (unchanged) ───────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Login form — all auth logic preserved exactly ────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // ── Supabase sign-in (unchanged logic) ───────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password)      { setError("Please enter your password."); return; }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setLoading(false);
      const m = signInError.message.toLowerCase();
      if (m.includes("failed to fetch") || m.includes("networkerror")) {
        setError("Cannot connect to the server. Check your internet connection.");
      } else if (m.includes("invalid login") || m.includes("invalid credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (m.includes("email not confirmed")) {
        setError("Please verify your email address first. Check your inbox.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    const from = searchParams.get("from") ?? "/account";
    router.refresh();
    router.push(from);
  };

  const handleGoogle = async () => {
    setError("");
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (e) setError(e.message);
  };

  // ── Input base styles (dark card) ────────────────────────
  const inputCls = [
    "w-full rounded-xl px-4 py-3 pl-10 text-sm",
    "bg-white/5 border border-white/10",
    "text-white placeholder-white/30",
    "focus:outline-none focus:ring-2 focus:ring-[#D8FF00]/60 focus:border-[#D8FF00]/40",
    "focus:bg-white/8 transition-all",
  ].join(" ");

  return (
    <div className="w-full">
      {/* Card heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
        <p className="text-white/50 text-sm mt-1">Please enter your details to continue.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-3.5 py-3 mb-4 text-sm">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className={inputCls}
            />
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-[#D8FF00] hover:text-[#e8ff55] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`${inputCls} pr-10`}
            />
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5 pt-0.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={remember}
            onClick={() => setRemember(!remember)}
            className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
              remember
                ? "bg-[#D8FF00] border-[#D8FF00]"
                : "border-white/20 hover:border-[#D8FF00]/60 bg-transparent"
            }`}
            style={{ width: 18, height: 18 }}
          >
            {remember && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span
            className="text-sm text-white/50 cursor-pointer select-none hover:text-white/70 transition-colors"
            onClick={() => setRemember(!remember)}
          >
            Remember me for 30 days
          </span>
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#D8FF00] text-[#0A0A0A] font-black py-3.5 rounded-xl hover:bg-[#c8ef00] active:bg-[#b8df00] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide mt-1"
          style={{ boxShadow: "0 4px 24px rgba(216,255,0,0.28)" }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Signing in…
            </>
          ) : (
            <>Sign In <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[11px] text-white/30 font-medium">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Google SSO */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-white/40 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[#D8FF00] hover:text-[#e8ff55] transition-colors">
          Create Account
        </Link>
      </p>

      {/* Legal */}
      <p className="text-[10px] text-white/20 text-center mt-3 leading-relaxed">
        By signing in you agree to our{" "}
        <Link href="/terms" className="underline hover:text-white/40">Terms</Link>
        {" "}&amp;{" "}
        <Link href="/privacy" className="underline hover:text-white/40">Privacy Policy</Link>.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* ── Full-screen background image ───────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* ── Dark overlay — strong enough for legibility ─────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.75) 50%, rgba(10,10,10,0.55) 100%)",
        }}
      />

      {/* ── Page content ────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── LEFT — Brand section ─────────────────────────── */}
        <div className="flex flex-col justify-between px-8 py-10 lg:px-14 lg:py-12 lg:w-[55%] xl:w-[58%]">

          {/* Logo */}
          <Logo />

          {/* Hero copy — hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block">
            {/* Accent rule */}
            <div className="w-10 h-[3px] bg-[#D8FF00] rounded-full mb-7" />

            <div className="text-[#D8FF00] font-black leading-none tracking-tight mb-5"
              style={{ fontSize: "clamp(3.2rem, 5.5vw, 5rem)" }}>
              Built To<br />Last.
            </div>

            <p className="text-white/60 text-base leading-relaxed max-w-sm mb-3">
              Quality auto parts. Reliable performance.
            </p>
            <p className="text-white/35 text-sm">
              Sign in to continue to your AUTO CORE account.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2.5 mt-10">
              {[
                ["500K+", "Parts In Stock"],
                ["200+",  "Trusted Brands"],
                ["4.9★",  "Customer Rating"],
                ["24hr",  "Same-Day Dispatch"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                >
                  <span className="text-[#D8FF00] font-black text-sm">{v}</span>
                  <span className="text-white/40 text-xs font-medium">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note — desktop */}
          <p className="hidden lg:block text-[10px] text-white/20 mt-auto">
            © {new Date().getFullYear()} Auto Core. All rights reserved.
          </p>
        </div>

        {/* ── RIGHT — Login card ───────────────────────────── */}
        <div className="flex items-center justify-center px-5 py-8 lg:py-12 lg:px-12 xl:px-16 lg:w-[45%] xl:w-[42%]">
          <div className="w-full max-w-[400px]">

            {/* Mobile: show logo + tagline above card */}
            <div className="lg:hidden mb-6 text-center">
              <div className="inline-flex flex-col items-center gap-1">
                <span className="text-[#D8FF00] font-black text-3xl tracking-tight leading-none">
                  Built To Last.
                </span>
                <span className="text-white/40 text-xs">Quality auto parts. Reliable performance.</span>
              </div>
            </div>

            {/* Dark login card */}
            <div
              className="rounded-2xl p-7 sm:p-8"
              style={{
                background: "rgba(17,17,17,0.92)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-16">
                    <svg className="animate-spin h-7 w-7 text-[#D8FF00]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </div>

            {/* Mobile footer */}
            <p className="lg:hidden text-center text-[10px] text-white/25 mt-5">
              © {new Date().getFullYear()} Auto Core. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
