"use client";
// ── useProductLookup ──────────────────────────────────────────
// Looks up a product from the existing adminProducts sample data
// (same data used by AdminProductsClient and AdminSalesClient).
// When real Supabase is configured it calls the database instead.

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { adminProducts, adminSuppliers, adminCategories } from "@/lib/admin-data";
import type { DBProduct } from "@/types/database";

export type LookupStatus = "idle" | "searching" | "found" | "not_found" | "error";

export interface ProductLookupResult {
  product: DBProduct;
  categoryName: string;
  brandName: string;
  supplierName: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

const BRAND_NAMES: Record<string, string> = {
  br1: "Bosch", br2: "K&N", br3: "Monroe", br4: "Denso",
  br5: "Brembo", br6: "ACDelco", br7: "NGK", br8: "Moog",
};

function resolveResult(p: DBProduct): ProductLookupResult {
  const cat = adminCategories.find((c) => c.id === p.category_id);
  const supplier = adminSuppliers.find((s) => s.id === p.supplier_id);
  const stockStatus: ProductLookupResult["stockStatus"] =
    p.stock_quantity === 0 || p.status === "out_of_stock"
      ? "out_of_stock"
      : p.stock_quantity <= p.reorder_level
      ? "low_stock"
      : "in_stock";
  return {
    product: p,
    categoryName: cat?.name ?? "Unknown",
    brandName: BRAND_NAMES[p.brand_id] ?? p.brand_id,
    supplierName: supplier?.name ?? "Unknown",
    stockStatus,
  };
}

export function useProductLookup() {
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [result, setResult] = useState<ProductLookupResult | null>(null);
  const [notFoundCode, setNotFoundCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // Local state mirror for stock changes (so UI reflects adjustments)
  const [localStock, setLocalStock] = useState<number | null>(null);

  const isSupabaseReal =
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref");

  const lookup = useCallback(
    async (code: string) => {
      const q = code.trim();
      if (!q) return;

      setStatus("searching");
      setResult(null);
      setNotFoundCode("");
      setErrorMsg("");
      setLocalStock(null);

      try {
        if (isSupabaseReal) {
          // ── Real Supabase query ─────────────────────────
          // Search: barcode field first, then SKU, then ID
          const { data, error } = await supabase
            .from("products")
            .select(`
              *,
              category:categories(name),
              brand:brands(name),
              supplier:suppliers(name)
            `)
            .or(`sku.eq.${q},id.eq.${q}`)
            .limit(1)
            .maybeSingle();

          if (error) throw error;

          if (!data) {
            setNotFoundCode(q);
            setStatus("not_found");
            return;
          }

          // Map Supabase row to DBProduct shape
          const p = data as DBProduct;
          const stockStatus: ProductLookupResult["stockStatus"] =
            p.stock_quantity === 0 || p.status === "out_of_stock"
              ? "out_of_stock"
              : p.stock_quantity <= p.reorder_level
              ? "low_stock"
              : "in_stock";

          setResult({
            product: p,
            categoryName: (data.category as { name: string } | null)?.name ?? "Unknown",
            brandName:    (data.brand    as { name: string } | null)?.name ?? "Unknown",
            supplierName: (data.supplier as { name: string } | null)?.name ?? "Unknown",
            stockStatus,
          });
          setStatus("found");
        } else {
          // ── Sample data fallback (dev / no credentials) ──
          const found = adminProducts.find(
            (p) =>
              p.sku.toLowerCase() === q.toLowerCase() ||
              p.id === q ||
              p.name.toLowerCase().includes(q.toLowerCase())
          );

          if (!found) {
            setNotFoundCode(q);
            setStatus("not_found");
            return;
          }

          setResult(resolveResult(found as DBProduct));
          setStatus("found");
        }
      } catch (err) {
        console.error("[ProductLookup] error:", err);
        setErrorMsg("Database error. Please try again.");
        setStatus("error");
      }
    },
    [isSupabaseReal]
  );

  // ── Optimistic stock update (after Add Stock / Stock Out) ─
  const adjustStock = useCallback(
    (delta: number) => {
      if (!result) return;
      const current = localStock ?? result.product.stock_quantity;
      const next = Math.max(0, current + delta);
      setLocalStock(next);
      // Re-evaluate stockStatus
      const stockStatus: ProductLookupResult["stockStatus"] =
        next === 0 ? "out_of_stock"
        : next <= result.product.reorder_level ? "low_stock"
        : "in_stock";
      setResult((prev) => prev ? { ...prev, stockStatus } : prev);
    },
    [result, localStock]
  );

  const currentStock =
    localStock !== null ? localStock : result?.product.stock_quantity ?? 0;

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setNotFoundCode("");
    setErrorMsg("");
    setLocalStock(null);
  }, []);

  return {
    status,
    result,
    notFoundCode,
    errorMsg,
    currentStock,
    lookup,
    adjustStock,
    reset,
  };
}
