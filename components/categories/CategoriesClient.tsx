"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Grid3X3, List, ChevronRight } from "lucide-react";
import { categories } from "@/lib/data";

// Extended category metadata — descriptions, features, popular sub-items
const CATEGORY_META: Record<
  string,
  { features: string[]; popular: string[]; accentColor: string; bgColor: string }
> = {
  "engine-parts": {
    features: ["Pistons & Rings", "Gaskets & Seals", "Timing Components", "Oil Pumps"],
    popular: ["Head Gaskets", "Timing Belts", "Spark Plugs", "Valve Covers"],
    accentColor: "#f97316",
    bgColor: "bg-orange-50 border-orange-100",
  },
  "brake-system": {
    features: ["Brake Pads", "Rotors & Discs", "Calipers", "Brake Lines"],
    popular: ["Ceramic Pads", "Drilled Rotors", "Brake Kits", "Brake Fluid"],
    accentColor: "#ef4444",
    bgColor: "bg-red-50 border-red-100",
  },
  "suspension": {
    features: ["Shock Absorbers", "Strut Assemblies", "Control Arms", "Sway Bars"],
    popular: ["Monroe Struts", "Ball Joints", "Tie Rod Ends", "Coilovers"],
    accentColor: "#3b82f6",
    bgColor: "bg-blue-50 border-blue-100",
  },
  "electrical": {
    features: ["Alternators", "Starters", "Batteries", "Sensors & Switches"],
    popular: ["O2 Sensors", "MAF Sensors", "Alternators", "Ignition Coils"],
    accentColor: "#eab308",
    bgColor: "bg-yellow-50 border-yellow-100",
  },
  "wheels-tires": {
    features: ["Alloy Wheels", "Steel Rims", "All-Season Tires", "Performance Tires"],
    popular: ["18\" Alloys", "Winter Tires", "Lug Nuts", "TPMS Sensors"],
    accentColor: "#6b7280",
    bgColor: "bg-gray-50 border-gray-200",
  },
  "filters": {
    features: ["Oil Filters", "Air Filters", "Fuel Filters", "Cabin Filters"],
    popular: ["K&N Filters", "Cabin Air", "Fuel Filters", "Oil Filters"],
    accentColor: "#10b981",
    bgColor: "bg-green-50 border-green-100",
  },
  "lighting": {
    features: ["Headlights", "Tail Lights", "LED Upgrades", "Fog Lights"],
    popular: ["LED Headlights", "DRL Kits", "Fog Lights", "Turn Signals"],
    accentColor: "#f59e0b",
    bgColor: "bg-amber-50 border-amber-100",
  },
  "body-parts": {
    features: ["Bumpers", "Fenders", "Hoods", "Side Mirrors"],
    popular: ["Front Bumpers", "Door Mirrors", "Grilles", "Mud Flaps"],
    accentColor: "#8b5cf6",
    bgColor: "bg-violet-50 border-violet-100",
  },
  "cooling-system": {
    features: ["Radiators", "Water Pumps", "Thermostats", "Coolant Hoses"],
    popular: ["Radiators", "Thermostats", "Coolant Caps", "Fan Clutches"],
    accentColor: "#06b6d4",
    bgColor: "bg-cyan-50 border-cyan-100",
  },
  "transmission": {
    features: ["Clutch Kits", "Torque Converters", "Differentials", "Gear Sets"],
    popular: ["Clutch Kits", "Flywheel", "CV Axles", "Transmission Fluid"],
    accentColor: "#a855f7",
    bgColor: "bg-purple-50 border-purple-100",
  },
  "accessories": {
    features: ["Floor Mats", "Seat Covers", "Cargo Organizers", "Dash Kits"],
    popular: ["All-Weather Mats", "Phone Mounts", "Seat Covers", "Cargo Nets"],
    accentColor: "#ec4899",
    bgColor: "bg-pink-50 border-pink-100",
  },
  "other-parts": {
    features: ["Exhaust Systems", "Fuel Systems", "HVAC", "Towing Equipment"],
    popular: ["Exhaust Tips", "Fuel Pumps", "AC Compressors", "Trailer Hitches"],
    accentColor: "#64748b",
    bgColor: "bg-slate-50 border-slate-200",
  },
};

type ViewMode = "grid" | "list";

export default function CategoriesClient() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-[#0d0d0d] font-semibold">Categories</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-1 bg-[#d4f000] rounded-full inline-block" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">Browse</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d0d0d] leading-tight">
              Shop by Category
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              {categories.length} categories &nbsp;·&nbsp;{" "}
              {totalProducts.toLocaleString()}+ parts in stock
            </p>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent transition w-48 sm:w-56"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#0d0d0d] text-white" : "text-gray-400 hover:text-[#0d0d0d]"}`}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-[#0d0d0d] text-white" : "text-gray-400 hover:text-[#0d0d0d]"}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { value: `${categories.length}`, label: "Categories" },
          { value: "200+", label: "Trusted Brands" },
          { value: `${totalProducts.toLocaleString()}+`, label: "Parts In Stock" },
          { value: "24hr", label: "Dispatch" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 text-center">
            <div className="text-xl font-extrabold text-[#0d0d0d]">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-bold text-[#0d0d0d]">No categories match &quot;{search}&quot;</p>
          <button
            onClick={() => setSearch("")}
            className="mt-4 text-sm text-gray-500 underline hover:text-[#0d0d0d]"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid view */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cat) => {
            const meta = CATEGORY_META[cat.slug];
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-[#d4f000] hover:shadow-lg transition-all duration-200 flex flex-col product-card"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-50">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Product count pill */}
                  <div className="absolute top-3 right-3 bg-[#d4f000] text-[#0d0d0d] text-xs font-extrabold px-2.5 py-1 rounded-full">
                    {cat.productCount.toLocaleString()} parts
                  </div>
                  {/* Icon */}
                  <div className="absolute bottom-3 left-4 text-3xl">{cat.icon}</div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-extrabold text-[#0d0d0d] group-hover:text-gray-700 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Popular items */}
                  {meta && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {meta.popular.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.bgColor} text-gray-600`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      {cat.productCount.toLocaleString()} products
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-extrabold text-[#0d0d0d] group-hover:gap-2.5 transition-all">
                      View Products
                      <ArrowRight size={15} className="group-hover:text-[#d4f000] transition-colors" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((cat) => {
            const meta = CATEGORY_META[cat.slug];
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex gap-5 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-[#d4f000] hover:shadow-md transition-all duration-200 p-4 product-card"
              >
                {/* Thumbnail */}
                <div className="relative w-28 sm:w-36 shrink-0 rounded-xl overflow-hidden bg-gray-50 aspect-square">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="144px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl bg-black/10">
                    {cat.icon}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h2 className="text-lg font-extrabold text-[#0d0d0d] group-hover:text-gray-700 transition-colors">
                      {cat.name}
                    </h2>
                    <span className="bg-[#d4f000] text-[#0d0d0d] text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0">
                      {cat.productCount.toLocaleString()} parts
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {cat.description}
                  </p>

                  {/* Feature tags */}
                  {meta && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {meta.features.map((f) => (
                        <span
                          key={f}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.bgColor} text-gray-600`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#0d0d0d] group-hover:gap-2.5 transition-all">
                    View Products
                    <ArrowRight size={15} className="group-hover:text-[#d4f000] transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 bg-[#0d0d0d] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #d4f000 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />
        <div className="relative text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-white">Can&apos;t find what you need?</h3>
          <p className="text-sm text-gray-400 mt-1">Use our Vehicle Finder to locate the exact part for your car.</p>
        </div>
        <div className="relative flex gap-3 shrink-0">
          <Link
            href="/shop"
            className="flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-3 rounded-xl hover:bg-[#c4e000] transition-colors text-sm"
          >
            Browse All Parts <ArrowRight size={15} />
          </Link>
          <Link
            href="/#vehicle-finder"
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm"
          >
            Vehicle Finder
          </Link>
        </div>
      </div>
    </div>
  );
}
