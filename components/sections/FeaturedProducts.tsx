"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, LoaderCircle, Package } from "lucide-react";
import ProductCard from "@/components/sections/ProductCard";
import { loadHomeCatalog, type HomeCatalog } from "@/lib/homeCatalog";

export default function FeaturedProducts() {
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let active = true;
    loadHomeCatalog()
      .then((result) => { if (active) setCatalog(result); })
      .catch((catalogError: unknown) => {
        if (active)
          setError(
            catalogError instanceof Error
              ? catalogError.message
              : "Unable to load products. Please try refreshing the page."
          );
      });
    return () => { active = false; };
  }, []);

  // Category tabs — only categories that have at least one active product
  const visibleCategories = useMemo(() => {
    if (!catalog) return [];
    const populated = new Set(catalog.products.map((p) => p.category));
    return catalog.categories.filter((c) => populated.has(c.name)).slice(0, 5);
  }, [catalog]);

  // Whether any product in the catalog is marked featured
  const hasFeatured = useMemo(
    () => catalog?.products.some((p) => p.isFeatured) ?? false,
    [catalog]
  );

  // Products to display for the active tab
  const displayed = useMemo(() => {
    if (!catalog) return [];
    const cat = catalog.categories.find((c) => c.slug === activeCategory);
    const matching =
      activeCategory === "all"
        ? catalog.products.filter((p) => p.isFeatured)
        : catalog.products.filter((p) => p.category === cat?.name);
    // "All" tab: if no products are marked featured, show all active products
    const fallback =
      activeCategory === "all" && matching.length === 0
        ? catalog.products
        : matching;
    return fallback.slice(0, 6);
  }, [activeCategory, catalog]);

  // Section heading changes when no featured products exist
  const sectionTitle = hasFeatured ? "Featured Parts" : "Available Parts";
  const sectionEyebrow = hasFeatured ? "Catalog" : "All active products";

  return (
    <section className="bg-[#f9f9f9] py-14" aria-labelledby="featured-parts-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gray-500">
              {sectionEyebrow}
            </p>
            <h2 id="featured-parts-title" className="text-3xl font-black tracking-tight text-[#0d0d0d]">
              {sectionTitle}
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]"
          >
            View all products <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        {/* Loading */}
        {!catalog && !error && (
          <div
            className="flex min-h-52 items-center justify-center gap-2 text-sm font-semibold text-gray-500"
            role="status"
          >
            <LoaderCircle className="animate-spin" aria-hidden="true" size={20} />
            Loading products…
          </div>
        )}

        {/* Error — surface the actual message so it can be diagnosed */}
        {error && (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-bold">Could not load products</p>
              <p className="mt-1 text-red-600">{error}</p>
              <p className="mt-2 text-gray-500">
                Check the Supabase connection, confirm the{" "}
                <code className="rounded bg-gray-100 px-1 text-xs">products</code> table has
                rows with <code className="rounded bg-gray-100 px-1 text-xs">status = &apos;active&apos;</code>,
                and verify RLS allows anon reads.
              </p>
            </div>
          </div>
        )}

        {/* Catalog loaded */}
        {catalog && !error && (
          <>
            {/* Category filter tabs — only shown when there are multiple categories */}
            {visibleCategories.length > 1 && (
              <div
                className="mb-7 flex gap-2 overflow-x-auto pb-1"
                aria-label="Filter products by category"
              >
                {[{ id: "all", name: "All", slug: "all" }, ...visibleCategories].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.slug)}
                    aria-pressed={activeCategory === c.slug}
                    className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d] ${
                      activeCategory === c.slug
                        ? "border-[#0d0d0d] bg-[#0d0d0d] text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Product grid */}
            {displayed.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayed.map((product) => (
                  <ProductCard key={product.id} product={product} currency={catalog.currency} />
                ))}
              </div>
            ) : (
              /* Compact honest empty state — no fake "coming soon" messaging */
              <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white py-10 text-center">
                <Package aria-hidden="true" size={32} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">
                  {activeCategory === "all"
                    ? "No active products are in the catalog yet."
                    : "No products are in this category yet."}
                </p>
                <Link href="/shop" className="text-sm font-bold text-[#0d0d0d] underline underline-offset-2">
                  Browse the full catalog
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
