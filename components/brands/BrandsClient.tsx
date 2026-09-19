"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, ArrowRight, Star } from "lucide-react";
import { brands, products } from "@/lib/data";

const BRAND_COLORS: Record<string, string> = {
  "bosch":   "hover:border-red-400",
  "acdelco": "hover:border-blue-400",
  "denso":   "hover:border-blue-500",
  "monroe":  "hover:border-yellow-400",
  "brembo":  "hover:border-red-500",
  "kn":      "hover:border-red-400",
  "ngk":     "hover:border-gray-600",
  "moog":    "hover:border-blue-600",
};

const BRAND_DESCRIPTIONS: Record<string, { country: string; founded: string; specialty: string; highlight: string }> = {
  "bosch":   { country: "Germany", founded: "1886", specialty: "Electrical & Engine",   highlight: "World's largest auto parts supplier" },
  "acdelco": { country: "USA",     founded: "1916", specialty: "OEM Replacement",       highlight: "Official GM parts brand" },
  "denso":   { country: "Japan",   founded: "1949", specialty: "Engine & Electrical",   highlight: "Toyota's primary OEM supplier" },
  "monroe":  { country: "USA",     founded: "1916", specialty: "Suspension & Ride",     highlight: "#1 shock absorber brand in North America" },
  "brembo":  { country: "Italy",   founded: "1961", specialty: "Braking Systems",       highlight: "Trusted by F1 teams worldwide" },
  "kn":      { country: "USA",     founded: "1969", specialty: "Air Filtration",        highlight: "Pioneered washable performance filters" },
  "ngk":     { country: "Japan",   founded: "1936", specialty: "Spark Plugs & Sensors", highlight: "Supplies 70% of the world's spark plugs" },
  "moog":    { country: "USA",     founded: "1919", specialty: "Chassis & Steering",    highlight: "Problem Solver® technology" },
};

export default function BrandsClient() {
  const [search, setSearch] = useState("");

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-[#0d0d0d] font-semibold">Brands</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-1 bg-[#d4f000] rounded-full inline-block" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">Trusted</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d0d0d]">Shop by Brand</h1>
            <p className="text-sm text-gray-500 mt-1">{brands.length} top automotive brands — all genuine, all verified.</p>
          </div>
          <div className="relative shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands…"
              className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] w-52"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Featured brands — large cards */}
      <div className="mb-10">
        <h2 className="text-lg font-extrabold text-[#0d0d0d] mb-4">Featured Brands</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.filter((b) => b.isFeatured).map((brand) => {
            const info = BRAND_DESCRIPTIONS[brand.slug];
            const brandProducts = products.filter((p) => p.brand === brand.name);
            const avgRating = brandProducts.length
              ? brandProducts.reduce((s, p) => s + p.rating, 0) / brandProducts.length
              : 4.7;
            return (
              <Link
                key={brand.id}
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className={`group bg-white border-2 border-gray-100 ${BRAND_COLORS[brand.slug] ?? "hover:border-[#d4f000]"} rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 product-card`}
              >
                {/* Logo / Name */}
                <div className="h-14 flex items-center justify-center bg-[#f9f9f9] rounded-xl px-4">
                  <span className="font-black text-xl text-[#0d0d0d] tracking-tight">{brand.name}</span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{brand.description}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold bg-[#f4f4f4] text-gray-600 px-2 py-0.5 rounded-full">
                    {info?.country ?? "International"}
                  </span>
                  <span className="text-[10px] font-semibold bg-[#f4f4f4] text-gray-600 px-2 py-0.5 rounded-full">
                    Est. {info?.founded ?? "—"}
                  </span>
                </div>

                {info?.highlight && (
                  <div className="text-[10px] text-gray-400 italic border-t border-gray-100 pt-2">
                    &ldquo;{info.highlight}&rdquo;
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-600">{avgRating.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-400">
                      · {brand.productCount.toLocaleString()} parts
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#d4f000] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All brands — compact grid */}
      {filtered.filter((b) => !b.isFeatured).length > 0 && (
        <div>
          <h2 className="text-lg font-extrabold text-[#0d0d0d] mb-4">All Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.filter((b) => !b.isFeatured).map((brand) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#d4f000] hover:shadow-sm transition-all"
              >
                <span className="font-extrabold text-[#0d0d0d] text-sm text-center">{brand.name}</span>
                <span className="text-[10px] text-gray-400">{brand.productCount.toLocaleString()} parts</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <p className="font-bold text-[#0d0d0d]">No brands match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch("")} className="mt-3 text-sm text-gray-400 underline">Clear search</button>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 bg-[#0d0d0d] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #d4f000 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-white">Can&apos;t find your brand?</h3>
          <p className="text-sm text-gray-400 mt-1">We carry 200+ brands. Browse our full catalogue.</p>
        </div>
        <Link href="/shop" className="relative flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-3 rounded-xl hover:bg-[#c4e000] transition-colors shrink-0 text-sm">
          Shop All Parts <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
