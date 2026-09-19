"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Package, CheckCircle2, Clock, Truck, MapPin,
  XCircle, RotateCcw, ChevronRight, AlertCircle, ShoppingBag,
  CreditCard, Calendar, Hash, RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminOrders } from "@/lib/admin-data";
import type { DBOrder, OrderStatus, PaymentStatus } from "@/types/database";
import Badge from "@/components/ui/Badge";

// ── Timeline step definition ──────────────────────────────────
interface TimelineStep {
  key: OrderStatus | string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: "pending",    label: "Order Placed",       icon: Package },
  { key: "confirmed",  label: "Order Confirmed",    icon: CheckCircle2 },
  { key: "processing", label: "Processing",         icon: Clock },
  { key: "ready",      label: "Ready for Delivery", icon: ShoppingBag },
  { key: "shipped",    label: "Shipped",            icon: Truck },
  { key: "delivered",  label: "Delivered",          icon: MapPin },
];

// Status ordering for timeline progress
const STATUS_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, ready: 3, shipped: 4, delivered: 5,
};

// Badge variants for order status
const STATUS_BADGE: Record<string, "yellow" | "blue" | "green" | "red" | "orange" | "gray"> = {
  pending:    "orange",
  confirmed:  "blue",
  processing: "blue",
  ready:      "yellow",
  shipped:    "yellow",
  delivered:  "green",
  cancelled:  "red",
  refunded:   "gray",
};

const PAYMENT_BADGE: Record<string, "green" | "orange" | "red" | "gray"> = {
  paid:     "green",
  pending:  "orange",
  failed:   "red",
  refunded: "gray",
};

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

// Determine whether Supabase is configured with real credentials
function isSupabaseReal() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.length > 0 && !url.includes("placeholder") && !url.includes("your-project-ref");
}

// ── Main component ────────────────────────────────────────────
export default function TrackOrderClient() {
  const [orderNum, setOrderNum] = useState("");
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [order,    setOrder]    = useState<DBOrder | null>(null);
  const [error,    setError]    = useState("");

  // Realtime subscription ref — updated when order is found
  const [realtimeOrder, setRealtimeOrder] = useState<DBOrder | null>(null);
  const displayOrder = realtimeOrder ?? order;

  // ── Supabase Realtime subscription ──────────────────────
  useEffect(() => {
    if (!order || !isSupabaseReal()) return;

    // Subscribe to changes on this specific order row
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          // Merge updated fields into the existing order object
          setRealtimeOrder((prev) => ({
            ...(prev ?? order),
            ...(payload.new as Partial<DBOrder>),
          }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order]);

  // ── Lookup function ──────────────────────────────────────
  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const qNum   = orderNum.trim().toUpperCase();
    const qEmail = email.trim().toLowerCase();

    if (!qNum)   { setError("Please enter your order number."); return; }
    if (!qEmail) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(qEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);
    setRealtimeOrder(null);
    setSearched(false);

    try {
      if (isSupabaseReal()) {
        // ── Real Supabase query ────────────────────────────
        // Security: both order_number AND customer_email must match.
        // This prevents customers from accessing other orders.
        const { data, error: dbErr } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(
              id, order_id, product_id, product_name, sku,
              quantity, unit_price, discount, total
            )
          `)
          .eq("order_number", qNum)
          .eq("customer_email", qEmail)
          .limit(1)
          .maybeSingle();

        if (dbErr) throw dbErr;

        setSearched(true);
        if (data) {
          setOrder(data as DBOrder);
        } else {
          setOrder(null);
        }
      } else {
        // ── Sample data fallback (dev mode / no credentials) ─
        await new Promise((r) => setTimeout(r, 700));
        const found = adminOrders.find(
          (o) =>
            o.order_number.toUpperCase() === qNum &&
            o.customer_email.toLowerCase() === qEmail
        );
        setSearched(true);
        setOrder(found ?? null);
      }
    } catch (err) {
      console.error("[TrackOrder] lookup error:", err);
      setError("Something went wrong while looking up your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderNum, email]);

  const handleReset = () => {
    setOrderNum(""); setEmail(""); setOrder(null);
    setRealtimeOrder(null); setSearched(false); setError("");
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0d0d0d] font-semibold">Track Order</span>
        </nav>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-1 bg-[#d4f000] rounded-full inline-block" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">Delivery</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0d0d0d] leading-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Enter your order details to view your delivery status.
        </p>
      </div>

      {/* ── Search form ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} noValidate className="space-y-4">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Order number */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNum}
                  onChange={(e) => { setOrderNum(e.target.value); setError(""); }}
                  placeholder="e.g. AC-20241001"
                  className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent transition"
                />
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="customer@email.com"
                  autoComplete="email"
                  className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent transition"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-3 rounded-xl hover:bg-[#c4e000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Searching…
                </>
              ) : (
                <><Search size={15} />Track Order</>
              )}
            </button>
            {searched && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 border-2 border-gray-200 font-bold px-4 py-3 rounded-xl hover:border-gray-400 text-sm text-gray-600 transition-colors"
              >
                <RefreshCw size={14} />New Search
              </button>
            )}
          </div>
        </form>

        {/* Dev hint */}
        {!isSupabaseReal() && (
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4f000] inline-block" />
            Dev mode: try{" "}
            <button
              onClick={() => { setOrderNum("AC-20241001"); setEmail("marcus@example.com"); }}
              className="underline hover:text-[#0d0d0d] font-mono"
            >
              AC-20241001 / marcus@example.com
            </button>
            {" "}or{" "}
            <button
              onClick={() => { setOrderNum("AC-20241006"); setEmail("marcus@example.com"); }}
              className="underline hover:text-[#0d0d0d] font-mono"
            >
              AC-20241006
            </button>{" "}(cancelled)
          </p>
        )}
      </div>

      {/* ── Empty / idle state ───────────────────────────── */}
      {!searched && !loading && (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 px-6 text-center">
          <div className="w-16 h-16 bg-[#f4f4f4] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-gray-300" />
          </div>
          <h3 className="font-extrabold text-[#0d0d0d] text-lg mb-1">
            Track your AUTO CORE order
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Enter your order number and email address to see your latest order status and delivery information.
          </p>
        </div>
      )}

      {/* ── Not found ────────────────────────────────────── */}
      {searched && !loading && !displayOrder && (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 px-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle size={28} className="text-red-400" />
          </div>
          <h3 className="font-extrabold text-[#0d0d0d] text-lg mb-1">Order not found</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            Please check your order number and email address and try again.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-6 py-2.5 rounded-xl hover:bg-[#c4e000] text-sm transition-colors"
          >
            <Search size={14} />Try Again
          </button>
        </div>
      )}

      {/* ── Order result ─────────────────────────────────── */}
      {displayOrder && !loading && (
        <OrderResult order={displayOrder} />
      )}
    </div>
  );
}

// ── Order Result component ────────────────────────────────────
function OrderResult({ order }: { order: DBOrder }) {
  const isCancelled = order.status === "cancelled";
  const isRefunded  = order.status === "refunded";
  const isTerminal  = isCancelled || isRefunded;

  const currentIdx = STATUS_INDEX[order.status] ?? -1;

  return (
    <div className="space-y-5">

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header bar */}
        <div className="bg-[#0d0d0d] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Order Number</div>
            <div className="font-black text-white text-lg font-mono">{order.order_number}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_BADGE[order.status] ?? "gray"} size="md" dot>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge variant={PAYMENT_BADGE[order.payment_status] ?? "gray"} size="md" dot>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Order meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 border-b border-gray-100">
          {[
            { icon: Calendar,    label: "Order Date",     value: fmtDate(order.created_at) },
            { icon: Clock,       label: "Last Updated",   value: `${fmtDate(order.updated_at)} ${fmtTime(order.updated_at)}` },
            { icon: CreditCard,  label: "Payment",        value: order.payment_method.toUpperCase() },
            { icon: Package,     label: "Order Total",    value: `$${order.total.toFixed(2)}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                <Icon size={10} />{label}
              </div>
              <div className="font-bold text-[#0d0d0d] text-sm">{value}</div>
            </div>
          ))}
        </div>

        {/* Customer row */}
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Customer</div>
            <div className="font-bold text-[#0d0d0d] text-sm">{order.customer_name}</div>
          </div>
          {order.shipping_address && (
            <div className="text-sm text-gray-500 flex items-start gap-1.5">
              <MapPin size={13} className="text-[#d4f000] mt-0.5 shrink-0" />
              <span>
                {order.shipping_address.address_line1}
                {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`},
                {" "}{order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.postal_code}
              </span>
            </div>
          )}
        </div>

        {/* Order totals */}
        <div className="px-5 py-4">
          <div className="space-y-1.5 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-[#0d0d0d]">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-semibold">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className={`font-semibold ${order.shipping === 0 ? "text-green-600" : "text-[#0d0d0d]"}`}>
                {order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span className="font-semibold text-[#0d0d0d]">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-[#0d0d0d] text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delivery Timeline ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-extrabold text-[#0d0d0d] mb-6 flex items-center gap-2">
          <Truck size={16} className="text-[#d4f000]" />
          Delivery Status
        </h2>

        {/* Cancelled / Refunded banner */}
        {isCancelled && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <XCircle size={18} className="text-red-500 shrink-0" />
            <div>
              <div className="font-bold text-red-700 text-sm">Order Cancelled</div>
              <div className="text-xs text-red-500">
                {order.notes || "This order has been cancelled."}
              </div>
            </div>
          </div>
        )}
        {isRefunded && (
          <div className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-6">
            <RotateCcw size={18} className="text-gray-500 shrink-0" />
            <div>
              <div className="font-bold text-gray-700 text-sm">Order Returned &amp; Refunded</div>
              <div className="text-xs text-gray-500">A refund has been issued to your original payment method.</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[18px] top-5 bottom-5 w-px bg-gray-200 z-0" />

          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, idx) => {
              const isDone    = !isTerminal && currentIdx >= idx;
              const isCurrent = !isTerminal && currentIdx === idx;
              const isFuture  = isTerminal ? true : currentIdx < idx;

              return (
                <div key={step.key} className="flex items-start gap-4 relative z-10">
                  {/* Circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isDone && !isCurrent
                      ? "bg-[#d4f000] border-[#d4f000]"
                      : isCurrent
                      ? "bg-[#0d0d0d] border-[#d4f000] shadow-[0_0_0_4px_rgba(212,240,0,0.15)]"
                      : "bg-white border-gray-200"
                  }`}>
                    {isDone && !isCurrent
                      ? <CheckCircle2 size={16} className="text-[#0d0d0d]" />
                      : <step.icon size={15} className={isCurrent ? "text-[#d4f000]" : "text-gray-300"} />
                    }
                  </div>

                  {/* Label */}
                  <div className={`pb-6 pt-1 flex-1 ${idx === TIMELINE_STEPS.length - 1 ? "pb-0" : ""}`}>
                    <div className={`text-sm font-bold transition-colors ${
                      isDone ? "text-[#0d0d0d]" : "text-gray-400"
                    }`}>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 bg-[#d4f000] text-[#0d0d0d] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
                          Current
                        </span>
                      )}
                    </div>
                    {isDone && (
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {isCurrent
                          ? `Updated ${fmtDate(order.updated_at)}`
                          : `Completed`}
                      </div>
                    )}
                    {isFuture && !isTerminal && (
                      <div className="text-[11px] text-gray-300 mt-0.5">Pending</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Order items ──────────────────────────────────── */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-extrabold text-[#0d0d0d] flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#d4f000]" />
              Order Items ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 bg-[#f4f4f4] rounded-xl flex items-center justify-center shrink-0">
                  <Package size={18} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#0d0d0d] text-sm line-clamp-1">{item.product_name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">SKU: {item.sku}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-[#0d0d0d] text-sm">${item.total.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">${item.unit_price.toFixed(2)} each</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Notes ────────────────────────────────────────── */}
      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Order Note</div>
            <p className="text-sm text-amber-800">{order.notes}</p>
          </div>
        </div>
      )}

      {/* ── Help CTA ─────────────────────────────────────── */}
      <div className="bg-[#0d0d0d] rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,#d4f000 1px,transparent 0)", backgroundSize: "24px 24px" }}
        />
        <div className="relative text-center sm:text-left">
          <div className="font-extrabold text-white text-sm">Need help with your order?</div>
          <div className="text-gray-500 text-xs mt-0.5">Our team is available 7 days a week.</div>
        </div>
        <div className="relative flex gap-2 shrink-0">
          <Link
            href="/support"
            className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-bold px-5 py-2.5 rounded-xl hover:bg-[#c4e000] transition-colors text-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
