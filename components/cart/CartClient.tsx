"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowLeft,
  ArrowRight, Tag, Truck, ShieldCheck, RotateCcw,
  PackageSearch, ChevronRight, X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cartContext";
import { products as allProducts } from "@/lib/data";
import ProductCard from "@/components/sections/ProductCard";

const FREE_SHIPPING_THRESHOLD = 75;
const TAX_RATE = 0.08; // 8%
const PROMO_CODES: Record<string, number> = {
  AUTOCORE10: 0.10,
  SAVE15: 0.15,
  WELCOME20: 0.20,
};

function EmptyCart() {
  const suggestions = allProducts.filter((p) => p.isFeatured).slice(0, 4);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[#0d0d0d] font-semibold">Cart</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center mb-10">
        <div className="w-20 h-20 bg-[#f4f4f4] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShoppingCart size={32} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0d0d0d] mb-2">Your cart is empty</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
          Looks like you haven&apos;t added any parts yet. Browse our catalogue to get started.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-8 py-3.5 rounded-xl hover:bg-[#c4e000] transition-colors"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>

      {/* Suggestions */}
      <div>
        <h2 className="text-xl font-extrabold text-[#0d0d0d] mb-4">You might like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

export default function CartClient() {
  const { items, totalItems, subtotal, removeItem, updateQty, clearCart } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  // Derived totals
  const discountRate = appliedPromo ? (PROMO_CODES[appliedPromo] ?? 0) : 0;
  const discountAmount = subtotal * discountRate;
  const discountedSubtotal = subtotal - discountAmount;
  const shippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const taxAmount = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + shippingCost + taxAmount;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError("");
      setPromoInput("");
    } else {
      setPromoError("Invalid promo code. Try AUTOCORE10, SAVE15, or WELCOME20.");
    }
  };

  if (items.length === 0) return <EmptyCart />;

  // Related products — different from what's in cart
  const cartIds = new Set(items.map((i) => i.product.id));
  const related = allProducts.filter((p) => !cartIds.has(p.id)).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[#0d0d0d] font-semibold">Cart</span>
      </nav>

      {/* Page title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d0d0d]">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors font-medium"
        >
          <Trash2 size={13} /> Clear cart
        </button>
      </div>

      {/* Free shipping progress */}
      {amountToFreeShipping > 0 && (
        <div className="bg-[#0d0d0d] text-white rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3">
          <Truck size={18} className="text-[#d4f000] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              Add <span className="text-[#d4f000] font-extrabold">${amountToFreeShipping.toFixed(2)}</span> more for free shipping!
            </p>
            <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-[#d4f000] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {amountToFreeShipping === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3">
          <Truck size={18} className="text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-800">
            🎉 You qualify for <span className="font-extrabold">free shipping!</span>
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Cart items ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {/* Table header — desktop only */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          {items.map(({ product, quantity }) => {
            const lineTotal = product.price * quantity;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
              >
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Product info */}
                  <div className="col-span-12 sm:col-span-6 flex gap-3 items-start">
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} className="shrink-0">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          sizes="80px"
                        />
                      </div>
                    </Link>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide mb-0.5">
                        {product.brand}
                      </div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-[#0d0d0d] text-sm leading-snug line-clamp-2 hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {product.sku}</div>
                      {/* Stock */}
                      <div className={`text-[10px] font-semibold mt-1 ${
                        product.stockStatus === "in_stock" ? "text-green-600"
                        : product.stockStatus === "low_stock" ? "text-orange-500"
                        : "text-red-500"
                      }`}>
                        {product.stockStatus === "in_stock" ? "✓ In Stock"
                         : product.stockStatus === "low_stock" ? `⚠ Only ${product.stock} left`
                         : "✕ Out of Stock"}
                      </div>
                      {/* Mobile price */}
                      <div className="sm:hidden mt-1.5 text-sm font-extrabold text-[#0d0d0d]">
                        ${product.price.toFixed(2)}
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Desktop remove */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Remove item"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Price — desktop */}
                  <div className="hidden sm:block col-span-2 text-center">
                    <div className="font-extrabold text-[#0d0d0d] text-sm">${product.price.toFixed(2)}</div>
                    {product.originalPrice && (
                      <div className="text-xs text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center bg-[#f4f4f4] border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-8 h-9 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
                        disabled={quantity <= 1}
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-9 text-center font-extrabold text-[#0d0d0d] text-sm select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-8 h-9 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
                        disabled={quantity >= 10}
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-6 sm:col-span-2 text-right">
                    <div className="font-extrabold text-[#0d0d0d]">${lineTotal.toFixed(2)}</div>
                    {quantity > 1 && (
                      <div className="text-[10px] text-gray-400">
                        {quantity} × ${product.price.toFixed(2)}
                      </div>
                    )}
                    {/* Mobile remove */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="sm:hidden text-[10px] text-red-400 hover:text-red-600 font-semibold mt-1 flex items-center gap-1 ml-auto"
                    >
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continue shopping */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0d0d0d] border-2 border-gray-200 px-5 py-2.5 rounded-xl hover:border-[#0d0d0d] transition-all"
            >
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Order Summary ───────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-base font-extrabold text-[#0d0d0d] mb-5 pb-4 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Line items */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="font-bold text-[#0d0d0d]">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1.5">
                    <Tag size={12} />
                    Promo ({appliedPromo})
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      <X size={11} />
                    </button>
                  </span>
                  <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Truck size={12} />
                  Shipping
                </span>
                <span className={`font-bold ${shippingCost === 0 ? "text-green-600" : "text-[#0d0d0d]"}`}>
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Tax (8%)</span>
                <span className="font-bold text-[#0d0d0d]">${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
              <span className="font-extrabold text-[#0d0d0d] text-base">Total</span>
              <span className="font-black text-[#0d0d0d] text-2xl">${total.toFixed(2)}</span>
            </div>

            {/* Promo code input */}
            <div className="mt-5">
              {!appliedPromo ? (
                <div>
                  <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2 block">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      placeholder="Enter code"
                      className="flex-1 bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]"
                    />
                    <button
                      onClick={applyPromo}
                      className="bg-[#0d0d0d] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Try: AUTOCORE10, SAVE15, WELCOME20
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <Tag size={14} className="text-green-600" />
                  <div className="flex-1">
                    <div className="text-xs font-extrabold text-green-800">{appliedPromo} applied!</div>
                    <div className="text-[10px] text-green-600">{(discountRate * 100).toFixed(0)}% off your order</div>
                  </div>
                  <button onClick={() => setAppliedPromo(null)} className="text-green-400 hover:text-green-600">
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <Link
              href="/checkout"
              className="mt-5 flex items-center justify-center gap-2 w-full bg-[#d4f000] text-[#0d0d0d] font-extrabold py-4 rounded-xl hover:bg-[#c4e000] active:bg-[#b8d400] transition-colors text-base"
            >
              Proceed to Checkout <ArrowRight size={17} />
            </Link>

            {/* Secure badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: ShieldCheck, label: "Secure\nCheckout" },
                { icon: RotateCcw, label: "30-Day\nReturns" },
                { icon: Truck, label: "Fast\nShipping" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-2 bg-[#f9f9f9] rounded-xl">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-[9px] text-gray-400 font-medium whitespace-pre-line leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment icons */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {["VISA", "MC", "AMEX", "PayPal"].map((p) => (
                <span
                  key={p}
                  className="px-2 py-1 border border-gray-200 rounded text-[9px] font-extrabold text-gray-400"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-1 bg-[#d4f000] rounded-full inline-block" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0d0d0d]">
                  Customers Also Bought
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0d0d0d]">You May Also Like</h2>
            </div>
            <Link href="/shop" className="text-sm font-bold text-[#0d0d0d] hover:text-gray-600 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
