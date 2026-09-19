import type { Product } from "@/lib/types";
import ProductCard from "@/components/sections/ProductCard";
import { PackageSearch } from "lucide-react";
import Link from "next/link";

interface ShopGridProps {
  products: Product[];
  viewMode: "grid" | "list";
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-[#f4f4f4] rounded-2xl flex items-center justify-center mb-4">
        <PackageSearch size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-extrabold text-[#0d0d0d] mb-1">No products found</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Try adjusting your filters, clearing your search, or browsing all categories.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#c4e000] transition-colors"
      >
        Clear all filters
      </Link>
    </div>
  );
}

export default function ShopGrid({ products, viewMode }: ShopGridProps) {
  if (products.length === 0) return <EmptyState />;

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="horizontal" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="default" />
      ))}
    </div>
  );
}
