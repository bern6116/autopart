"use client";

import { useState } from "react";
import {
  ShoppingCart, Zap, Heart, Share2, Check,
  Minus, Plus, Truck, Shield, RotateCcw,
} from "lucide-react";
import type { Product } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import { useCart } from "@/lib/cartContext";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copied, setCopied] = useState(false);

  const maxQty = Math.min(product.stock, 10);
  const outOfStock = product.stockStatus === "out_of_stock";

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const stockLabel =
    product.stockStatus === "in_stock"
      ? "In Stock"
      : product.stockStatus === "low_stock"
      ? `Only ${product.stock} left — order soon!`
      : "Out of Stock";

  const stockVariant =
    product.stockStatus === "in_stock"
      ? "green"
      : product.stockStatus === "low_stock"
      ? "orange"
      : "red";

  return (
    <div className="space-y-5">

      {/* Price block */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-[#0d0d0d]">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.discountPercent && (
            <span className="bg-red-500 text-white text-sm font-black px-2.5 py-1 rounded-lg">
              -{product.discountPercent}%
            </span>
          )}
        </div>
        {product.originalPrice && (
          <p className="text-sm text-green-600 font-semibold mt-0.5">
            You save ${(product.originalPrice - product.price).toFixed(2)}
          </p>
        )}
      </div>

      {/* Stock badge */}
      <div className="flex items-center gap-3">
        <Badge variant={stockVariant} size="md" dot>{stockLabel}</Badge>
        {product.stockStatus === "low_stock" && (
          <span className="text-xs text-orange-600 font-semibold animate-pulse">
            🔥 High demand
          </span>
        )}
      </div>

      {/* Quantity selector */}
      {!outOfStock && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#f4f4f4] border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-10 h-11 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center font-black text-[#0d0d0d] text-sm select-none">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="w-10 h-11 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-gray-400">
              {product.stock} available
            </span>
          </div>
        </div>
      )}

      {/* Primary CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-base transition-all ${
            addedToCart
              ? "bg-green-500 text-white"
              : outOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0d0d0d] text-white hover:bg-[#1a1a1a] active:bg-[#212121]"
          }`}
        >
          {addedToCart ? (
            <><Check size={18} /> Added to Cart!</>
          ) : (
            <><ShoppingCart size={18} /> {outOfStock ? "Out of Stock" : "Add to Cart"}</>
          )}
        </button>

        <button
          disabled={outOfStock}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-base bg-[#d4f000] text-[#0d0d0d] hover:bg-[#c4e000] active:bg-[#b8d400] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Zap size={18} />
          Buy Now
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
            wishlisted
              ? "border-red-300 bg-red-50 text-red-600"
              : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-[#0d0d0d]"
          }`}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
          {wishlisted ? "Saved" : "Wishlist"}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:border-gray-400 hover:text-[#0d0d0d] transition-all"
        >
          {copied ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Assurance row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
        {[
          { icon: Truck, label: "Free shipping", sub: "over $75" },
          { icon: Shield, label: "OEM quality", sub: "guaranteed" },
          { icon: RotateCcw, label: "30-day", sub: "returns" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center p-2.5 bg-[#f9f9f9] rounded-xl">
            <Icon size={16} className="text-[#0d0d0d] mb-1" />
            <span className="text-[10px] font-bold text-[#0d0d0d] leading-tight">{label}</span>
            <span className="text-[9px] text-gray-400">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
