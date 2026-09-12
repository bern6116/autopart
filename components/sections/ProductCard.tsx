"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.slug}`);
  };

  const stockLabel =
    product.stockStatus === "in_stock"
      ? "In Stock"
      : product.stockStatus === "low_stock"
      ? `Only ${product.stock} left`
      : "Out of Stock";

  const stockVariant =
    product.stockStatus === "in_stock"
      ? "green"
      : product.stockStatus === "low_stock"
      ? "orange"
      : "red";

  // ── Horizontal variant ──────────────────────────────────────
  if (variant === "horizontal") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#d4f000] hover:shadow-md transition-all product-card"
      >
        <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="96px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 font-medium">{product.brand}</div>
          <div className="font-bold text-[#0d0d0d] text-sm leading-snug mt-0.5 line-clamp-2">
            {product.name}
          </div>
          <StarRating rating={product.rating} showCount count={product.reviewCount} className="mt-1" />
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-[#0d0d0d] text-base">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Badge variant={stockVariant} size="sm" dot>
              {stockLabel}
            </Badge>
          </div>
        </div>
      </Link>
    );
  }

  // ── Compact variant ─────────────────────────────────────────
  if (variant === "compact") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#d4f000] transition-all product-card"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="200px"
          />
          {product.discountPercent && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
              -{product.discountPercent}%
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
            {product.brand}
          </div>
          <div className="font-bold text-[#0d0d0d] text-xs mt-0.5 line-clamp-2 leading-snug">
            {product.name}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-black text-[#0d0d0d] text-sm">${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-semibold text-gray-600">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Default card ────────────────────────────────────────────
  // NOTE: The image area is a plain <div>, NOT a <Link>, to avoid nested <a> elements.
  // The wishlist and quick-view buttons sit inside it and use imperative navigation.
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#d4f000]/50 product-card flex flex-col">

      {/* Image area — div so we never nest <a> inside <a> */}
      <div
        className="relative block overflow-hidden bg-gray-50 aspect-square cursor-pointer"
        onClick={() => router.push(`/products/${product.slug}`)}
        role="link"
        aria-label={`View ${product.name}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && router.push(`/products/${product.slug}`)}
      >
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Discount / New badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.discountPercent && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md leading-tight">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#d4f000] text-[#0d0d0d] text-[10px] font-black px-2 py-0.5 rounded-md leading-tight">
              NEW
            </span>
          )}
        </div>

        {/* Hover action buttons — buttons only, no nested anchors */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all ${
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-gray-500 hover:text-red-500 hover:bg-red-50"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleQuickView}
            className="w-8 h-8 rounded-lg bg-white text-gray-500 hover:text-[#0d0d0d] hover:bg-gray-100 flex items-center justify-center shadow-sm transition-all"
            aria-label="Quick view"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand & SKU */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {product.brand}
          </span>
          <span className="text-[10px] text-gray-300 font-mono">{product.sku}</span>
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="font-bold text-[#0d0d0d] text-sm leading-snug line-clamp-2 hover:text-gray-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2">
          <StarRating rating={product.rating} showValue showCount count={product.reviewCount} />
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-black text-[#0d0d0d] text-xl">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.discountPercent && (
            <span className="text-xs font-bold text-red-500">
              Save ${((product.originalPrice ?? 0) - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-1.5">
          <Badge variant={stockVariant} size="sm" dot>
            {stockLabel}
          </Badge>
        </div>

        {/* Add to Cart + View Details */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stockStatus === "out_of_stock"}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              addedToCart
                ? "bg-green-500 text-white"
                : product.stockStatus === "out_of_stock"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#0d0d0d] text-white hover:bg-[#d4f000] hover:text-[#0d0d0d]"
            }`}
          >
            <ShoppingCart size={13} />
            {addedToCart ? "Added!" : "Add to Cart"}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-[#0d0d0d] hover:border-[#0d0d0d] transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
