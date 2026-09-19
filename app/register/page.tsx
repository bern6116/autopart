"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  ArrowRight, AlertCircle, CheckCircle2,
} from "lucide-react";
import AuthPanel from "@/components/auth/AuthPanel";
import { supabase } from "@/lib/supabase";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

// Password strength checker
function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { score: 1, label: "Weak", color: "bg-red-400" },
    { score: 2, label: "Fair", color: "bg-orange-400" },
    { score: 3, label: "Good", color: "bg-yellow-400" },
    { score: 4, label: "Strong", color: "bg-green-500" },
  ];
  return map[score - 1] ?? { score: 0, label: "", color: "" };
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (form.phone && !/^\+?[\d\s\-().]{7,15}$/.test(form.phone)) {
      errs.phone = "Enter a valid phone number.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    // Real Supabase sign-up
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: form.phone.trim(),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (
        signUpError.message.toLowerCase().includes("failed to fetch") ||
        signUpError.message.toLowerCase().includes("networkerror") ||
        signUpError.message.toLowerCase().includes("fetch")
      ) {
        setErrors((prev) => ({ ...prev, email: "Cannot connect to the server. Please check your internet connection and try again." }));
      } else if (signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.message.toLowerCase().includes("already exists") ||
          signUpError.message.toLowerCase().includes("email taken")) {
        setErrors((prev) => ({ ...prev, email: "An account with this email already exists. Try signing in." }));
      } else {
        setErrors((prev) => ({ ...prev, email: signUpError.message }));
      }
      return;
    }

    setSuccess(true);
  };

  const strength = getPasswordStrength(form.password);

  const inputBase =
    "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent focus:bg-white transition";

  const fieldError = (msg?: string) =>
    msg ? (
      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
        <AlertCircle size={11} /> {msg}
      </p>
    ) : null;

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex">
        <AuthPanel mode="register" />
        <div className="flex-1 flex items-center justify-center bg-white px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0d0d0d] mb-2">Account Created!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Welcome to Auto Core. Check your email to verify your address, then sign in to start shopping.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-8 py-3.5 rounded-xl hover:bg-[#c4e000] transition-colors text-base"
            >
              Sign In Now <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — dark promo panel */}
      <AuthPanel mode="register" />

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0d0d0d] rounded-lg flex items-center justify-center">
              <span className="text-[#d4f000] font-black text-sm">AC</span>
            </div>
            <span className="font-black text-[#0d0d0d] text-base">AUTO CORE</span>
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#0d0d0d]">← Back</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d] leading-tight">
                Create your account
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#0d0d0d] underline underline-offset-2 hover:text-gray-600"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Google SSO */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all mb-6"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or register with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* First + Last name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      placeholder="John"
                      autoComplete="given-name"
                      className={`${inputBase} ${errors.firstName ? "border-red-300 ring-1 ring-red-300" : ""}`}
                    />
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {fieldError(errors.firstName)}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      placeholder="Doe"
                      autoComplete="family-name"
                      className={`${inputBase} ${errors.lastName ? "border-red-300 ring-1 ring-red-300" : ""}`}
                    />
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {fieldError(errors.lastName)}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`${inputBase} ${errors.email ? "border-red-300 ring-1 ring-red-300" : ""}`}
                  />
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {fieldError(errors.email)}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Phone Number{" "}
                  <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    autoComplete="tel"
                    className={`${inputBase} ${errors.phone ? "border-red-300 ring-1 ring-red-300" : ""}`}
                  />
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {fieldError(errors.phone)}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={`${inputBase} pr-11 ${errors.password ? "border-red-300 ring-1 ring-red-300" : ""}`}
                  />
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all ${
                            i <= strength.score ? strength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold mt-1 ${
                      strength.score >= 4 ? "text-green-600" :
                      strength.score === 3 ? "text-yellow-600" :
                      strength.score === 2 ? "text-orange-500" : "text-red-500"
                    }`}>
                      {strength.label} password
                    </p>
                  </div>
                )}
                {fieldError(errors.password)}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`${inputBase} pr-11 ${errors.confirmPassword ? "border-red-300 ring-1 ring-red-300" : ""} ${
                      form.confirmPassword && form.confirmPassword === form.password
                        ? "border-green-400 ring-1 ring-green-300"
                        : ""
                    }`}
                  />
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Match checkmark */}
                  {form.confirmPassword && form.confirmPassword === form.password && (
                    <CheckCircle2 size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                  )}
                </div>
                {fieldError(errors.confirmPassword)}
              </div>

              {/* Terms */}
              <div className="pt-1">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={form.agreeTerms}
                    onClick={() => set("agreeTerms", !form.agreeTerms)}
                    className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      form.agreeTerms
                        ? "bg-[#0d0d0d] border-[#0d0d0d]"
                        : errors.agreeTerms
                        ? "border-red-400"
                        : "border-gray-300 hover:border-[#0d0d0d]"
                    }`}
                  >
                    {form.agreeTerms && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="text-sm text-gray-600 cursor-pointer leading-relaxed"
                    onClick={() => set("agreeTerms", !form.agreeTerms)}
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-bold text-[#0d0d0d] underline underline-offset-2 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-bold text-[#0d0d0d] underline underline-offset-2 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>
                {fieldError(errors.agreeTerms)}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] active:bg-[#b8d400] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="text-sm text-gray-500 text-center mt-7">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-extrabold text-[#0d0d0d] hover:text-gray-600 transition-colors"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
