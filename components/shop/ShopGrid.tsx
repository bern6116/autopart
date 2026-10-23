import type { Product } from "@/lib/types";
import ProductCard from "@/components/sections/ProductCard";
import { PackageSearch, RefreshCw } from "lucide-react";

type FilterPreset = "new" | "sale" | "bestsellers" | null;

interface ShopGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  loading?: boolean;
  /** true = query succeeded but filters excluded everything */
  isFiltered?: boolean;
  /** Active preset — drives the correct empty-state message */
  preset?: FilterPreset;
  onReset?: () => void;
}

// ── Loading skeletons ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/4 mt-3" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-9 bg-gray-100 rounded-lg" />
          <div className="h-9 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────
const PRESET_MESSAGES: Record<
  NonNullable<FilterPreset>,
  { heading: string; body: string; action: string }
> = {
  new: {
    heading: "No new arrivals right now.",
    body: "No products have been added within the last 30 days.",
    action: "Browse all parts",
  },
  sale: {
    heading: "No sale items right now.",
    body: "No products currently carry a discount. Check back soon.",
    action: "Browse all parts",
  },
  bestsellers: {
    heading: "No bestsellers available yet.",
    body: "There is no qualifying sales history to rank at the moment.",
    action: "Browse all parts",
  },
};

function FilteredEmptyState({
  onReset,
  preset,
}: {
  onReset?: () => void;
  preset?: FilterPreset;
}) {
  const msg = preset ? PRESET_MESSAGES[preset] : null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white py-12 flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 bg-[#f4f4f4] rounded-xl flex items-center justify-center mb-4">
        <PackageSearch size={24} className="text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-[#0d0d0d] mb-1">
        {msg?.heading ?? "No matching parts"}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">
        {msg?.body ?? "Your current filters didn't match any parts. Try widening your search or clearing some filters."}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-[#c4e000] transition-colors"
        >
          <RefreshCw size={14} />
          {msg?.action ?? "Clear all filters"}
        </button>
      )}
    </div>
  );
}

function CatalogEmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white py-10 flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 bg-[#f4f4f4] rounded-xl flex items-center justify-center mb-4">
        <PackageSearch size={24} className="text-gray-400" />
      </div>
      <h3 className="text-base font-bold text-[#0d0d0d] mb-1">No products published yet</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        The catalog doesn&apos;t have any active products at the moment. Check back soon.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ShopGrid({
  products,
  viewMode,
  loading = false,
  isFiltered = false,
  preset,
  onReset,
}: ShopGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return isFiltered ? (
      <FilteredEmptyState onReset={onReset} preset={preset} />
    ) : (
      <CatalogEmptyState />
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} variant="horizontal" priority={i === 0} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} variant="default" priority={i === 0} />
      ))}
    </div>
  );
}
