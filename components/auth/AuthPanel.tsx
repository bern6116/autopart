import Link from "next/link";
import { ClipboardList, Car, Search } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

// Only features that are genuinely implemented in the app
const features = [
  {
    icon: ClipboardList,
    label: "Order tracking",
    desc: "Follow every order from placement to pickup.",
  },
  {
    icon: Car,
    label: "Saved vehicles",
    desc: "Keep your vehicles on file for faster browsing.",
  },
  {
    icon: Search,
    label: "Wide selection",
    desc: "Thousands of verified parts across all categories.",
  },
];

interface AuthPanelProps {
  mode: "login" | "register";
}

export default function AuthPanel({ mode }: AuthPanelProps) {
  return (
    <div className="relative hidden lg:flex lg:w-[440px] xl:w-[480px] shrink-0 flex-col bg-[#0d0d0d]">
      {/* Lime accent line along the top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#d4f000]" />

      <div className="flex flex-col h-full px-10 py-10">

        {/* Logo + wordmark */}
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Auto Core home">
          <BrandLogo size="nav" alt="Auto Core" />
          <div>
            <div className="font-black text-white text-lg tracking-tight leading-none">AUTO CORE</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
              Parts &amp; Accessories
            </div>
          </div>
        </Link>

        {/* Heading block */}
        <div className="mt-14 mb-10">
          <h2 className="text-[2rem] font-black text-white leading-[1.15] tracking-tight">
            Your parts.
            <br />
            <span className="text-[#d4f000]">Your account.</span>
          </h2>
          <p className="mt-4 text-[0.875rem] text-gray-400 leading-relaxed max-w-[22rem]">
            {mode === "login"
              ? "Sign in to manage your orders, saved vehicles, and account details."
              : "Create an account to manage your orders and saved vehicles."}
          </p>
        </div>

        {/* Feature rows */}
        <ul className="space-y-5" aria-label="Account features">
          {features.map(({ icon: Icon, label, desc }) => (
            <li key={label} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#d4f000]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white leading-tight">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</div>
              </div>
            </li>
          ))}
        </ul>

        {/* Spacer pushes copyright to bottom */}
        <div className="flex-1" />

        <p className="text-[10px] text-gray-600">
          © {new Date().getFullYear()} Auto Core. All rights reserved.
        </p>
      </div>
    </div>
  );
}
