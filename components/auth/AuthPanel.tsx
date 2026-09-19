import Link from "next/link";
import { Shield, Truck, Star, Zap, RotateCcw, CheckCircle } from "lucide-react";

const stats = [
  { icon: Truck, value: "Free Shipping", desc: "On orders over $75" },
  { icon: Shield, value: "OEM Quality", desc: "Genuine & verified parts" },
  { icon: RotateCcw, value: "30-Day Returns", desc: "Hassle-free returns" },
  { icon: Zap, value: "24hr Dispatch", desc: "Same day processing" },
];

const testimonial = {
  body: "Auto Core saved me hours of searching. Got the exact OEM parts I needed for my Camry delivered next day.",
  author: "Marcus R.",
  role: "Verified Buyer · Toyota Camry 2021",
  rating: 5,
};

interface AuthPanelProps {
  mode: "login" | "register";
}

export default function AuthPanel({ mode }: AuthPanelProps) {
  return (
    <div className="relative hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 flex-col bg-[#0d0d0d] overflow-hidden">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #d4f000 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Yellow accent bar top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#d4f000]" />
      {/* Glowing orb */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#d4f000]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#d4f000]/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col h-full px-10 py-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-auto">
          <div className="w-10 h-10 bg-[#d4f000] rounded-xl flex items-center justify-center">
            <span className="text-[#0d0d0d] font-black text-lg leading-none">AC</span>
          </div>
          <div>
            <div className="font-black text-white text-xl tracking-tight leading-none">
              AUTO CORE
            </div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
              Parts &amp; Accessories
            </div>
          </div>
        </Link>

        {/* Main headline */}
        <div className="my-10">
          <div className="inline-flex items-center gap-2 bg-[#d4f000]/10 border border-[#d4f000]/20 text-[#d4f000] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Zap size={11} />
            {mode === "login" ? "Welcome back" : "Join Auto Core"}
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-white leading-[1.1] tracking-tight">
            Reliable Parts
            <br />
            For Your Car —
            <br />
            <span className="text-[#d4f000]">Trust.</span>
          </h2>
          <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-xs">
            {mode === "login"
              ? "Sign in to access your orders, saved vehicles, wishlists, and exclusive member deals."
              : "Create your free account to unlock order tracking, saved vehicles, wishlists, and loyalty rewards."}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {stats.map(({ icon: Icon, value, desc }) => (
            <div
              key={value}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#d4f000]/30 transition-colors"
            >
              <Icon size={16} className="text-[#d4f000] mb-2" />
              <div className="font-bold text-white text-xs leading-tight">{value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            &ldquo;{testimonial.body}&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#d4f000]/20 rounded-full flex items-center justify-center">
              <span className="text-[#d4f000] font-black text-xs">
                {testimonial.author[0]}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{testimonial.author}</div>
              <div className="text-[10px] text-gray-500">{testimonial.role}</div>
            </div>
            <CheckCircle size={14} className="ml-auto text-green-500 shrink-0" />
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-[10px] text-gray-600 text-center">
          © {new Date().getFullYear()} Auto Core. All rights reserved.
        </p>
      </div>
    </div>
  );
}
