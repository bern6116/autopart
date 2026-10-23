"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";
import OtpInput from "@/components/ui/OtpInput";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  ArrowRight, AlertCircle, CheckCircle2, RefreshCw,
} from "lucide-react";
import AuthPanel from "@/components/auth/AuthPanel";
import { supabase } from "@/lib/supabase";

// ── Google icon ────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ── Inline spinner ─────────────────────────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Validation helpers ─────────────────────────────────────────
// Philippine mobile/landline + generic international
const PH_OR_INTL_PHONE =
  /^(\+63[\s\-]?|0)(9\d{9}|2[\s\-]?\d{7,8}|\d{7,11})$|^\+(?!63)\d{1,3}[\s\-]?\d{4,14}$/;

// Unicode letters, spaces, apostrophes, hyphens
const NAME_PATTERN = /^[\p{L}\p{M}\s'\-]+$/u;

// ── Password strength ──────────────────────────────────────────
function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { score: 1, label: "Weak",   color: "bg-red-400"    },
    { score: 2, label: "Fair",   color: "bg-orange-400" },
    { score: 3, label: "Good",   color: "bg-yellow-400" },
    { score: 4, label: "Strong", color: "bg-green-500"  },
  ];
  return map[score - 1] ?? { score: 0, label: "", color: "" };
}

// Build full name without inserting "null" or extra spaces
function buildFullName(first: string, middle: string, last: string): string {
  return [first, middle, last].map((s) => s.trim()).filter(Boolean).join(" ");
}

// ── Types ──────────────────────────────────────────────────────
interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
  form?: string;
}

// ── Shared style tokens ────────────────────────────────────────
//
// inputBase: 48 px tall (py-3 = 12px top+bottom, text-sm line-height ~24px → 48px total)
// All inputs use pl-10 so the 16px icon at left-3 (12px) sits centred.
const inputBase =
  "w-full bg-[#f5f5f5] border border-gray-200 rounded-lg px-4 py-3 pl-10 text-sm text-gray-800 " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent " +
  "focus:bg-white transition-all";

const labelBase = "block text-sm font-medium text-gray-700 mb-1.5";

// Inline field error
function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle size={11} aria-hidden="true" />
      {msg}
    </p>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function RegisterPage() {
  const submitGuard = useRef(false);
  const verifyGuard = useRef(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors]             = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [step, setStep]                 = useState<"form" | "otp" | "done">("form");

  const [otp, setOtp]               = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError]     = useState("");
  const [resending, setResending]   = useState(false);
  const [resent, setResent]         = useState(false);
  // Resend cooldown: seconds remaining
  const [resendCooldown, setResendCooldown] = useState(0);

  // Tick the resend cooldown down every second
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const trimOnBlur = (field: keyof FormState) => () => {
    const v = form[field];
    if (typeof v === "string") set(field, v.trim());
  };

  const handleOtpSuccess = useCallback(() => setStep("done"), []);

  // ── OTP verify ──────────────────────────────────────────────
  // Uses type: "signup" — the correct Supabase flow for confirming
  // a registration request, NOT passwordless login OTP.
  const verifyOtp = async () => {
    if (verifyGuard.current) return; // prevent duplicate submission
    if (otp.length < 6) { setOtpError("Enter the 6-digit code."); return; }

    verifyGuard.current = true;
    setOtpError("");
    setOtpLoading(true);

    const { data, error: vErr } = await supabase.auth.verifyOtp({
      email: form.email.trim(),
      token: otp,
      type: "signup",
    });

    setOtpLoading(false);
    verifyGuard.current = false;

    if (vErr) {
      const m = vErr.message.toLowerCase();
      if (m.includes("rate") || m.includes("too many") || m.includes("overloaded")) {
        setOtpError("Too many attempts. Wait a minute and try again.");
      } else if (m.includes("invalid") || m.includes("expired")) {
        setOtpError("Invalid or expired code. Request a new one.");
      } else if (m.includes("fetch") || m.includes("network")) {
        setOtpError("Network error. Check your connection and try again.");
      } else {
        setOtpError(vErr.message);
      }
      return;
    }

    // verifyOtp with type:"signup" establishes a session automatically.
    // Per the requirement, the user should sign in explicitly — sign out
    // the transient session so the done step can direct them to /login.
    if (data?.session) {
      await supabase.auth.signOut();
    }

    handleOtpSuccess();
  };

  // ── OTP resend ──────────────────────────────────────────────
  // Uses type: "signup" resend — re-sends the confirmation email for
  // the original signup request. Does NOT send on rerenders — only
  // on explicit user click when the cooldown has elapsed.
  const resendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setResent(false);
    setOtpError("");

    const { error: rErr } = await supabase.auth.resend({
      type: "signup",
      email: form.email.trim(),
    });

    setResending(false);

    if (rErr) {
      const m = rErr.message.toLowerCase();
      if (m.includes("rate") || m.includes("too many") || m.includes("overloaded")) {
        setOtpError("Too many requests. Please wait a minute before resending.");
      } else if (m.includes("fetch") || m.includes("network")) {
        setOtpError("Network error. Check your connection and try again.");
      } else {
        setOtpError(rErr.message);
      }
      return;
    }

    setResent(true);
    setResendCooldown(60); // 60-second cooldown per Supabase rate limits
    setTimeout(() => setResent(false), 4000);
  };

  // ── Validation ──────────────────────────────────────────────
  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    const fn = form.firstName.trim();
    if (!fn)                          errs.firstName = "First name is required.";
    else if (!NAME_PATTERN.test(fn))  errs.firstName = "First name contains invalid characters.";

    const mn = form.middleName.trim();
    if (mn && !NAME_PATTERN.test(mn)) errs.middleName = "Middle name contains invalid characters.";

    const ln = form.lastName.trim();
    if (!ln)                          errs.lastName = "Last name is required.";
    else if (!NAME_PATTERN.test(ln))  errs.lastName = "Last name contains invalid characters.";

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    const phone = form.phone.trim();
    if (phone && !PH_OR_INTL_PHONE.test(phone)) {
      errs.phone = "Enter a valid number (e.g. 09XX XXX XXXX or +63 9XX XXX XXXX).";
    }

    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!form.agreeTerms) errs.agreeTerms = "You must accept the Terms & Conditions.";

    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitGuard.current) return;

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    submitGuard.current = true;
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          first_name:  form.firstName.trim(),
          middle_name: form.middleName.trim() || null,
          last_name:   form.lastName.trim(),
          phone:       form.phone.trim() || null,
          full_name:   buildFullName(form.firstName, form.middleName, form.lastName),
        },
      },
    });

    setLoading(false);
    submitGuard.current = false;

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("fetch") || msg.includes("networkerror")) {
        setErrors({ form: "Cannot connect to the server. Check your internet connection and try again." });
      } else if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("email taken") ||
        msg.includes("user already registered")
      ) {
        setErrors({ email: "An account with this email already exists. Try signing in." });
      } else {
        setErrors({ form: signUpError.message });
      }
      return;
    }

    // ── Inspect the signUp response ────────────────────────────
    // Supabase returns different shapes depending on whether "Confirm
    // email" is enabled in the dashboard:
    //
    //   data.session non-null  →  confirmation is OFF; user is auto-
    //                             authenticated and NO email is sent.
    //   data.session null +
    //   data.user  non-null    →  confirmation is ON; a verification
    //                             email was dispatched. Proceed to OTP.
    //   data.user null +
    //   data.session null      →  unexpected state with no error.
    //
    // Previously the code ignored `data` entirely and always advanced
    // to the OTP step, which meant "We sent a 6-digit code" appeared
    // even when Supabase never sent an email.
    if (signUpData?.session) {
      // Email confirmation is disabled — user was auto-authenticated.
      // Sign out the transient session so the user signs in explicitly,
      // and surface a clear message instead of showing the OTP screen.
      await supabase.auth.signOut();
      setErrors({
        form:
          "Your account was created, but email verification is not enabled on this project. " +
          "You can sign in directly with your email and password.",
      });
      return;
    }

    if (!signUpData?.user) {
      // No user, no session, no error — should not happen but handle it.
      setErrors({
        form:
          "Signup completed but the server did not return an account. " +
          "Please try again or contact support.",
      });
      return;
    }

    // data.user present, no session → confirmation email was sent.
    setStep("otp");
  };

  const strength = getPasswordStrength(form.password);

  // ════════════════════════════════════════════════════════════
  // OTP step
  // ════════════════════════════════════════════════════════════
  if (step === "otp") {
    return (
      <div className="min-h-screen flex">
        <AuthPanel mode="register" />
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#d4f000]/10 border border-[#d4f000]/30 mb-4">
                <Mail size={24} className="text-[#0d0d0d]" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-[#0d0d0d]">Verify your email</h2>
              <p className="text-gray-500 text-sm mt-2">We sent a 6-digit code to</p>
              <p className="font-semibold text-[#0d0d0d] text-sm mt-0.5 break-all">{form.email}</p>
            </div>

            {resent && (
              <div role="status" className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
                <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
                New code sent — check your inbox.
              </div>
            )}

            {/* Form wrapper enables Enter-key submission */}
            <form
              onSubmit={(e) => { e.preventDefault(); verifyOtp(); }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification code
                </label>
                <OtpInput
                  value={otp}
                  onChange={(v) => { setOtp(v); if (otpError) setOtpError(""); }}
                  disabled={otpLoading}
                  onSubmit={verifyOtp}
                  autoFocus
                  hasError={!!otpError}
                  errorId={otpError ? "otp-error" : undefined}
                />
                {/* Error message below the field — space reserved for layout stability */}
                <div className="min-h-[1.25rem] mt-2">
                  {otpError && (
                    <p
                      id="otp-error"
                      role="alert"
                      aria-live="polite"
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} aria-hidden="true" />
                      {otpError}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold py-3 rounded-lg hover:bg-[#c4e000] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {otpLoading ? <><Spinner />Verifying…</> : <>Verify email <ArrowRight size={15} aria-hidden="true" /></>}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => {
                  // Return to form, clear stale code + errors, preserve details
                  setStep("form");
                  setOtp("");
                  setOtpError("");
                  setResent(false);
                  setResendCooldown(0);
                }}
                className="text-sm text-gray-400 hover:text-[#0d0d0d] transition-colors"
              >
                ← Edit details
              </button>
              {resendCooldown > 0 ? (
                <span className="text-sm text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={resendOtp}
                  disabled={resending || otpLoading}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#0d0d0d] hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  {resending
                    ? <><Spinner size={12} />Sending…</>
                    : <><RefreshCw size={13} aria-hidden="true" />Resend code</>}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Didn&apos;t receive anything? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // Done step — email verified, redirect to login
  // ════════════════════════════════════════════════════════════
  if (step === "done") {
    return (
      <div className="min-h-screen flex">
        <AuthPanel mode="register" />
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-10">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={30} className="text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-[#0d0d0d] mb-2">Email verified</h2>
            <p className="text-gray-500 text-sm mb-8">
              Email verified. Please sign in.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-8 py-3 rounded-lg hover:bg-[#c4e000] transition-colors text-sm"
            >
              Sign in now <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // Main form step
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex">
      <AuthPanel mode="register" />

      {/* Scrollable form panel */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto min-h-screen">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="nav" alt="Auto Core" />
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#0d0d0d]">← Back</Link>
        </div>

        {/* Centred content */}
        <div className="flex-1 flex items-start justify-center px-6 py-10">
          {/*
            max-w-[560px] gives comfortable room for the 3-column name row
            without compressing the columns on a typical 1280px desktop.
          */}
          <div className="w-full max-w-[560px]">

            {/* ── Page heading ── */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0d0d0d] leading-tight">
                Create your account
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#0d0d0d] underline underline-offset-2 hover:text-gray-600"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* ── Google SSO ── */}
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/account` },
                });
              }}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all mb-5"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5" aria-hidden="true">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or register with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ── Form-level error ── */}
            {errors.form && (
              <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* ══════════════════════════════════════════════════
                  NAME ROW
                  ──────────────────────────────────────────────────
                  Technique: 3-column × 3-row shared grid.
                  Labels are direct grid children placed in row 1;
                  inputs in row 2; error slots in row 3.
                  Grid auto-placement assigns columns in DOM order
                  (First → Middle → Last) with no explicit col-start.

                  Row 1 height is set by the tallest label cell.
                  All three labels use `flex flex-col justify-end`
                  so single-line labels align to the bottom of the
                  shared label row — inputs always start at the same
                  vertical position.

                  "Middle name" stays on one line; "Optional" drops
                  to a second line naturally inside the same label.

                  On mobile (< sm) the 3-col grid reverts to 1 col
                  and row-start classes have no effect, producing a
                  natural First → Middle → Last vertical stack.
              ══════════════════════════════════════════════════ */}
              <div
                className="
                  grid grid-cols-1 gap-y-5
                  md:grid-cols-3 md:grid-rows-[auto_auto_auto] md:gap-x-3 md:gap-y-0
                "
              >
                {/* ── First name ── */}
                <label
                  htmlFor="firstName"
                  className="
                    md:row-start-1 md:col-start-1
                    flex flex-col justify-end
                    pb-1.5 text-sm font-medium text-gray-700
                  "
                >
                  First name
                </label>
                <div className="md:row-start-2 md:col-start-1 relative">
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    onBlur={trimOnBlur("firstName")}
                    placeholder="Juan"
                    autoComplete="given-name"
                    aria-required="true"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "err-firstName" : undefined}
                    className={`${inputBase} ${errors.firstName ? "border-red-300 ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  />
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <div className="md:row-start-3 md:col-start-1">
                  <FieldError id="err-firstName" msg={errors.firstName} />
                </div>

                {/* ── Middle name ── */}
                <label
                  htmlFor="middleName"
                  className="
                    md:row-start-1 md:col-start-2
                    flex flex-col justify-end
                    pb-1.5 text-sm font-medium text-gray-700
                  "
                >
                  {/* Single horizontal line: "Middle name (optional)" */}
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                    Middle name
                    <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </span>
                </label>
                <div className="md:row-start-2 md:col-start-2 relative">
                  <input
                    id="middleName"
                    type="text"
                    value={form.middleName}
                    onChange={(e) => set("middleName", e.target.value)}
                    onBlur={trimOnBlur("middleName")}
                    placeholder="Santos"
                    autoComplete="additional-name"
                    aria-required="false"
                    aria-invalid={!!errors.middleName}
                    aria-describedby={errors.middleName ? "err-middleName" : undefined}
                    className={`${inputBase} ${errors.middleName ? "border-red-300 ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  />
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <div className="md:row-start-3 md:col-start-2">
                  <FieldError id="err-middleName" msg={errors.middleName} />
                </div>

                {/* ── Last name ── */}
                <label
                  htmlFor="lastName"
                  className="
                    md:row-start-1 md:col-start-3
                    flex flex-col justify-end
                    pb-1.5 text-sm font-medium text-gray-700
                  "
                >
                  Last name
                </label>
                <div className="md:row-start-2 md:col-start-3 relative">
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    onBlur={trimOnBlur("lastName")}
                    placeholder="dela Cruz"
                    autoComplete="family-name"
                    aria-required="true"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "err-lastName" : undefined}
                    className={`${inputBase} ${errors.lastName ? "border-red-300 ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  />
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <div className="md:row-start-3 md:col-start-3">
                  <FieldError id="err-lastName" msg={errors.lastName} />
                </div>

              </div>{/* /name grid */}

              {/* ── Email ── */}
              <div>
                <label htmlFor="email" className={labelBase}>Email address</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={trimOnBlur("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    className={`${inputBase} ${errors.email ? "border-red-300 ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <FieldError id="err-email" msg={errors.email} />
              </div>

              {/* ── Phone ── */}
              <div>
                <label htmlFor="phone" className={labelBase}>
                  Phone number{" "}
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onBlur={trimOnBlur("phone")}
                    placeholder="09XX XXX XXXX or +63 9XX XXX XXXX"
                    autoComplete="tel"
                    aria-required="false"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    className={`${inputBase} ${errors.phone ? "border-red-300 ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  />
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
                <FieldError id="err-phone" msg={errors.phone} />
              </div>

              {/* ── Password ── */}
              <div>
                <label htmlFor="password" className={labelBase}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      ["password-strength", errors.password ? "err-password" : ""]
                        .filter(Boolean).join(" ") || undefined
                    }
                    className={`${inputBase} pr-10 ${errors.password ? "border-red-300 ring-1 ring-red-300 bg-red-50/30" : ""}`}
                  />
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div id="password-strength" className="mt-2" aria-live="polite">
                    <div className="flex gap-1 h-1" aria-hidden="true">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-medium mt-1 ${
                      strength.score >= 4 ? "text-green-600" :
                      strength.score === 3 ? "text-yellow-600" :
                      strength.score === 2 ? "text-orange-500" : "text-red-500"
                    }`}>
                      {strength.label} password
                    </p>
                  </div>
                )}

                <FieldError id="err-password" msg={errors.password} />
              </div>

              {/* ── Confirm password ── */}
              <div>
                <label htmlFor="confirmPassword" className={labelBase}>Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "err-confirmPassword" : undefined}
                    className={`${inputBase} pr-10 ${
                      errors.confirmPassword
                        ? "border-red-300 ring-1 ring-red-300 bg-red-50/30"
                        : form.confirmPassword && form.confirmPassword === form.password
                        ? "border-green-400 ring-1 ring-green-300"
                        : ""
                    }`}
                  />
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  </button>
                  {/* Match tick — shifted left of the toggle */}
                  {form.confirmPassword && form.confirmPassword === form.password && (
                    <CheckCircle2
                      size={14}
                      className="absolute right-9 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <FieldError id="err-confirmPassword" msg={errors.confirmPassword} />
              </div>

              {/* ── Terms ── */}
              <div>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={form.agreeTerms}
                    onClick={() => set("agreeTerms", !form.agreeTerms)}
                    className={`mt-0.5 w-[18px] h-[18px] shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                      form.agreeTerms
                        ? "bg-[#0d0d0d] border-[#0d0d0d]"
                        : errors.agreeTerms
                        ? "border-red-400"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {form.agreeTerms && (
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="text-sm text-gray-600 cursor-pointer leading-snug"
                    onClick={() => set("agreeTerms", !form.agreeTerms)}
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-[#0d0d0d] underline underline-offset-2 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-[#0d0d0d] underline underline-offset-2 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>
                {errors.agreeTerms && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} aria-hidden="true" />
                    {errors.agreeTerms}
                  </p>
                )}
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold py-3 rounded-lg hover:bg-[#c4e000] active:bg-[#b8d400] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <><Spinner />Creating account…</>
                ) : (
                  <>Create account <ArrowRight size={15} aria-hidden="true" /></>
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
