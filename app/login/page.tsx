"use client";

/**
 * Login — sequential Email + Password → Email OTP flow.
 *
 * Step 1 (credentials): validate email + password via signInWithPassword.
 *   On success the password-only session is immediately revoked (signOut
 *   scope:"local"). An email OTP is then dispatched via signInWithOtp.
 *   No protected page is reachable until the OTP is verified.
 *
 * Step 2 (otp): verifyOtp type:"email" is the session-granting call.
 *   Only after this succeeds is the profile loaded and the redirect made.
 */

import { useState, Suspense, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  AlertCircle, RefreshCw, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/ui/BrandLogo";
import { destinationFor, safeInternalPath } from "@/lib/auth";
import type { Profile } from "@/types/database";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=90&fit=crop";

const configuredLen = Number.parseInt(
  process.env.NEXT_PUBLIC_SUPABASE_EMAIL_OTP_LENGTH ?? "6", 10,
);
const OTP_LEN = Number.isInteger(configuredLen) && configuredLen > 0 ? configuredLen : 6;
const COOLDOWN = 60;

function friendly(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Cannot connect. Check your internet connection.";
  if (m.includes("rate") || m.includes("too many"))
    return "Too many attempts. Please wait before trying again.";
  if (m.includes("expired"))
    return "That code has expired. Request a new one.";
  if (m.includes("invalid") || m.includes("token") || m.includes("otp"))
    return "That code is invalid. Check the digits and try again.";
  return msg;
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

// ── OTP step ──────────────────────────────────────────────────
function OtpStep({ email, onSuccess, onBack }: {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN);
  const guard = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const verify = useCallback(async () => {
    if (guard.current || loading) return;
    if (otp.length !== OTP_LEN) { setError(`Enter all ${OTP_LEN} digits.`); return; }
    guard.current = true;
    setError(""); setLoading(true);
    const { error: e } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setLoading(false); guard.current = false;
    if (e) { setError(friendly(e.message)); } else { onSuccess(); }
  }, [otp, email, onSuccess, loading]);

  const resend = async () => {
    if (resending || loading || cooldown > 0) return;
    setResending(true); setResent(false); setError("");
    const { error: e } = await supabase.auth.signInWithOtp({
      email, options: { shouldCreateUser: false },
    });
    setResending(false);
    if (e) { setError(friendly(e.message)); return; }
    setOtp(""); setCooldown(COOLDOWN); setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  const inputCls =
    "w-full rounded-xl border-2 border-white/20 bg-white/5 px-4 py-3 " +
    "text-center font-mono text-2xl font-black tracking-[0.35em] text-white " +
    "caret-[#D8FF00] placeholder:text-white/20 " +
    "focus:border-[#D8FF00] focus:outline-none focus:ring-2 focus:ring-[#D8FF00]/25 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="w-full min-h-[500px] sm:min-h-[510px]">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#D8FF00]/10 border border-[#D8FF00]/30 mb-4">
          <Mail size={24} className="text-[#D8FF00]" aria-hidden="true"/>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Check your email</h2>
        <p className="text-white/50 text-sm mt-2">We sent a {OTP_LEN}-digit code to</p>
        <p className="text-[#D8FF00] font-bold text-sm mt-0.5 break-all">{email}</p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-3.5 py-3 mb-4 text-sm">
          <AlertCircle size={14} className="shrink-0" aria-hidden="true"/>{error}
        </div>
      )}
      {resent && (
        <div role="status" className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl px-3.5 py-3 mb-4 text-sm">
          <CheckCircle2 size={14} className="shrink-0" aria-hidden="true"/>New code sent — check your inbox.
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); void verify(); }} noValidate className="space-y-5">
        <div>
          <label htmlFor="otp-input" className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
            Verification code
          </label>
          <input
            id="otp-input"
            name="one-time-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={OTP_LEN}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LEN)); setError(""); }}
            disabled={loading}
            autoFocus
            aria-describedby="otp-hint"
            className={inputCls}
            placeholder={"·".repeat(OTP_LEN)}
          />
          <p id="otp-hint" className="mt-1.5 text-xs text-white/40">
            Enter or paste the {OTP_LEN}-digit code from your email.
          </p>
        </div>

        <button type="submit" disabled={loading || otp.length !== OTP_LEN}
          className="w-full flex items-center justify-center gap-2 bg-[#D8FF00] text-[#0A0A0A] font-black py-3.5 rounded-xl hover:bg-[#c8ef00] disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
          style={{ boxShadow: "0 4px 24px rgba(216,255,0,0.28)" }}>
          {loading ? <><Spinner/>Verifying…</> : <>Verify &amp; Sign In <ArrowRight size={15} aria-hidden="true"/></>}
        </button>
      </form>

      <div className="flex items-center justify-between mt-4 gap-3">
        <button type="button" onClick={onBack} disabled={loading}
          className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={resend} disabled={resending || loading || cooldown > 0}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#D8FF00] hover:text-[#e8ff55] disabled:opacity-50 transition-colors">
          {resending
            ? <><Spinner size={13}/>Sending…</>
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : <><RefreshCw size={13} aria-hidden="true"/>Resend code</>}
        </button>
      </div>

      <p className="text-center text-xs text-white/25 mt-5">
        Didn&apos;t receive anything? Check your spam folder.
      </p>
    </div>
  );
}

// ── Credentials step ──────────────────────────────────────────
function CredentialsStep({ onOtpSent }: { onOtpSent: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const guard = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guard.current) return;
    setError("");
    const trimmed = email.trim();
    if (!trimmed)  { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    guard.current = true; setLoading(true);

    // 1. Verify credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmed, password,
    });

    if (signInError) {
      setLoading(false); guard.current = false;
      const m = signInError.message.toLowerCase();
      if (m.includes("failed to fetch") || m.includes("networkerror"))
        setError("Cannot connect. Check your internet connection.");
      else if (m.includes("email not confirmed"))
        setError("Email not confirmed yet. Check your inbox for a verification email.");
      else if (m.includes("invalid login") || m.includes("invalid credentials"))
        setError("Incorrect email or password.");
      else
        setError(signInError.message);
      return;
    }

    // 2. Revoke the password-only session immediately.
    //    No protected page is reachable until the OTP is verified.
    await supabase.auth.signOut({ scope: "local" });

    // 3. Dispatch the email OTP (type:"email", not signup).
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: trimmed, options: { shouldCreateUser: false },
    });

    setLoading(false); guard.current = false;

    if (otpErr) {
      const m = otpErr.message.toLowerCase();
      if (m.includes("failed to fetch") || m.includes("network"))
        setError("Cannot connect. Check your internet connection.");
      else if (m.includes("rate") || m.includes("too many"))
        setError("Too many requests. Please wait a minute before trying again.");
      else
        setError(`Could not send verification code: ${otpErr.message}`);
      return;
    }

    onOtpSent(trimmed);
  };

  const inputCls = [
    "w-full rounded-xl px-4 py-3 pl-10 text-sm",
    "bg-white/5 border border-white/10 text-white placeholder-white/30",
    "focus:outline-none focus:ring-2 focus:ring-[#D8FF00]/60 focus:border-[#D8FF00]/40",
    "transition-colors disabled:opacity-50",
  ].join(" ");

  return (
    <div className="w-full min-h-[500px] sm:min-h-[510px]">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
        <p className="text-white/50 text-sm mt-1">
          Enter your details — we&apos;ll send a one-time code to confirm it&apos;s you.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-3.5 py-3 mb-4 text-sm">
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true"/>{error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
            Email address
          </label>
          <div className="relative">
            <input
              id="login-email"
              name="username"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              autoComplete="username"
              required
              disabled={loading}
              className={inputCls}
            />
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" aria-hidden="true"/>
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
              Password
            </label>
            <Link href="/forgot-password" className="text-[11px] font-semibold text-[#D8FF00] hover:text-[#e8ff55] transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Your password"
              autoComplete="current-password"
              required
              disabled={loading}
              className={`${inputCls} pr-10`}
            />
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" aria-hidden="true"/>
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              aria-label={showPwd ? "Hide password" : "Show password"}>
              {showPwd ? <EyeOff size={15} aria-hidden="true"/> : <Eye size={15} aria-hidden="true"/>}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#D8FF00] text-[#0A0A0A] font-black py-3.5 rounded-xl hover:bg-[#c8ef00] disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide mt-1"
          style={{ boxShadow: "0 4px 24px rgba(216,255,0,0.28)" }}>
          {loading ? <><Spinner/>Sending code…</> : <>Sign In <ArrowRight size={15} aria-hidden="true"/></>}
        </button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[#D8FF00] hover:text-[#e8ff55] transition-colors">
          Create account
        </Link>
      </p>
      <p className="text-[10px] text-white/20 text-center mt-3 leading-relaxed">
        By signing in you agree to our{" "}
        <Link href="/terms" className="underline hover:text-white/40">Terms</Link>{" "}&amp;{" "}
        <Link href="/privacy" className="underline hover:text-white/40">Privacy Policy</Link>.
      </p>
    </div>
  );
}

// ── LoginForm — manages step state ───────────────────────────
function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from");

  const [step, setStep]     = useState<"credentials" | "otp">("credentials");
  const [email, setEmail]   = useState("");

  const finishSignIn = useCallback(async () => {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) { setStep("credentials"); return; }

    const { data, error: profileErr } = await supabase
      .from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (profileErr || !data) {
      await supabase.auth.signOut({ scope: "local" });
      setStep("credentials");
      return;
    }

    const profile = data as Profile;
    if (!profile.is_active) {
      await supabase.auth.signOut({ scope: "local" });
      setStep("credentials");
      return;
    }

    const safeDest = destinationFor(profile, safeInternalPath(from, "/account"));
    router.replace(safeDest);
    router.refresh();
  }, [router, from]);

  return step === "otp" ? (
    <OtpStep
      email={email}
      onSuccess={() => void finishSignIn()}
      onBack={() => { setStep("credentials"); setEmail(""); }}
    />
  ) : (
    <CredentialsStep
      onOtpSent={(e) => { setEmail(e); setStep("otp"); }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden overflow-y-scroll [scrollbar-gutter:stable]">
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage:`url(${BG_IMAGE})`, backgroundSize:"cover", backgroundPosition:"center" }}/>
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background:"linear-gradient(105deg,rgba(10,10,10,0.92) 0%,rgba(10,10,10,0.75) 50%,rgba(10,10,10,0.55) 100%)" }}/>

      <div className="relative z-10 min-h-dvh flex flex-col lg:flex-row">
        {/* Left — brand */}
        <div className="flex flex-col justify-between px-8 py-10 lg:px-14 lg:py-12 lg:w-[55%] xl:w-[58%]">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Auto Core home">
            <BrandLogo size="nav" alt="Auto Core"/>
          </Link>
          <div className="hidden lg:block">
            <div className="w-10 h-[3px] bg-[#D8FF00] rounded-full mb-7"/>
            <div className="text-[#D8FF00] font-black leading-none tracking-tight mb-5"
              style={{ fontSize:"clamp(3.2rem,5.5vw,5rem)" }}>
              Built To<br/>Last.
            </div>
            <p className="text-white/60 text-base leading-relaxed max-w-sm mb-3">
              Quality auto parts. Reliable performance.
            </p>
            <p className="text-white/35 text-sm">Sign in to continue to your AUTO CORE account.</p>
            <div className="flex flex-wrap gap-2.5 mt-10">
              {[["500K+","Parts In Stock"],["200+","Trusted Brands"],["4.9★","Customer Rating"],["24hr","Same-Day Dispatch"]].map(([v,l])=>(
                <div key={l} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <span className="text-[#D8FF00] font-black text-sm">{v}</span>
                  <span className="text-white/40 text-xs font-medium">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="hidden lg:block text-[10px] text-white/20 mt-auto">
            © {new Date().getFullYear()} Auto Core. All rights reserved.
          </p>
        </div>

        {/* Right — card */}
        <div className="flex items-start justify-center px-5 py-8 lg:py-12 lg:px-12 xl:px-16 lg:w-[45%] xl:w-[42%]">
          <div className="w-full max-w-[400px]">
            <div className="lg:hidden mb-6 text-center">
              <span className="text-[#D8FF00] font-black text-3xl tracking-tight leading-none">Built To Last.</span>
              <p className="text-white/40 text-xs mt-1">Quality auto parts. Reliable performance.</p>
            </div>

            <div className="rounded-2xl p-7 sm:p-8"
              style={{ background:"rgba(17,17,17,0.92)", border:"1px solid rgba(255,255,255,0.09)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", boxShadow:"0 24px 64px rgba(0,0,0,0.55)" }}>
              <Suspense fallback={
                <div className="flex min-h-[500px] items-center justify-center sm:min-h-[510px]">
                  <Spinner/>
                </div>
              }>
                <LoginForm/>
              </Suspense>
            </div>

            <p className="lg:hidden text-center text-[10px] text-white/25 mt-5">
              © {new Date().getFullYear()} Auto Core.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
