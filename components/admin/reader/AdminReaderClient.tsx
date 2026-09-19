/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ScanLine, Camera, CameraOff, RotateCcw, Upload, Keyboard,
  Package, AlertTriangle, CheckCircle, XCircle, Search,
  Plus, Minus, ShoppingBag, Eye, History, Clock,
  RefreshCw, X, Check, AlertCircle, ChevronRight,
} from "lucide-react";
import { useBarcodeScanner } from "@/components/admin/reader/useBarcodeScanner";
import { useProductLookup } from "@/components/admin/reader/useProductLookup";
import type { DBProduct } from "@/types/database";

// ── Types ─────────────────────────────────────────────────────
interface ScanRecord {
  id: string;
  time: Date;
  code: string;
  scanType: "BARCODE" | "QR_CODE" | "MANUAL" | "IMAGE";
  productName: string;
  sku: string;
  brandName: string;
  stock: number;
  status: "found" | "not_found";
  action: "VIEW" | "ADD_TO_POS" | "STOCK_IN" | "STOCK_OUT" | "NONE";
  product: DBProduct | null;
}

interface StockDialog {
  open: boolean;
  type: "stock_in" | "stock_out";
  qty: number;
  notes: string;
  error: string;
  saving: boolean;
  saved: boolean;
}

const STOCK_DLG_INIT: StockDialog = {
  open: false, type: "stock_in", qty: 1, notes: "", error: "", saving: false, saved: false,
};

interface Toast { id: string; message: string; type: "success" | "error" | "info"; }

// ── scanline CSS animation injected once ──────────────────────
const SCANLINE_STYLE = `
@keyframes scanline {
  0%   { top: 10%; }
  50%  { top: 90%; }
  100% { top: 10%; }
}
.scanline { position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #d4f000, transparent);
  animation: scanline 2s ease-in-out infinite; }
`;

export default function AdminReaderClient() {
  // ── Inject animation style once ───────────────────────────
  useEffect(() => {
    const id = "scanner-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = SCANLINE_STYLE;
      document.head.appendChild(s);
    }
  }, []);

  // ── Manual search ─────────────────────────────────────────
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState("");
  const manualRef = useRef<HTMLInputElement>(null);

  // ── Stock dialog ──────────────────────────────────────────
  const [stockDlg, setStockDlg] = useState<StockDialog>(STOCK_DLG_INIT);

  // ── Toasts ────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `t-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Scan history (session only — 30 records max) ──────────
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const addHistory = useCallback((
    code: string,
    scanType: ScanRecord["scanType"],
    product: DBProduct | null,
    status: ScanRecord["status"],
    brandName = "",
    stock = 0,
    action: ScanRecord["action"] = "NONE"
  ) => {
    const rec: ScanRecord = {
      id: `sc-${Date.now()}`, time: new Date(), code, scanType,
      productName: product?.name ?? "Unknown", sku: product?.sku ?? code,
      brandName, stock: product?.stock_quantity ?? stock, status, action, product,
    };
    setHistory((prev) => [rec, ...prev].slice(0, 30));
  }, []);

  // ── Product lookup ────────────────────────────────────────
  const {
    status: lookupStatus, result, notFoundCode, errorMsg,
    currentStock, lookup, adjustStock, reset: resetLookup,
  } = useProductLookup();

  // ── Scanner: callback called when barcode is detected ─────
  const handleDetect = useCallback((code: string) => { lookup(code); }, [lookup]);
  const scanner = useBarcodeScanner(handleDetect);

  // Record to history when lookup resolves
  useEffect(() => {
    if (lookupStatus === "found" && result) {
      addHistory(
        result.product.sku, "BARCODE", result.product, "found",
        result.brandName, currentStock
      );
    }
    if (lookupStatus === "not_found" && notFoundCode) {
      addHistory(notFoundCode, "MANUAL", null, "not_found");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupStatus]);

  // ── Manual search submit ──────────────────────────────────
  const handleManualSearch = useCallback(() => {
    const q = manualInput.trim();
    if (!q) { setManualError("Please enter a barcode, SKU, or product ID."); return; }
    setManualError("");
    lookup(q);
  }, [manualInput, lookup]);

  // ── USB/Bluetooth physical scanner support ─────────────────
  // Physical scanners emit keystrokes + Enter. Capture when not in input.
  useEffect(() => {
    let buffer = "";
    let timer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "Enter" && buffer.length >= 3) {
        const code = buffer.trim(); buffer = ""; clearTimeout(timer);
        lookup(code); return;
      }
      if (e.key.length === 1) {
        buffer += e.key; clearTimeout(timer);
        timer = setTimeout(() => {
          if (buffer.length >= 3) { const code = buffer.trim(); buffer = ""; lookup(code); }
          else buffer = "";
        }, 100);
      }
    };
    window.addEventListener("keypress", onKey);
    return () => { window.removeEventListener("keypress", onKey); clearTimeout(timer); };
  }, [lookup]);

  // ── Keyboard shortcut: "/" focuses manual input ───────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); manualRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Image upload scan ─────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      if ("BarcodeDetector" in window) {
        const det = new (window as any).BarcodeDetector({
          formats: ["ean_13","ean_8","upc_a","code_128","code_39","qr_code"]
        });
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          const res = await det.detect(img);
          URL.revokeObjectURL(img.src);
          if (res.length > 0) { lookup(res[0].rawValue); }
          else addToast("No barcode found in the image.", "error");
        };
      } else {
        const { BrowserMultiFormatReader } = await import("@zxing/library");
        const url = URL.createObjectURL(file);
        const res = await new BrowserMultiFormatReader().decodeFromImageUrl(url);
        URL.revokeObjectURL(url);
        lookup(res.getText());
      }
    } catch { addToast("No barcode found in that image.", "error"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Add to POS ────────────────────────────────────────────
  const handleAddToPOS = useCallback(() => {
    if (!result) return;
    if (result.stockStatus === "out_of_stock") {
      addToast("Product is currently out of stock.", "error"); return;
    }
    addHistory(result.product.sku, "BARCODE", result.product, "found",
      result.brandName, currentStock, "ADD_TO_POS");
    addToast(`${result.product.name} — navigating to POS…`, "success");
    window.open(`/admin/sales?add=${encodeURIComponent(result.product.id)}`, "_blank");
  }, [result, currentStock, addHistory, addToast]);

  // ── Stock dialog helpers ──────────────────────────────────
  const openStock = (type: "stock_in" | "stock_out") =>
    setStockDlg({ ...STOCK_DLG_INIT, open: true, type });
  const closeStock = () => setStockDlg(STOCK_DLG_INIT);

  const submitStock = async () => {
    if (!result) return;
    const q = stockDlg.qty;
    if (!q || q <= 0) {
      setStockDlg((s) => ({ ...s, error: "Quantity must be greater than 0." })); return;
    }
    if (stockDlg.type === "stock_out" && q > currentStock) {
      setStockDlg((s) => ({ ...s, error: `Cannot exceed available stock (${currentStock}).` })); return;
    }
    setStockDlg((s) => ({ ...s, saving: true, error: "" }));
    await new Promise((r) => setTimeout(r, 600));
    const delta = stockDlg.type === "stock_out" ? -q : q;
    adjustStock(delta);
    addHistory(
      result.product.sku, "MANUAL", result.product, "found",
      result.brandName, currentStock + delta,
      stockDlg.type === "stock_in" ? "STOCK_IN" : "STOCK_OUT"
    );
    addToast(`${stockDlg.type === "stock_in" ? "Added" : "Removed"} ${q} units for ${result.product.name}.`, "success");
    setStockDlg((s) => ({ ...s, saving: false, saved: true }));
    setTimeout(closeStock, 900);
  };

  // ── UI helpers ────────────────────────────────────────────
  const stockBadge = (p: DBProduct, overrideQty?: number) => {
    const qty = overrideQty ?? p.stock_quantity;
    if (qty === 0 || p.status === "out_of_stock")
      return <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full">OUT OF STOCK</span>;
    if (qty <= p.reorder_level)
      return <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full">LOW STOCK</span>;
    return <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full">IN STOCK</span>;
  };

  const SCANNER_LABEL: Record<typeof scanner.status, string> = {
    idle:"Camera Off", requesting:"Starting…", ready:"Camera Ready",
    scanning:"Scanning…", detected:"Barcode Detected!", error:"Error",
    denied:"Permission Denied", unavailable:"Camera Unavailable",
  };
  const SCANNER_DOT: Record<typeof scanner.status, string> = {
    idle:"bg-gray-400", requesting:"bg-yellow-400 animate-pulse",
    ready:"bg-green-500", scanning:"bg-blue-500 animate-pulse",
    detected:"bg-[#d4f000] animate-pulse", error:"bg-red-500",
    denied:"bg-red-500", unavailable:"bg-orange-500",
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d0d0d] flex items-center gap-2">
            <ScanLine size={22} className="text-[#d4f000]" />
            Barcode &amp; QR Reader
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Scan automotive parts quickly to check inventory, manage stock, or add products to a sale.
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          <Keyboard size={11}/> Press <kbd className="bg-gray-100 rounded px-1 font-mono text-[10px]">/</kbd> for manual search
        </span>
      </div>

      {/* Toast stack */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs w-full">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold pointer-events-auto ${
            t.type === "success" ? "bg-green-500 text-white"
            : t.type === "error" ? "bg-red-500 text-white"
            : "bg-[#0d0d0d] text-white"
          }`}>
            {t.type === "success" ? <Check size={14}/> : t.type === "error" ? <XCircle size={14}/> : <AlertCircle size={14}/>}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="grid lg:grid-cols-2 gap-5 items-start">

        {/* ── LEFT: Scanner ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-[#0d0d0d]">Scan Auto Part</h2>
              <p className="text-xs text-gray-400">Position the barcode inside the scanning area.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${SCANNER_DOT[scanner.status]}`}/>
              <span className="text-xs font-bold text-gray-600">{SCANNER_LABEL[scanner.status]}</span>
            </div>
          </div>

          {/* Camera area */}
          <div className="relative bg-[#111] overflow-hidden" style={{ aspectRatio:"16/9" }}>
            <video ref={scanner.videoRef} muted playsInline
              className={`w-full h-full object-cover transition-opacity ${
                scanner.status === "scanning" || scanner.status === "detected" ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Scanning frame overlay */}
            {(scanner.status === "scanning" || scanner.status === "detected") && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative" style={{ width: 240, height: 130 }}>
                  {/* Corner brackets */}
                  {[
                    "top-0 left-0 border-t-[3px] border-l-[3px]",
                    "top-0 right-0 border-t-[3px] border-r-[3px]",
                    "bottom-0 left-0 border-b-[3px] border-l-[3px]",
                    "bottom-0 right-0 border-b-[3px] border-r-[3px]",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 ${cls} ${
                      scanner.status === "detected" ? "border-[#d4f000]" : "border-white"
                    } transition-colors duration-300`}/>
                  ))}
                  {/* Scan line */}
                  {scanner.status === "scanning" && <div className="scanline"/>}
                  {/* Detected badge */}
                  {scanner.status === "detected" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1.5 bg-[#d4f000] px-3 py-1.5 rounded-xl shadow-lg">
                        <CheckCircle size={14} className="text-[#0d0d0d]"/>
                        <span className="text-[#0d0d0d] font-extrabold text-xs">Detected!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Idle overlay */}
            {scanner.status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ScanLine size={40} className="text-gray-600"/>
                <p className="text-gray-500 text-sm">Camera is off</p>
              </div>
            )}
            {/* Requesting overlay */}
            {scanner.status === "requesting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <svg className="animate-spin h-8 w-8 text-[#d4f000]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-gray-400 text-sm">Requesting camera…</p>
              </div>
            )}
            {/* Error/denied overlay */}
            {(scanner.status === "denied" || scanner.status === "unavailable" || scanner.status === "error") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <CameraOff size={36} className="text-red-400"/>
                <div>
                  <p className="text-white font-extrabold text-sm">
                    {scanner.status === "denied" ? "Camera Access Required" : "Camera Unavailable"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 max-w-xs">{scanner.errorMessage}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={scanner.startScanner}
                    className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-bold px-4 py-2 rounded-xl text-xs">
                    <RefreshCw size={12}/>Try Again
                  </button>
                  <button onClick={() => manualRef.current?.focus()}
                    className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs">
                    <Keyboard size={12}/>Enter Manually
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {scanner.status === "idle" || scanner.status === "denied" ||
               scanner.status === "error" || scanner.status === "unavailable" ? (
                <button onClick={scanner.startScanner}
                  className="col-span-2 flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3 rounded-xl hover:bg-[#c4e000] transition-colors">
                  <Camera size={16}/>Start Scanner
                </button>
              ) : (
                <button onClick={scanner.stopScanner}
                  className="col-span-2 flex items-center justify-center gap-2 bg-[#0d0d0d] text-white font-extrabold py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">
                  <CameraOff size={16}/>Stop Scanner
                </button>
              )}
              <button onClick={scanner.switchCamera}
                className="flex items-center justify-center gap-1.5 bg-[#f4f4f4] text-[#0d0d0d] font-bold py-2.5 rounded-xl hover:bg-gray-200 text-sm transition-colors">
                <RotateCcw size={14}/>Switch Camera
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-1.5 bg-[#f4f4f4] text-[#0d0d0d] font-bold py-2.5 rounded-xl hover:bg-gray-200 text-sm transition-colors">
                <Upload size={14}/>Upload Image
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage}/>
            </div>

            {/* Last detected code */}
            {scanner.lastCode && (
              <div className="flex items-center gap-2 bg-[#d4f000]/10 border border-[#d4f000]/30 rounded-xl px-3 py-2">
                <CheckCircle size={13} className="text-[#0d0d0d] shrink-0"/>
                <span className="text-xs font-bold text-[#0d0d0d]">Last scan:</span>
                <span className="text-xs font-mono font-extrabold text-[#0d0d0d] flex-1 truncate">{scanner.lastCode}</span>
                <button onClick={() => { scanner.resetDetected(); resetLookup(); }}
                  className="text-gray-400 hover:text-gray-600 shrink-0"><X size={12}/></button>
              </div>
            )}

            {/* Format tags */}
            <div className="flex flex-wrap gap-1">
              {["EAN-13","EAN-8","UPC-A","UPC-E","Code 128","Code 39","QR Code"].map((f) => (
                <span key={f} className="text-[9px] font-bold bg-[#f4f4f4] text-gray-400 px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
          </div>

          {/* Manual search */}
          <div className="px-4 pb-5 border-t border-gray-100 pt-4">
            <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-2">
              Search by Barcode or SKU
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input ref={manualRef} type="text" value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value); setManualError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  placeholder="Enter barcode, SKU, or product ID…"
                  className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] transition"/>
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                {manualInput && (
                  <button onClick={() => { setManualInput(""); setManualError(""); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={12}/></button>
                )}
              </div>
              <button onClick={handleManualSearch} disabled={lookupStatus === "searching"}
                className="bg-[#0d0d0d] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a1a1a] disabled:opacity-50 text-sm shrink-0 transition-colors">
                Search
              </button>
            </div>
            {manualError && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={11}/>{manualError}
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1.5">
              Try:&nbsp;
              {["BSH-BC905","KN-33-2304","BRM-09A90011","NGK-6619"].map((sku, i) => (
                <span key={sku}>
                  {i > 0 && " · "}
                  <button onClick={() => { setManualInput(sku); }}
                    className="underline hover:text-gray-600 font-mono">{sku}</button>
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* ── RIGHT: Product result ───────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Searching skeleton */}
          {lookupStatus === "searching" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-3">
              <svg className="animate-spin h-9 w-9 text-[#d4f000]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <p className="text-gray-500 text-sm font-semibold">Finding Product…</p>
            </div>
          )}

          {/* Error state */}
          {lookupStatus === "error" && (
            <div className="bg-white rounded-2xl border border-red-200 p-5 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5"/>
              <div>
                <p className="font-extrabold text-red-700">Database Error</p>
                <p className="text-sm text-red-500 mt-0.5">{errorMsg}</p>
                <button onClick={resetLookup} className="text-xs text-red-400 underline mt-2">Dismiss</button>
              </div>
            </div>
          )}

          {/* Not found */}
          {lookupStatus === "not_found" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle size={26} className="text-red-500"/>
              </div>
              <h3 className="font-extrabold text-[#0d0d0d] text-lg">Product Not Found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Barcode: <span className="font-mono font-bold text-[#0d0d0d]">{notFoundCode}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-6">
                This barcode is not registered in your Auto Core product catalog.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={resetLookup}
                  className="flex items-center gap-1.5 border-2 border-gray-200 font-bold px-4 py-2 rounded-xl text-sm hover:border-[#0d0d0d] transition-colors">
                  <RefreshCw size={13}/>Try Again
                </button>
                <button onClick={() => { resetLookup(); setManualInput(""); manualRef.current?.focus(); }}
                  className="flex items-center gap-1.5 border-2 border-gray-200 font-bold px-4 py-2 rounded-xl text-sm hover:border-[#0d0d0d] transition-colors">
                  <Search size={13}/>Search by SKU
                </button>
                <Link href="/admin/products"
                  className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#c4e000] transition-colors">
                  <Plus size={13}/>Create New Product
                </Link>
              </div>
            </div>
          )}

          {/* Idle empty state */}
          {lookupStatus === "idle" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center gap-3 min-h-72">
              <div className="w-16 h-16 bg-[#f4f4f4] rounded-2xl flex items-center justify-center">
                <ScanLine size={28} className="text-gray-300"/>
              </div>
              <div>
                <p className="font-extrabold text-[#0d0d0d]">Ready to Scan</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Scan a barcode or enter a SKU to view product information, manage stock, or add to a sale.
                </p>
              </div>
            </div>
          )}

          {/* Product found card */}
          {lookupStatus === "found" && result && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Card header */}
              <div className="bg-[#0d0d0d] px-5 py-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-[#d4f000]"/>
                <span className="text-white font-extrabold text-sm">Product Found</span>
                <button onClick={resetLookup} className="ml-auto text-gray-500 hover:text-white transition-colors">
                  <X size={15}/>
                </button>
              </div>

              <div className="p-5">
                {/* Product identity */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 bg-[#f4f4f4] rounded-xl flex items-center justify-center shrink-0">
                    <Package size={22} className="text-gray-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{result.brandName}</p>
                    <h3 className="font-extrabold text-[#0d0d0d] leading-snug">{result.product.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {stockBadge(result.product, currentStock)}
                    </div>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ["SKU",           result.product.sku],
                    ["Category",      result.categoryName],
                    ["Supplier",      result.supplierName],
                    ["Selling Price", `$${result.product.selling_price.toFixed(2)}`],
                    ["Cost Price",    `$${result.product.cost_price.toFixed(2)}`],
                    ["Reorder Level", String(result.product.reorder_level)],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#f9f9f9] rounded-xl px-3 py-2.5">
                      <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">{k}</div>
                      <div className="font-bold text-[#0d0d0d] mt-0.5 text-sm truncate">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Stock highlight banner */}
                <div className={`rounded-xl px-4 py-3 flex items-center justify-between mb-4 ${
                  result.stockStatus === "out_of_stock"
                    ? "bg-red-50 border border-red-200"
                    : result.stockStatus === "low_stock"
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-green-50 border border-green-200"
                }`}>
                  <div>
                    <div className={`text-[10px] font-extrabold uppercase tracking-widest ${
                      result.stockStatus === "out_of_stock" ? "text-red-600"
                      : result.stockStatus === "low_stock" ? "text-orange-600"
                      : "text-green-600"
                    }`}>
                      {result.stockStatus === "out_of_stock" ? "OUT OF STOCK"
                       : result.stockStatus === "low_stock" ? "LOW STOCK"
                       : "IN STOCK"}
                    </div>
                    <div className={`text-2xl font-black ${
                      result.stockStatus === "out_of_stock" ? "text-red-700"
                      : result.stockStatus === "low_stock" ? "text-orange-700"
                      : "text-green-700"
                    }`}>
                      {currentStock}&nbsp;
                      <span className="text-base font-semibold">units available</span>
                    </div>
                  </div>
                  {result.stockStatus === "out_of_stock" && <XCircle size={22} className="text-red-500"/>}
                  {result.stockStatus === "low_stock"    && <AlertTriangle size={22} className="text-orange-500"/>}
                  {result.stockStatus === "in_stock"     && <CheckCircle size={22} className="text-green-500"/>}
                </div>

                {/* Spec pills */}
                {Object.keys(result.product.specifications).length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Specifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(result.product.specifications).map(([k, v]) => (
                        <span key={k} className="bg-[#f4f4f4] text-xs text-gray-600 px-2 py-1 rounded-lg">
                          <span className="font-semibold">{k}:</span> {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/admin/products"
                    className="flex items-center justify-center gap-1.5 bg-[#f4f4f4] text-[#0d0d0d] font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200 transition-colors">
                    <Eye size={13}/>View Product
                  </Link>
                  <Link href="/admin/products"
                    className="flex items-center justify-center gap-1.5 bg-[#f4f4f4] text-[#0d0d0d] font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200 transition-colors">
                    <ChevronRight size={13}/>Edit Product
                  </Link>
                  <button onClick={() => openStock("stock_in")}
                    className="flex items-center justify-center gap-1.5 bg-green-500 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-green-600 transition-colors">
                    <Plus size={13}/>Add Stock
                  </button>
                  <button onClick={() => openStock("stock_out")}
                    disabled={result.stockStatus === "out_of_stock"}
                    className="flex items-center justify-center gap-1.5 bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-orange-600 disabled:opacity-40 transition-colors">
                    <Minus size={13}/>Stock Out
                  </button>
                  <button onClick={handleAddToPOS}
                    disabled={result.stockStatus === "out_of_stock"}
                    className="col-span-2 flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3 rounded-xl text-sm hover:bg-[#c4e000] disabled:opacity-40 transition-colors">
                    <ShoppingBag size={15}/>
                    {result.stockStatus === "out_of_stock"
                      ? "Out of Stock — Cannot Add to POS"
                      : "Add to POS"}
                  </button>
                  <Link href="/admin/inventory"
                    className="col-span-2 flex items-center justify-center gap-1.5 bg-[#f4f4f4] text-[#0d0d0d] font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200 transition-colors">
                    <History size={13}/>Inventory History
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Scan History ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-gray-500"/>
            <h2 className="font-extrabold text-[#0d0d0d]">Recent Scans</h2>
            {history.length > 0 && (
              <span className="bg-[#f4f4f4] text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{history.length}</span>
            )}
          </div>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors">
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center">
            <ScanLine size={28} className="text-gray-200 mx-auto mb-2"/>
            <p className="text-sm text-gray-400">No scans yet. Start scanning to see history here.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f9f9f9] border-b border-gray-100">
                    {["Time","Product","SKU","Code","Brand","Stock","Type","Status","Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((r) => (
                    <tr key={r.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {r.time.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#0d0d0d] text-xs max-w-[160px] truncate">
                        {r.productName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.sku}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate">{r.code}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.brandName || "—"}</td>
                      <td className="px-4 py-3 text-xs font-bold text-[#0d0d0d]">{r.stock}</td>
                      <td className="px-4 py-3">
                        <span className="bg-[#f4f4f4] text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">{r.scanType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === "found" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {r.status === "found" ? "Found" : "Not Found"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {r.product && (
                            <button onClick={() => lookup(r.product!.sku)}
                              className="text-[10px] font-bold bg-[#f4f4f4] hover:bg-[#d4f000]/20 text-gray-600 px-2 py-1 rounded-lg transition-colors">
                              View
                            </button>
                          )}
                          <button onClick={() => lookup(r.code)}
                            className="text-[10px] font-bold bg-[#f4f4f4] hover:bg-[#d4f000]/20 text-gray-600 px-2 py-1 rounded-lg transition-colors">
                            Rescan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {history.map((r) => (
                <div key={r.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#0d0d0d] text-sm leading-tight">{r.productName}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.sku}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      r.status === "found" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {r.status === "found" ? "Found" : "Not Found"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span><Clock size={10} className="inline mr-1"/>{r.time.toLocaleTimeString()}</span>
                    <span>Stock: <strong>{r.stock}</strong></span>
                    <span className="bg-[#f4f4f4] px-1.5 py-0.5 rounded font-bold">{r.scanType}</span>
                  </div>
                  <button onClick={() => lookup(r.code)}
                    className="text-xs font-bold bg-[#f4f4f4] hover:bg-[#d4f000]/20 text-[#0d0d0d] px-3 py-1.5 rounded-lg transition-colors">
                    Rescan
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Stock Adjustment Dialog ──────────────────────── */}
      {stockDlg.open && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">
                {stockDlg.type === "stock_in" ? "Add Stock" : "Stock Out"}
              </h2>
              <button onClick={closeStock} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {stockDlg.saved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm">
                  <Check size={14}/>Transaction recorded!
                </div>
              )}
              {stockDlg.error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">
                  <AlertCircle size={14}/>{stockDlg.error}
                </div>
              )}
              <div className="bg-[#f9f9f9] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 font-semibold">{result.product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Current stock: <strong className="text-[#0d0d0d]">{currentStock}</strong> units
                </p>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">
                  Quantity *
                </label>
                <input type="number" min={1}
                  max={stockDlg.type === "stock_out" ? currentStock : 9999}
                  value={stockDlg.qty}
                  onChange={(e) => setStockDlg((s) => ({ ...s, qty: parseInt(e.target.value) || 0, error: "" }))}
                  className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]"/>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1.5">
                  Notes / Reason
                </label>
                <textarea rows={2} value={stockDlg.notes}
                  onChange={(e) => setStockDlg((s) => ({ ...s, notes: e.target.value }))}
                  placeholder={stockDlg.type === "stock_out" ? "Reason for stock removal…" : "Notes about this stock addition…"}
                  className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#d4f000]"/>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={closeStock}
                className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm hover:border-gray-400 transition-colors">
                Cancel
              </button>
              <button onClick={submitStock} disabled={stockDlg.saving || stockDlg.saved}
                className={`flex-1 flex items-center justify-center gap-2 font-extrabold py-2.5 rounded-xl text-sm transition-colors ${
                  stockDlg.type === "stock_in"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                } disabled:opacity-60`}>
                {stockDlg.saving ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>Saving…</>
                ) : stockDlg.type === "stock_in" ? (
                  <><Plus size={15}/>Add {stockDlg.qty || 0} Units</>
                ) : (
                  <><Minus size={15}/>Remove {stockDlg.qty || 0} Units</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
