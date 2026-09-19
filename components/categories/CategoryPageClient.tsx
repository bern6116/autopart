"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowRight, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import ProductCard from "@/components/sections/ProductCard";

interface CategoryPageClientProps {
  category: Category;
  categoryProducts: Product[];
  allCategories: Category[];
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "top_rated", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

type SortVal = typeof SORT_OPTIONS[number]["value"];

const CATEGORY_ICONS: Record<string, string> = {
  "engine-parts": "⚙️",
  "brake-system": "🛑",
  "suspension": "🔩",
  "electrical": "⚡",
  "wheels-tires": "🔘",
  "filters": "🔧",
  "lighting": "💡",
  "body-parts": "🚗",
  "cooling-system": "🌡️",
  "transmission": "🔄",
  "accessories": "🎛️",
  "other-parts": "🔨",
};

export default function CategoryPageClient({
  category,
  categoryProducts,
  allCategories,
}: CategoryPageClientProps) {
  const [sort, setSort] = useState<SortVal>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stockOnly, setStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);

  // Sort + filter
  const displayed = [...categoryProducts]
    .filter((p) => {
      if (stockOnly && p.stockStatus === "out_of_stock") return false;
      if (saleOnly && !p.isOnSale) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "top_rated": return b.rating - a.rating;
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return Number(b.isFeatured) - Number(a.isFeatured);
      }
    });

  const activeFilters = (stockOnly ? 1 : 0) + (saleOnly ? 1 : 0);

  // Related categories (exclude current)
  const related = allCategories.filter((c) => c.slug !== category.slug).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
        <ChevronRight size={12} className="text-gray-300" />
        <Link href="/categories" className="hover:text-[#0d0d0d] transition-colors">Categories</Link>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-[#0d0d0d] font-semibold">{category.name}</span>
      </nav>

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-[#0d0d0d]">
        <div className="absolute inset-0">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
        </div>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #d4f000 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />
        <div className="relative px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-5xl mb-3">{CATEGORY_ICONS[category.slug] ?? "🔧"}</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {category.name}
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-lg leading-relaxed">
              {category.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="bg-[#d4f000] text-[#0d0d0d] text-xs font-extrabold px-3 py-1.5 rounded-full">
                {category.productCount.toLocaleString()} parts
              </span>
              <span className="text-gray-400 text-xs">
                {categoryProducts.length > 0
                  ? `${categoryProducts.length} products shown below`
                  : "Browse our full catalogue"}
              </span>
            </div>
          </div>
          {/* Quick nav to other categories */}
          <Link
            href="/categories"
            className="shrink-0 flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm"
          >
            All Categories <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 xl:w-64 shrink-0 self-start sticky top-24 space-y-4">

          {/* Quick filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Filters</span>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setStockOnly(false); setSaleOnly(false); }}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={11} /> Reset
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              {[
                { label: "In Stock Only", value: stockOnly, set: setStockOnly },
                { label: "On Sale", value: saleOnly, set: setSaleOnly },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => set(!value)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      value ? "bg-[#0d0d0d] border-[#0d0d0d]" : "border-gray-300 group-hover:border-[#0d0d0d]"
                    }`}
                  >
                    {value && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${value ? "font-bold text-[#0d0d0d]" : "text-gray-600"}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other categories */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
              Other Categories
            </div>
            <ul className="space-y-1">
              {related.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#f4f4f4] transition-colors text-sm text-gray-600 hover:text-[#0d0d0d] font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[cat.slug] ?? "🔧"}</span>
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-gray-400">{cat.productCount.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 mr-auto">
              <span className="font-extrabold text-[#0d0d0d]">{displayed.length}</span> products
            </span>

            {/* Active filter chips */}
            {stockOnly && (
              <span className="flex items-center gap-1 bg-[#d4f000] text-[#0d0d0d] text-xs font-bold px-2.5 py-1 rounded-full">
                In Stock
                <button onClick={() => setStockOnly(false)}><X size={11} /></button>
              </span>
            )}
            {saleOnly && (
              <span className="flex items-center gap-1 bg-[#d4f000] text-[#0d0d0d] text-xs font-bold px-2.5 py-1 rounded-full">
                On Sale
                <button onClick={() => setSaleOnly(false)}><X size={11} /></button>
              </span>
            )}

            {/* Mobile filter button */}
            <button className="lg:hidden flex items-center gap-1.5 bg-[#0d0d0d] text-white text-xs font-bold px-3 py-2 rounded-xl">
              <SlidersHorizontal size={13} /> Filters {activeFilters > 0 && `(${activeFilters})`}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortVal)}
                className="appearance-none bg-[#f4f4f4] border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#d4f000] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-[#f4f4f4] rounded-xl p-1">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === v ? "bg-white shadow-sm text-[#0d0d0d]" : "text-gray-400 hover:text-[#0d0d0d]"}`}
                  aria-label={`${v} view`}
                >
                  {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid / list */}
          {displayed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="font-extrabold text-[#0d0d0d] text-lg">No products found</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Try removing a filter or{" "}
                <Link href="/shop" className="underline font-semibold">browse all parts</Link>.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-2.5 rounded-xl text-sm hover:bg-[#c4e000] transition-colors"
              >
                Shop All Parts <ArrowRight size={15} />
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
              {displayed.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((p) => <ProductCard key={p.id} product={p} variant="horizontal" />)}
            </div>
          )}

          {/* Browse all CTA if products list is from static data */}
          {categoryProducts.length === 0 && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-3">{CATEGORY_ICONS[category.slug] ?? "🔧"}</div>
              <h3 className="font-extrabold text-[#0d0d0d] text-lg mb-1">
                {category.productCount.toLocaleString()} {category.name} parts available
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Connect Supabase to load live inventory, or browse all parts now.
              </p>
              <Link
                href={`/shop?cat=${encodeURIComponent(category.name)}`}
                className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-3 rounded-xl hover:bg-[#c4e000] transition-colors"
              >
                Browse {category.name} <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
