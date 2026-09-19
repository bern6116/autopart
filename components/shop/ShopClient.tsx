"use client";

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ShopGrid from "@/components/shop/ShopGrid";
import { products } from "@/lib/data";
import type { ShopFiltersState, SortOption } from "@/components/shop/shopTypes";

const DEFAULT_FILTERS: ShopFiltersState = {
  search: "",
  categories: [],
  brands: [],
  priceMin: 0,
  priceMax: 500,
  stockStatus: [],
  ratingMin: 0,
  isOnSale: false,
  isNew: false,
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
};

// Build URLSearchParams from current filter + sort state.
// Called only inside useEffect — never during render.
function buildParams(f: ShopFiltersState, s: SortOption): string {
  const params = new URLSearchParams();
  if (f.search) params.set("q", f.search);
  f.categories.forEach((c) => params.append("cat", c));
  f.brands.forEach((b) => params.append("brand", b));
  if (f.priceMin > 0) params.set("pmin", String(f.priceMin));
  if (f.priceMax < 500) params.set("pmax", String(f.priceMax));
  f.stockStatus.forEach((st) => params.append("stock", st));
  if (f.ratingMin > 0) params.set("rating", String(f.ratingMin));
  if (f.isOnSale) params.set("sale", "1");
  if (f.isNew) params.set("new", "1");
  if (f.vehicleMake) params.set("make", f.vehicleMake);
  if (f.vehicleModel) params.set("model", f.vehicleModel);
  if (f.vehicleYear) params.set("year", f.vehicleYear);
  if (s !== "featured") params.set("sort", s);
  return params.toString();
}

function ShopInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Hydrate state from URL on first render only ───────────
  const [filters, setFilters] = useState<ShopFiltersState>(() => ({
    search: searchParams.get("q") ?? "",
    categories: searchParams.getAll("cat"),
    brands: searchParams.getAll("brand"),
    priceMin: Number(searchParams.get("pmin") ?? 0),
    priceMax: Number(searchParams.get("pmax") ?? 500),
    stockStatus: searchParams.getAll("stock") as ShopFiltersState["stockStatus"],
    ratingMin: Number(searchParams.get("rating") ?? 0),
    isOnSale: searchParams.get("sale") === "1",
    isNew: searchParams.get("new") === "1",
    vehicleMake: searchParams.get("make") ?? "",
    vehicleModel: searchParams.get("model") ?? "",
    vehicleYear: searchParams.get("year") ?? "",
  }));

  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) ?? "featured"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Sync state → URL in useEffect (never during render) ───
  // Skip the very first effect run so we don't push on initial mount.
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const qs = buildParams(filters, sort);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  // ── State updaters — pure, no side-effects ────────────────
  const updateFilters = useCallback((patch: Partial<ShopFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSort = useCallback((s: SortOption) => {
    setSort(s);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort("featured");
  }, []);

  // ── Filter + sort products ────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Categories
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // Brands
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // Price
    result = result.filter(
      (p) => p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    // Stock
    if (filters.stockStatus.length > 0) {
      result = result.filter((p) => filters.stockStatus.includes(p.stockStatus));
    }

    // Rating
    if (filters.ratingMin > 0) {
      result = result.filter((p) => p.rating >= filters.ratingMin);
    }

    // On Sale
    if (filters.isOnSale) result = result.filter((p) => p.isOnSale);

    // New
    if (filters.isNew) result = result.filter((p) => p.isNew);

    // Vehicle compatibility
    if (filters.vehicleMake) {
      result = result.filter((p) =>
        p.compatibility.some(
          (c) =>
            c.make.toLowerCase() === filters.vehicleMake.toLowerCase() &&
            (!filters.vehicleModel ||
              c.model.toLowerCase() === filters.vehicleModel.toLowerCase()) &&
            (!filters.vehicleYear ||
              (Number(filters.vehicleYear) >= c.yearFrom &&
                Number(filters.vehicleYear) <= c.yearTo))
        )
      );
    }

    // Sort
    switch (sort) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "best_selling":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "top_rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
        break;
    }

    return result;
  }, [filters, sort]);

  // ── Active filter count for badge ─────────────────────────
  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.stockStatus.length > 0 ? 1 : 0) +
    (filters.ratingMin > 0 ? 1 : 0) +
    (filters.isOnSale ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 500 ? 1 : 0) +
    (filters.vehicleMake ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <a href="/" className="hover:text-[#0d0d0d] transition-colors">Home</a>
          <span>/</span>
          <span className="text-[#0d0d0d] font-semibold">Shop</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">
          Auto Parts &amp; Accessories
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {filtered.length}{" "}
          {filtered.length === 1 ? "product" : "products"} found
          {filters.search && (
            <span>
              {" "}for{" "}
              <span className="font-semibold text-[#0d0d0d]">
                &quot;{filters.search}&quot;
              </span>
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <ShopFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          activeFilterCount={activeFilterCount}
          sidebarOpen={sidebarOpen}
          onSidebarClose={() => setSidebarOpen(false)}
          totalResults={filtered.length}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <ShopToolbar
            sort={sort}
            onSortChange={updateSort}
            resultCount={filtered.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            search={filters.search}
            onSearchChange={(v) => updateFilters({ search: v })}
            activeFilterCount={activeFilterCount}
            onOpenFilters={() => setSidebarOpen(true)}
          />
          <ShopGrid products={filtered} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
}

export default function ShopClient() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-gray-400">
          Loading shop...
        </div>
      }
    >
      <ShopInner />
    </Suspense>
  );
}
