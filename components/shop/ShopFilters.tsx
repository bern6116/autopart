"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Car, SlidersHorizontal, RotateCcw } from "lucide-react";
import { products, categories, brands } from "@/lib/data";
import { VEHICLE_MAKES, VEHICLE_MODELS, VEHICLE_YEARS } from "@/lib/types";
import type { ShopFiltersState } from "@/components/shop/shopTypes";

interface ShopFiltersProps {
  filters: ShopFiltersState;
  onFiltersChange: (patch: Partial<ShopFiltersState>) => void;
  onReset: () => void;
  activeFilterCount: number;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  totalResults: number;
}

// Only show categories that exist in the products data
const PRODUCT_CATEGORIES = Array.from(new Set(products.map((p) => p.category))).sort();
const PRODUCT_BRANDS = Array.from(new Set(products.map((p) => p.brand))).sort();
const BRAND_COUNTS = Object.fromEntries(
  PRODUCT_BRANDS.map((b) => [b, products.filter((p) => p.brand === b).length])
);
const CATEGORY_COUNTS = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c, products.filter((p) => p.category === c).length])
);

const RATING_OPTIONS = [
  { value: 4.5, label: "4.5 & up" },
  { value: 4.0, label: "4.0 & up" },
  { value: 3.5, label: "3.5 & up" },
];

const STOCK_OPTIONS: { value: ShopFiltersState["stockStatus"][number]; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "bg-green-500" },
  { value: "low_stock", label: "Low Stock", color: "bg-orange-500" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-500" },
];

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function CheckboxItem({
  checked,
  onChange,
  label,
  count,
  dot,
  dotColor,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
  dot?: boolean;
  dotColor?: string;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
          checked
            ? "bg-[#0d0d0d] border-[#0d0d0d]"
            : "border-gray-300 group-hover:border-[#0d0d0d]"
        }`}
        onClick={onChange}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />}
      <span className={`text-sm flex-1 transition-colors ${checked ? "font-semibold text-[#0d0d0d]" : "text-gray-600 group-hover:text-[#0d0d0d]"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400 font-medium">{count}</span>
      )}
    </label>
  );
}

export default function ShopFilters({
  filters,
  onFiltersChange,
  onReset,
  activeFilterCount,
  sidebarOpen,
  onSidebarClose,
  totalResults,
}: ShopFiltersProps) {
  const vehicleModels = filters.vehicleMake
    ? (VEHICLE_MODELS[filters.vehicleMake] ?? [])
    : [];

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFiltersChange({ categories: next });
  };

  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ brands: next });
  };

  const toggleStock = (val: ShopFiltersState["stockStatus"][number]) => {
    const next = filters.stockStatus.includes(val)
      ? filters.stockStatus.filter((s) => s !== val)
      : [...filters.stockStatus, val];
    onFiltersChange({ stockStatus: next });
  };

  const selectClass =
    "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent appearance-none cursor-pointer";

  const filtersPanel = (
    <aside className="w-64 shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden self-start sticky top-24">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#d4f000]" />
          <span className="font-bold text-white text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#d4f000] text-[#0d0d0d] text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-gray-400 hover:text-[#d4f000] transition-colors flex items-center gap-1"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          )}
          {/* Mobile close */}
          <button
            onClick={onSidebarClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 divide-y divide-gray-50 max-h-[calc(100vh-10rem)] overflow-y-auto">

        {/* Vehicle Compatibility */}
        <Section title="Vehicle Compatibility">
          <div className="space-y-2">
            <div className="relative">
              <select
                value={filters.vehicleMake}
                onChange={(e) =>
                  onFiltersChange({
                    vehicleMake: e.target.value,
                    vehicleModel: "",
                    vehicleYear: "",
                  })
                }
                className={selectClass}
              >
                <option value="">All Makes</option>
                {VEHICLE_MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <Car size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filters.vehicleModel}
                onChange={(e) => onFiltersChange({ vehicleModel: e.target.value, vehicleYear: "" })}
                disabled={!filters.vehicleMake}
                className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">All Models</option>
                {vehicleModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={filters.vehicleYear}
                onChange={(e) => onFiltersChange({ vehicleYear: e.target.value })}
                className={selectClass}
              >
                <option value="">All Years</option>
                {VEHICLE_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {filters.vehicleMake && (
              <button
                onClick={() => onFiltersChange({ vehicleMake: "", vehicleModel: "", vehicleYear: "" })}
                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <X size={11} /> Clear vehicle
              </button>
            )}
          </div>
        </Section>

        {/* Category */}
        <Section title="Category">
          <div className="space-y-0.5">
            {PRODUCT_CATEGORIES.map((cat) => (
              <CheckboxItem
                key={cat}
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                label={cat}
                count={CATEGORY_COUNTS[cat]}
              />
            ))}
          </div>
        </Section>

        {/* Brand */}
        <Section title="Brand">
          <div className="space-y-0.5">
            {PRODUCT_BRANDS.map((brand) => (
              <CheckboxItem
                key={brand}
                checked={filters.brands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                label={brand}
                count={BRAND_COUNTS[brand]}
              />
            ))}
          </div>
        </Section>

        {/* Price Range */}
        <Section title="Price Range">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-[10px] text-gray-400 font-medium mb-1">Min ($)</div>
                <input
                  type="number"
                  min={0}
                  max={filters.priceMax}
                  value={filters.priceMin}
                  onChange={(e) => onFiltersChange({ priceMin: Math.max(0, Number(e.target.value)) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]"
                />
              </div>
              <span className="text-gray-400 mt-5">—</span>
              <div className="flex-1">
                <div className="text-[10px] text-gray-400 font-medium mb-1">Max ($)</div>
                <input
                  type="number"
                  min={filters.priceMin}
                  max={1000}
                  value={filters.priceMax}
                  onChange={(e) => onFiltersChange({ priceMax: Math.min(1000, Number(e.target.value)) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]"
                />
              </div>
            </div>
            {/* Quick price presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Under $25", min: 0, max: 25 },
                { label: "$25–$75", min: 25, max: 75 },
                { label: "$75–$150", min: 75, max: 150 },
                { label: "$150+", min: 150, max: 500 },
              ].map(({ label, min, max }) => (
                <button
                  key={label}
                  onClick={() => onFiltersChange({ priceMin: min, priceMax: max })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    filters.priceMin === min && filters.priceMax === max
                      ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                      : "border-gray-200 text-gray-600 hover:border-[#0d0d0d]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Stock Availability */}
        <Section title="Availability">
          <div className="space-y-0.5">
            {STOCK_OPTIONS.map(({ value, label, color }) => (
              <CheckboxItem
                key={value}
                checked={filters.stockStatus.includes(value)}
                onChange={() => toggleStock(value)}
                label={label}
                dot
                dotColor={color}
              />
            ))}
          </div>
        </Section>

        {/* Rating */}
        <Section title="Customer Rating">
          <div className="space-y-0.5">
            {RATING_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    filters.ratingMin === value
                      ? "bg-[#0d0d0d] border-[#0d0d0d]"
                      : "border-gray-300 group-hover:border-[#0d0d0d]"
                  }`}
                  onClick={() =>
                    onFiltersChange({ ratingMin: filters.ratingMin === value ? 0 : value })
                  }
                >
                  {filters.ratingMin === value && (
                    <div className="w-2 h-2 rounded-full bg-[#d4f000]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(value) ? "#facc15" : "#e5e7eb"}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className={`text-sm transition-colors ${filters.ratingMin === value ? "font-semibold text-[#0d0d0d]" : "text-gray-600 group-hover:text-[#0d0d0d]"}`}>
                    {label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* Quick flags */}
        <Section title="Special Offers" defaultOpen={false}>
          <div className="space-y-0.5">
            <CheckboxItem
              checked={filters.isOnSale}
              onChange={() => onFiltersChange({ isOnSale: !filters.isOnSale })}
              label="On Sale"
            />
            <CheckboxItem
              checked={filters.isNew}
              onChange={() => onFiltersChange({ isNew: !filters.isNew })}
              label="New Arrivals"
            />
          </div>
        </Section>
      </div>

      {/* Apply button (mobile) */}
      <div className="lg:hidden p-4 border-t border-gray-100">
        <button
          onClick={onSidebarClose}
          className="w-full bg-[#d4f000] text-[#0d0d0d] font-bold py-3 rounded-xl text-sm"
        >
          Show {totalResults} Results
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{filtersPanel}</div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-full h-full overflow-y-auto bg-white shadow-2xl">
            {filtersPanel}
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={onSidebarClose}
          />
        </div>
      )}
    </>
  );
}
