"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ChevronRight, Search } from "lucide-react";
import { clearCatalogCache, loadHomeCatalog, type HomeCatalog } from "@/lib/homeCatalog";

function BrandLogo({ url, name }: { url: string | null; name: string }) {
  if (!url) return <span className="text-xl font-black tracking-tight text-[#0d0d0d]">{name}</span>;
  // Brand logo URLs are administrator-approved database values. A normal image
  // avoids requiring every possible manufacturer host in next.config.ts.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`${name} logo`} className="max-h-12 max-w-full object-contain" />;
}

export default function BrandsClient() {
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    setError("");
    if (fresh) clearCatalogCache();
    try {
      setCatalog(await loadHomeCatalog());
    } catch {
      setCatalog(null);
      setError("We couldn’t load parts brands. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadHomeCatalog()
      .then((result) => { if (active) setCatalog(result); })
      .catch(() => {
        if (active) {
          setCatalog(null);
          setError("We couldn’t load parts brands. Please try again.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const brands = useMemo(() => {
    if (!catalog) return [];
    const productIds = new Map<string, Set<string>>();
    for (const product of catalog.products) {
      if (!product.brandId) continue;
      const ids = productIds.get(product.brandId) ?? new Set<string>();
      ids.add(product.id);
      productIds.set(product.brandId, ids);
    }
    return catalog.brands
      .map((brand) => ({ ...brand, productCount: productIds.get(brand.id)?.size ?? 0 }))
      .filter((brand) => brand.productCount > 0);
  }, [catalog]);

  const query = search.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () => brands.filter((brand) => brand.name.trim().toLocaleLowerCase().includes(query)),
    [brands, query]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="transition-colors hover:text-[#0d0d0d]">Home</Link>
        <ChevronRight size={12} className="text-gray-300" aria-hidden="true" />
        <span className="font-semibold text-[#0d0d0d]">Parts Brands</span>
      </nav>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0d0d0d] sm:text-4xl">Parts Brands</h1>
          <p className="mt-1 text-sm text-gray-500">Browse manufacturers represented by products currently available in the AutoCore catalog.</p>
        </div>
        <label className="relative shrink-0">
          <span className="sr-only">Search parts brands</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search parts brands…" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] sm:w-64" />
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        </label>
      </div>

      {loading && (
        <div role="status" aria-label="Loading parts brands" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
              <div className="h-14 rounded-xl bg-gray-100" />
              <div className="mt-5 h-3 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
          <AlertCircle size={22} className="text-red-600" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>
          <button type="button" onClick={() => void load(true)} className="mt-4 rounded-xl bg-[#d4f000] px-5 py-2.5 text-sm font-extrabold text-[#0d0d0d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">Retry</button>
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center"><p className="font-bold text-[#0d0d0d]">No parts brands available yet</p></div>
      )}

      {!loading && !error && brands.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <p className="font-bold text-[#0d0d0d]">No brands match your search</p>
          <button type="button" onClick={() => setSearch("")} className="mt-3 text-sm font-semibold text-gray-500 underline underline-offset-2 hover:text-[#0d0d0d]">Clear search</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((brand) => (
            <Link key={brand.id} href={`/shop?brand=${encodeURIComponent(brand.slug)}`} aria-label={`Shop ${brand.name} parts (${brand.productCount} ${brand.productCount === 1 ? "product" : "products"})`} className="group flex min-h-44 flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4f000]">
              <div className="flex h-16 items-center justify-center rounded-xl bg-[#f7f7f7] px-4"><BrandLogo url={brand.logo_url} name={brand.name} /></div>
              <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
                <div><p className="font-extrabold text-[#0d0d0d]">{brand.name}</p><p className="mt-0.5 text-xs text-gray-500">{brand.productCount} {brand.productCount === 1 ? "product" : "products"}</p></div>
                <ArrowRight size={16} className="text-gray-400 transition-colors group-hover:text-[#0d0d0d]" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
