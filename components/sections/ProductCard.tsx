"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cartContext";
import { formatCatalogPrice } from "@/lib/homeCatalog";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import ProductImage from "@/components/sections/ProductImage";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
  currency?: string;
  priority?: boolean;
}

export default function ProductCard({ product, variant = "default", currency = "USD", priority = false }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [message, setMessage] = useState("");
  const hasRating = product.rating > 0 && product.reviewCount > 0;
  const hasValidComparison = typeof product.originalPrice === "number" && product.originalPrice > product.price;
  const discountPercent = hasValidComparison
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const stockLabel = product.stock <= 0
    ? "Out of stock"
    : product.reorderLevel !== undefined && product.stock <= product.reorderLevel
      ? "Low stock"
      : "In stock";
  const stockVariant = product.stock <= 0 ? "red" : stockLabel === "Low stock" ? "orange" : "green";
  const price = formatCatalogPrice(product.price, currency);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    const quantityInCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
    if (quantityInCart >= Math.min(product.stock, 10)) {
      setMessage("Cart quantity limit reached");
    } else {
      addItem(product, 1);
      setMessage("Added to cart");
    }
    window.setTimeout(() => setMessage(""), 1800);
  };

  if (variant === "horizontal") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-[#d4f000]">
        <ProductImage src={product.thumbnail} alt={product.name} sizes="96px" className="h-24 w-24 shrink-0 rounded-lg" illustrative={product.imageIsIllustrative} priority={priority} />
        <div className="min-w-0 flex-1">
          {product.brand && <p className="text-xs font-semibold text-gray-500">{product.brand}</p>}
          <p className="mt-1 line-clamp-2 text-sm font-bold text-[#0d0d0d]">{product.name}</p>
          {hasRating && <StarRating rating={product.rating} showCount count={product.reviewCount} className="mt-1" />}
          <p className="mt-2 font-black text-[#0d0d0d]">{price}</p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-xl border border-gray-100 bg-white hover:border-[#d4f000]">
        <ProductImage src={product.thumbnail} alt={product.name} sizes="200px" className="aspect-square" illustrative={product.imageIsIllustrative} priority={priority} />
        <div className="p-3">
          {product.brand && <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{product.brand}</p>}
          <p className="mt-1 line-clamp-2 text-xs font-bold text-[#0d0d0d]">{product.name}</p>
          <p className="mt-2 text-sm font-black text-[#0d0d0d]">{price}</p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-[#d4f000]">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <ProductImage src={product.thumbnail} alt={product.name} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="aspect-square w-full" illustrative={product.imageIsIllustrative} priority={priority} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-h-5 items-start justify-between gap-3">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-gray-500">{product.brand || ""}</p>
          <p className="shrink-0 text-xs font-medium text-gray-500">SKU {product.sku}</p>
        </div>
        <Link href={`/products/${product.slug}`} className="mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0d0d0d]">
          <h3 className="line-clamp-3 text-base font-bold leading-5 text-[#0d0d0d] hover:text-gray-600">{product.name}</h3>
        </Link>
        {hasRating && <div className="mt-2"><StarRating rating={product.rating} showValue showCount count={product.reviewCount} /></div>}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-black text-[#0d0d0d]">{price}</span>
          {hasValidComparison && (
            <>
              <span className="text-sm text-gray-400 line-through">{formatCatalogPrice(product.originalPrice!, currency)}</span>
              <span className="text-xs font-bold text-red-600">-{discountPercent}%</span>
            </>
          )}
        </div>
        <div className="mt-2"><Badge variant={stockVariant} size="sm" dot>{stockLabel}</Badge></div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          <button type="button" onClick={handleAddToCart} disabled={product.stock <= 0} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#d4f000] px-3 text-xs font-black text-[#0d0d0d] transition-colors hover:bg-[#c4e000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500" aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart aria-hidden="true" size={14} /> Add to Cart
          </button>
          <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 px-3 text-xs font-bold text-[#0d0d0d] hover:border-[#0d0d0d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">View Details</Link>
        </div>
        <p className="min-h-5 pt-2 text-center text-xs font-semibold text-gray-600" role="status" aria-live="polite">{message}</p>
      </div>
    </article>
  );
}
