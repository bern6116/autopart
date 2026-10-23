"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import { loadHomeCatalog, type HomeCatalog } from "@/lib/homeCatalog";

export default function FeaturedBrands() {
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    loadHomeCatalog()
      .then((result) => active && setCatalog(result))
      .catch((catalogError: unknown) => {
        if (active) {
          setError(catalogError instanceof Error ? catalogError.message : "Unable to load brands.");
        }
      });
    return () => { active = false; };
  }, []);

  const visibleBrands = useMemo(() => {
    if (!catalog) return [];
    const counts = new Map<string, Set<string>>();
    for (const product of catalog.products) {
      if (!product.brandId) continue;
      const ids = counts.get(product.brandId) ?? new Set<string>();
      ids.add(product.id);
      counts.set(product.brandId, ids);
    }
    return catalog.brands
      .map((brand) => ({ ...brand, count: counts.get(brand.id)?.size ?? 0 }))
      .filter((brand) => brand.count > 0)
      .slice(0, 8);
  }, [catalog]);

  if (catalog && visibleBrands.length === 0) return null;

  return (
    <section className="border-t border-gray-100 bg-white py-14" aria-labelledby="shop-by-brand-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gray-500">Parts manufacturers</p>
            <h2 id="shop-by-brand-title" className="text-3xl font-black tracking-tight text-[#0d0d0d]">Shop by Parts Brand</h2>
          </div>
          <Link href="/brands" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
            All parts brands <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        {!catalog && !error && (
          <div className="flex min-h-36 items-center justify-center gap-2 text-sm font-semibold text-gray-500" role="status">
            <LoaderCircle className="animate-spin" aria-hidden="true" size={20} /> Loading brands…
          </div>
        )}

        {error && (
          <div className="flex min-h-36 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700" role="alert">
            <AlertCircle aria-hidden="true" size={20} /> {error}
          </div>
        )}

        {catalog && visibleBrands.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                aria-label={`Shop ${brand.name} products`}
                className="group flex min-h-28 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-5 text-center transition-colors hover:border-[#d4f000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]"
              >
                <span className="text-base font-black text-[#0d0d0d]">{brand.name}</span>
                <span className="mt-2 text-xs font-semibold text-gray-500">
                  {brand.count} {brand.count === 1 ? "product" : "products"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
