import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">

        {/* Main Promo — Online Exclusive */}
        <div className="relative overflow-hidden bg-[#0d0d0d] rounded-2xl">
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #d4f000 1px, transparent 0)", backgroundSize: "28px 28px" }}
          />
          {/* Yellow accent strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#d4f000]" />

          <div className="relative px-6 sm:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#d4f000]/10 border border-[#d4f000]/30 text-[#d4f000] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Zap size={12} />
                Online Exclusive
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Online Exclusive
                <br />
                <span className="text-[#d4f000]">Auto Parts</span>
              </h2>
              <p className="mt-3 text-gray-400 text-sm max-w-md">
                Shop our web-only selection of premium parts at unbeatable prices. New deals added every week — only available online.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/shop?filter=online-exclusive"
                  className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-7 py-3.5 rounded-xl hover:bg-[#c4e000] transition-colors text-sm"
                >
                  Shop Now <ArrowRight size={15} />
                </Link>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  View All Deals
                </Link>
              </div>
            </div>

            {/* Right stats */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { icon: Zap, value: "30%", label: "Off Select Parts" },
                { icon: Truck, value: "24hr", label: "Dispatch" },
                { icon: Shield, value: "OEM", label: "Quality Guaranteed" },
                { icon: Shield, value: "1000+", label: "Exclusive SKUs" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[110px]">
                  <Icon size={18} className="text-[#d4f000] mx-auto mb-1.5" />
                  <div className="text-[#d4f000] font-black text-lg leading-tight">{value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two smaller promo cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Card 1 — Free Shipping */}
          <div className="bg-[#f9f9f9] border-2 border-gray-100 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-[#d4f000] rounded-2xl flex items-center justify-center shrink-0">
              <Truck size={26} className="text-[#0d0d0d]" />
            </div>
            <div>
              <div className="font-extrabold text-[#0d0d0d] text-lg leading-tight">Free Shipping</div>
              <div className="text-gray-500 text-sm mt-0.5">On all orders over <span className="font-bold text-[#0d0d0d]">$75</span></div>
              <Link href="/shipping" className="text-xs font-bold text-[#0d0d0d] underline mt-1 inline-block hover:text-gray-600">
                Learn more →
              </Link>
            </div>
          </div>

          {/* Card 2 — Loyalty */}
          <div className="bg-[#0d0d0d] border-2 border-[#d4f000]/20 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-[#d4f000]/10 border border-[#d4f000]/20 rounded-2xl flex items-center justify-center shrink-0">
              <Zap size={26} className="text-[#d4f000]" />
            </div>
            <div>
              <div className="font-extrabold text-white text-lg leading-tight">Earn Rewards</div>
              <div className="text-gray-500 text-sm mt-0.5">Get <span className="font-bold text-[#d4f000]">5% back</span> on every order</div>
              <Link href="/rewards" className="text-xs font-bold text-[#d4f000] underline mt-1 inline-block hover:text-[#e8ff33]">
                Join for free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
