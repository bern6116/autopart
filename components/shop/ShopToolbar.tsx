"use client";

import { Search, SlidersHorizontal, LayoutGrid, List, X } from "lucide-react";
import { SORT_OPTIONS, type SortOption } from "@/components/shop/shopTypes";

interface ShopToolbarProps {
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  resultCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  search: string;
  onSearchChange: (v: string) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
}

export default function ShopToolbar({
  sort,
  onSortChange,
  resultCount,
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  activeFilterCount,
  onOpenFilters,
}: ShopToolbarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="flex-1 min-w-[160px] relative">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, SKU, brand..."
          className="w-full bg-[#f4f4f4] rounded-xl pl-9 pr-8 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:bg-white transition"
        />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Result count — hidden on small */}
      <div className="hidden sm:block text-sm text-gray-500 whitespace-nowrap shrink-0">
        <span className="font-bold text-[#0d0d0d]">{resultCount}</span> products
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-gray-500 hidden md:block whitespace-nowrap">Sort:</span>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-[#f4f4f4] border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#d4f000] cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
              <path d="M1 1l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center bg-[#f4f4f4] rounded-xl p-1 shrink-0 hidden sm:flex">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === "grid" ? "bg-white shadow-sm text-[#0d0d0d]" : "text-gray-400 hover:text-[#0d0d0d]"
          }`}
          aria-label="Grid view"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === "list" ? "bg-white shadow-sm text-[#0d0d0d]" : "text-gray-400 hover:text-[#0d0d0d]"
          }`}
          aria-label="List view"
        >
          <List size={16} />
        </button>
      </div>

      {/* Mobile filter button */}
      <button
        onClick={onOpenFilters}
        className="lg:hidden flex items-center gap-2 bg-[#0d0d0d] text-white px-4 py-2 rounded-xl text-sm font-bold shrink-0"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-[#d4f000] text-[#0d0d0d] text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
