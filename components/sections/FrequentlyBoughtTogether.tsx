"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import ProductImage from "@/components/sections/ProductImage";
import { useCart } from "@/lib/cartContext";
import { formatCatalogPrice, loadHomeCatalog, type HomeCatalog } from "@/lib/homeCatalog";

// This existing hand-curated maintenance grouping is not purchase-history data.
const CURATED_MAINTENANCE_SKUS = ["KN-33-2304", "BSH-4304", "ACD-PF64"];

export default function FrequentlyBoughtTogether() {
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [message, setMessage] = useState("");
  const { items, addItems } = useCart();

  useEffect(() => {
    let active = true;
    loadHomeCatalog().then((result) => active && setCatalog(result)).catch(() => {
      if (active) setCatalog(null);
    });
    return () => { active = false; };
  }, []);

  const bundle = useMemo(() => {
    if (!catalog) return [];
    const bySku = new Map(catalog.products.map((product) => [product.sku, product]));
    return CURATED_MAINTENANCE_SKUS.map((sku) => bySku.get(sku)).filter(
      (product): product is NonNullable<typeof product> => Boolean(product)
    );
  }, [catalog]);

  if (!catalog || bundle.length !== CURATED_MAINTENANCE_SKUS.length) return null;

  const total = bundle.reduce((sum, product) => sum + product.price, 0);
  const unavailable = bundle.some((product) => product.stock < 1);

  const handleAddBundle = () => {
    const blocked = bundle.find((product) => {
      const currentQuantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
      return product.stock < 1 || currentQuantity + 1 > Math.min(product.stock, 10);
    });

    if (blocked) {
      setMessage(`${blocked.name} cannot be added at the requested quantity.`);
      return;
    }

    addItems(bundle.map((product) => ({ product, qty: 1 })));
    setMessage("All kit items were added to your cart.");
  };

  return (
    <section className="bg-white py-14" aria-labelledby="repair-kit-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gray-500">Curated maintenance set</p>
          <h2 id="repair-kit-title" className="text-3xl font-black tracking-tight text-[#0d0d0d]">Suggested Maintenance Set</h2>
          <p className="mt-2 text-sm text-gray-600">Routine engine service parts. Check each item&apos;s compatibility before ordering.</p>
        </div>

        <div className="grid gap-6 rounded-2xl border border-gray-200 bg-[#f9f9f9] p-5 md:p-7 lg:grid-cols-[1fr_280px] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-3">
            {bundle.map((product, index) => (
              <div key={product.id} className="relative">
                <Link href={`/products/${product.slug}`} className="group grid grid-cols-[88px_1fr] items-center gap-3 rounded-xl bg-white p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d] sm:block">
                  <ProductImage src={product.thumbnail} alt={product.name} sizes="(max-width: 639px) 88px, 200px" className="aspect-square w-[88px] rounded-lg sm:w-full" illustrative={product.imageIsIllustrative} />
                  <div className="min-w-0 sm:pt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Qty 1{product.brand ? ` · ${product.brand}` : ""}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#0d0d0d]">{product.name}</h3>
                    <p className="mt-2 font-black text-[#0d0d0d]">{formatCatalogPrice(product.price, catalog.currency)}</p>
                    {product.stock < 1 && <p className="mt-1 text-xs font-bold text-red-600">Out of stock</p>}
                  </div>
                </Link>
                {index < bundle.length - 1 && (
                  <span className="absolute -bottom-3 left-1/2 z-10 hidden h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#d4f000] sm:-right-5 sm:bottom-auto sm:left-auto sm:top-1/2 sm:flex sm:-translate-y-1/2 sm:translate-x-0" aria-hidden="true">
                    <Plus size={15} />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="text-sm font-semibold text-gray-500">Total for {bundle.length} items</p>
            <p className="mt-1 text-3xl font-black text-[#0d0d0d]">{formatCatalogPrice(total, catalog.currency)}</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">No additional bundle discount is applied. Stock is checked before adding.</p>
            <button type="button" onClick={handleAddBundle} disabled={unavailable} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d4f000] px-5 text-sm font-black text-[#0d0d0d] hover:bg-[#c4e000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">
              <ShoppingCart aria-hidden="true" size={17} /> Add Kit to Cart
            </button>
            <p className="mt-3 min-h-10 text-sm font-semibold text-gray-700" role="status" aria-live="polite">{message}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
