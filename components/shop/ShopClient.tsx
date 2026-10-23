"use client";

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ShopGrid from "@/components/shop/ShopGrid";
import { loadHomeCatalog, clearCatalogCache } from "@/lib/homeCatalog";
import type { Product } from "@/lib/types";
import { useVehicleSelection } from "@/lib/vehicle";
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
  vehicleEngine: "",
};

// ── URL → filter parameter mapping ────────────────────────────
// The navbar uses ?filter=new / ?filter=sale / ?filter=bestsellers.
// ShopClient also supports the granular params (?new=1, ?sale=1) from
// the filter sidebar's own URL serialisation — both work.
type FilterPreset = "new" | "sale" | "bestsellers" | null;

function presetFromParams(sp: URLSearchParams): FilterPreset {
  const f = sp.get("filter");
  if (f === "new") return "new";
  if (f === "sale") return "sale";
  if (f === "bestsellers") return "bestsellers";
  // Also accept the sidebar's own params so the round-trip is consistent.
  if (sp.get("new") === "1") return "new";
  if (sp.get("sale") === "1") return "sale";
  return null;
}

function defaultSortForPreset(preset: FilterPreset): SortOption {
  if (preset === "new") return "newest";
  if (preset === "bestsellers") return "best_selling";
  return "featured";
}

function filtersFromParams(sp: URLSearchParams): ShopFiltersState {
  return {
    search: sp.get("q") ?? "",
    categories: sp.getAll("cat"),
    brands: sp.getAll("brand"),
    priceMin: Number(sp.get("pmin") ?? 0),
    priceMax: Number(sp.get("pmax") ?? 500),
    stockStatus: sp.getAll("stock") as ShopFiltersState["stockStatus"],
    ratingMin: Number(sp.get("rating") ?? 0),
    isOnSale: false,
    isNew: false,
    vehicleMake: sp.get("make") ?? "",
    vehicleModel: sp.get("model") ?? "",
    vehicleYear: sp.get("year") ?? "",
    vehicleEngine: sp.get("engine") ?? "",
  };
}

// Build URLSearchParams from current filter + sort state.
// Called only inside useEffect — never during render.
function buildParams(f: ShopFiltersState, s: SortOption, preset: FilterPreset): string {
  const params = new URLSearchParams();
  // Persist the preset in the URL so refresh/back-forward work.
  if (preset) params.set("filter", preset);
  if (f.search) params.set("q", f.search);
  f.categories.forEach((c) => params.append("cat", c));
  f.brands.forEach((b) => params.append("brand", b));
  if (f.priceMin > 0) params.set("pmin", String(f.priceMin));
  if (f.priceMax < 500) params.set("pmax", String(f.priceMax));
  f.stockStatus.forEach((st) => params.append("stock", st));
  if (f.ratingMin > 0) params.set("rating", String(f.ratingMin));
  if (f.vehicleMake) params.set("make", f.vehicleMake);
  if (f.vehicleModel) params.set("model", f.vehicleModel);
  if (f.vehicleYear) params.set("year", f.vehicleYear);
  if (f.vehicleEngine) params.set("engine", f.vehicleEngine);
  if (s !== defaultSortForPreset(preset)) params.set("sort", s);
  return params.toString();
}

// ── Heading labels ─────────────────────────────────────────────
function pageHeading(preset: FilterPreset, search: string): string {
  if (search) return "Search Results";
  if (preset === "new") return "New Arrivals";
  if (preset === "sale") return "On Sale";
  if (preset === "bestsellers") return "Best Sellers";
  return "Honda Parts & Accessories";
}

function ShopInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useVehicleSelection();

  // ── Catalog data ──────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    let active = true;
    loadHomeCatalog()
      .then((c) => { if (active) setProducts(c.products); })
      .catch((e) => { if (active) setCatalogError(e instanceof Error ? e.message : "Unable to load products."); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  // ── Initialise state from URL (once, on first render) ─────
  const initialPreset = presetFromParams(searchParams);

  const [preset, setPreset] = useState<FilterPreset>(initialPreset);

  const [filters, setFilters] = useState<ShopFiltersState>(() => filtersFromParams(searchParams));

  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) ?? defaultSortForPreset(initialPreset)
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── React to searchParams changes (client-side navigation) ─
  // useState initialisers run only once. When the user navigates from
  // ?filter=new to ?filter=sale the searchParams reference changes but
  // the state values stay frozen. This effect keeps preset and sort in
  // sync with the current URL on every navigation without losing the
  // user's sidebar filter selections.
  const prevSearchRef = useRef(searchParams.toString());
  const applyingUrlRef = useRef(false);
  useEffect(() => {
    const current = searchParams.toString();
    if (current === prevSearchRef.current) return;
    prevSearchRef.current = current;
    applyingUrlRef.current = true;

    const nextPreset = presetFromParams(searchParams);
    setPreset(nextPreset);
    setFilters(filtersFromParams(searchParams));
    setSort((searchParams.get("sort") as SortOption | null) ?? defaultSortForPreset(nextPreset));
  }, [searchParams]);

  // ── Sync state → URL (skip initial mount) ────────────────
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    if (applyingUrlRef.current) { applyingUrlRef.current = false; return; }
    const qs = buildParams(filters, sort, preset);
    if (qs !== searchParams.toString()) router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, preset]);

  // ── State updaters ────────────────────────────────────────
  const updateFilters = useCallback((patch: Partial<ShopFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSort = useCallback((s: SortOption) => setSort(s), []);

  const resetFilters = useCallback(() => {
    setPreset(null);
    setFilters(DEFAULT_FILTERS);
    setSort("featured");
  }, []);

  const clearPreset = useCallback(() => {
    setPreset(null);
    setSort("featured");
  }, []);

  // ── Filter + sort ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...products];

    // Preset-based filters — these come from ?filter= navigation,
    // not the sidebar. The sidebar's isNew/isOnSale are independent.
    if (preset === "new") {
      result = result.filter((p) => p.isNew);
    } else if (preset === "sale") {
      result = result.filter((p) => p.isOnSale);
    }
    // "bestsellers" has no product-level flag — it's a sort-only preset.

    // Sidebar filters
    if (filters.isNew && preset !== "new")   result = result.filter((p) => p.isNew);
    if (filters.isOnSale && preset !== "sale") result = result.filter((p) => p.isOnSale);

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

    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.some((value) => value === p.brandSlug || value === p.brand));
    }

    result = result.filter(
      (p) => p.price >= filters.priceMin && p.price <= filters.priceMax
    );

    if (filters.stockStatus.length > 0) {
      result = result.filter((p) => filters.stockStatus.includes(p.stockStatus));
    }

    if (filters.ratingMin > 0) {
      result = result.filter((p) => p.rating >= filters.ratingMin);
    }

    if (filters.vehicleModel) {
      result = result.filter((p) =>
        p.compatibility.some(
          (c) =>
            c.make.toLowerCase() === "honda" &&
            c.model.toLowerCase() === filters.vehicleModel.toLowerCase() &&
            (!filters.vehicleYear ||
              (Number(filters.vehicleYear) >= c.yearFrom &&
                Number(filters.vehicleYear) <= c.yearTo)) &&
            (!filters.vehicleEngine ||
              c.engine?.toLowerCase() === filters.vehicleEngine.toLowerCase())
        )
      );
    }

    // Sort
    switch (sort) {
      case "price_asc":   result.sort((a, b) => a.price - b.price); break;
      case "price_desc":  result.sort((a, b) => b.price - a.price); break;
      case "best_selling": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "top_rated":   result.sort((a, b) => b.rating - a.rating); break;
      case "newest":
        result.sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          // Invalid dates sort to the end
          if (Number.isNaN(ta) && Number.isNaN(tb)) return a.name.localeCompare(b.name);
          if (Number.isNaN(ta)) return 1;
          if (Number.isNaN(tb)) return -1;
          return tb - ta || a.name.localeCompare(b.name); // stable secondary
        });
        break;
      case "featured":
      default:
        result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [filters, sort, preset, products]);

  // ── Active filter count ───────────────────────────────────
  const activeFilterCount =
    (preset ? 1 : 0) +
    filters.categories.length +
    filters.brands.length +
    (filters.stockStatus.length > 0 ? 1 : 0) +
    (filters.ratingMin > 0 ? 1 : 0) +
    (filters.isOnSale ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 500 ? 1 : 0) +
    (filters.vehicleModel ? 1 : 0);

  const heading = pageHeading(preset, filters.search);

  // ── Retry handler ─────────────────────────────────────────
  const handleRetry = () => {
    setCatalogError("");
    setCatalogLoading(true);
    clearCatalogCache();
    loadHomeCatalog()
      .then((c) => { setProducts(c.products); setCatalogLoading(false); })
      .catch((e: unknown) => {
        setCatalogError(e instanceof Error ? e.message : "Unable to load products.");
        setCatalogLoading(false);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0d0d0d] transition-colors">Shop</Link>
          {preset && <><span>/</span><span className="text-[#0d0d0d] font-semibold">{heading}</span></>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">{heading}</h1>
        {!catalogLoading && !catalogError && (
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} {filtered.length === 1 ? "product" : "products"} found
            {filters.search && (
              <> for <span className="font-semibold text-[#0d0d0d]">&quot;{filters.search}&quot;</span></>
            )}
          </p>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {preset && (
            <span className="inline-flex items-center gap-1.5 bg-[#0d0d0d] text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {heading}
              <button
                type="button"
                onClick={clearPreset}
                aria-label={`Remove ${heading} filter`}
                className="ml-0.5 hover:opacity-70"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {filters.vehicleModel && (
            <span className="inline-flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] text-xs font-bold px-3 py-1.5 rounded-full">
              {filters.vehicleYear} Honda {filters.vehicleModel}
              <button
                type="button"
                onClick={() => updateFilters({ vehicleMake: "", vehicleModel: "", vehicleYear: "", vehicleEngine: "" })}
                aria-label="Remove vehicle filter"
                className="ml-0.5 hover:opacity-70"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {filters.categories.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {cat}
              <button type="button" onClick={() => updateFilters({ categories: filters.categories.filter((c) => c !== cat) })} aria-label={`Remove ${cat} filter`} className="hover:opacity-70"><X size={11} /></button>
            </span>
          ))}
          {filters.brands.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {products.find((product) => product.brandSlug === b || product.brand === b)?.brand ?? b}
              <button type="button" onClick={() => updateFilters({ brands: filters.brands.filter((x) => x !== b) })} aria-label={`Remove ${b} filter`} className="hover:opacity-70"><X size={11} /></button>
            </span>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-gray-500 hover:text-[#0d0d0d] underline underline-offset-2 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Loading / error banners ── */}
      {catalogLoading && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading catalog…
        </div>
      )}
      {catalogError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm">
          <div className="flex-1">
            <p className="font-bold text-red-800">We couldn&apos;t load the products. Please try again.</p>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-1 font-mono text-xs text-red-600">{catalogError}</p>
            )}
          </div>
          <button type="button" onClick={handleRetry} className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">
            Retry
          </button>
        </div>
      )}

      {/* ── Vehicle confirmation banner ── */}
      {filters.vehicleModel && !catalogError && (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${filtered.length ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          <strong>{filtered.length ? "Confirmed matches" : "No confirmed matches"}:</strong>{" "}
          {filters.vehicleYear} Honda {filters.vehicleModel}{filters.vehicleEngine ? ` · ${filters.vehicleEngine}` : ""}.{" "}
          {filtered.length ? "Every result has a matching verified fitment record." : "Unverified products are excluded from vehicle-match results."}
        </div>
      )}

      <div className="flex gap-6">
        <ShopFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          activeFilterCount={activeFilterCount}
          sidebarOpen={sidebarOpen}
          onSidebarClose={() => setSidebarOpen(false)}
          totalResults={filtered.length}
          products={products}
        />

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
          <ShopGrid
            products={filtered}
            viewMode={viewMode}
            loading={catalogLoading}
            isFiltered={!catalogLoading && !catalogError && products.length > 0 && filtered.length === 0}
            preset={preset}
            onReset={resetFilters}
          />
        </div>
      </div>
    </div>
  );
}

export default function ShopClient() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-gray-400">Loading shop...</div>}>
      <ShopInner />
    </Suspense>
  );
}
