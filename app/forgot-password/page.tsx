"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthPanel from "@/components/auth/AuthPanel";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/account` }
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex">
      <AuthPanel mode="login" />
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {sent ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={36} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#0d0d0d] mb-2">Check your inbox</h2>
                <p className="text-gray-500 text-sm mb-8">
                  We sent a password reset link to <span className="font-bold text-[#0d0d0d]">{email}</span>.
                  It expires in 15 minutes.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-8 py-3.5 rounded-xl hover:bg-[#c4e000] transition-colors"
                >
                  Back to Sign In <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d0d0d] transition-colors mb-8">
                  <ArrowLeft size={15} /> Back to Sign In
                </Link>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d] mb-2">Reset your password</h1>
                <p className="text-sm text-gray-500 mb-8">
                  Enter the email address linked to your account and we&apos;ll send you a reset link.
                </p>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent focus:bg-white transition"
                      />
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] transition-all disabled:opacity-60 text-base"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>Send Reset Link <ArrowRight size={17} /></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
