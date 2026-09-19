"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Minus, Trash2, ShoppingBag, Printer, X, Check } from "lucide-react";
import { adminProducts } from "@/lib/admin-data";
import type { DBProduct } from "@/types/database";

interface CartItem { product: DBProduct; qty: number; }
type PayMethod = "cash"|"card"|"online"|"cod";

const TAX_RATE = 0.08;

export default function AdminSalesClient() {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [tendered, setTendered] = useState(0);
  const [receipt, setReceipt] = useState<{ number: string; items: CartItem[]; total: number; method: string; change: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  const filtered = q
    ? adminProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()))
    : adminProducts.slice(0, 8);

  const addToCart = (p: DBProduct) => {
    setCart(prev => {
      const ex = prev.find(c => c.product.id === p.id);
      if (ex) return prev.map(c => c.product.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stock_quantity) } : c);
      return [...prev, { product: p, qty: 1 }];
    });
  };
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(c => c.product.id !== id));
    else setCart(prev => prev.map(c => c.product.id === id ? { ...c, qty } : c));
  };
  const subtotal = cart.reduce((s, c) => s + c.product.selling_price * c.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const taxAmt = (subtotal - discountAmt) * TAX_RATE;
  const total = subtotal - discountAmt + taxAmt;
  const change = method === "cash" ? Math.max(0, tendered - total) : 0;

  const completeSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    setReceipt({ number: `POS-${Date.now().toString().slice(-8)}`, items: [...cart], total, method, change });
    setCart([]); setDiscount(0); setTendered(0); setCustomer("Walk-in Customer");
    setProcessing(false);
  };

  return (
    <div className="space-y-4 h-full">
      <h1 className="text-2xl font-extrabold text-[#0d0d0d]">Sales / POS</h1>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left — Product search */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by product name or SKU…"
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]"/>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock_quantity === 0}
                className="bg-white border border-gray-200 rounded-2xl p-3 text-left hover:border-[#d4f000] hover:shadow-sm disabled:opacity-40 transition-all group">
                <div className="w-full aspect-square bg-[#f4f4f4] rounded-xl mb-2 flex items-center justify-center">
                  <ShoppingBag size={24} className="text-gray-300"/>
                </div>
                <div className="text-xs font-bold text-[#0d0d0d] line-clamp-2">{p.name}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{p.sku}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-extrabold text-[#0d0d0d] text-sm">${p.selling_price.toFixed(2)}</span>
                  <span className={`text-[10px] font-semibold ${p.stock_quantity <= 0 ? "text-red-500" : p.stock_quantity <= 5 ? "text-orange-500" : "text-green-600"}`}>
                    {p.stock_quantity <= 0 ? "Out" : `${p.stock_quantity} left`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Cart */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-[#0d0d0d]">
            <div className="text-white font-extrabold">Cart ({cart.length} items)</div>
            <input value={customer} onChange={e => setCustomer(e.target.value)}
              className="mt-2 w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d4f000]"
              placeholder="Customer name"/>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ShoppingBag size={32} className="mb-2 opacity-30"/>
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs mt-1">Search and click a product to add</p>
              </div>
            ) : cart.map(({ product: p, qty }) => (
              <div key={p.id} className="flex items-center gap-2 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#0d0d0d] truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400">${p.selling_price.toFixed(2)} each</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQty(p.id, qty - 1)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100"><Minus size={10}/></button>
                  <span className="w-6 text-center text-xs font-extrabold">{qty}</span>
                  <button onClick={() => setQty(p.id, qty + 1)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-green-100"><Plus size={10}/></button>
                </div>
                <span className="text-xs font-extrabold text-[#0d0d0d] w-14 text-right">${(p.selling_price * qty).toFixed(2)}</span>
                <button onClick={() => setCart(prev => prev.filter(c => c.product.id !== p.id))} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 px-5 py-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Discount %</span>
              <input type="number" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 text-right bg-[#f4f4f4] border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#d4f000]"/>
            </div>
            {discountAmt > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-bold">-${discountAmt.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Tax (8%)</span><span className="font-bold">${taxAmt.toFixed(2)}</span></div>
            <div className="flex justify-between font-extrabold text-[#0d0d0d] text-base border-t border-gray-100 pt-2 mt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>

            {/* Payment method */}
            <div className="pt-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment</div>
              <div className="grid grid-cols-4 gap-1">
                {(["cash","card","online","cod"] as PayMethod[]).map(m => (
                  <button key={m} onClick={() => setMethod(m)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border-2 uppercase transition-all ${method === m ? "bg-[#0d0d0d] text-white border-[#0d0d0d]" : "border-gray-200 text-gray-600"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {method === "cash" && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500">Tendered</span>
                <input type="number" value={tendered||""} onChange={e => setTendered(Number(e.target.value))}
                  className="w-24 text-right bg-[#f4f4f4] border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4f000]"
                  placeholder="0.00"/>
                {change > 0 && <span className="text-xs font-bold text-green-600">Change: ${change.toFixed(2)}</span>}
              </div>
            )}

            <button onClick={completeSale} disabled={cart.length === 0 || processing}
              className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] disabled:opacity-50 transition-colors mt-2 text-sm">
              {processing ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Processing…</> : <>Complete Sale · ${total.toFixed(2)}</>}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 pt-6 text-center border-b border-dashed border-gray-200 pb-5">
              <div className="w-14 h-14 bg-[#d4f000] rounded-full flex items-center justify-center mx-auto mb-3"><Check size={28} className="text-[#0d0d0d]" strokeWidth={3}/></div>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg">Sale Complete!</h2>
              <div className="font-mono text-sm text-gray-500 mt-1">{receipt.number}</div>
            </div>
            <div className="p-5 space-y-2 text-sm border-b border-dashed border-gray-200">
              {receipt.items.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between">
                  <span className="text-gray-700">{product.name} × {qty}</span>
                  <span className="font-bold">${(product.selling_price * qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-extrabold text-[#0d0d0d] pt-2 border-t border-gray-100">
                <span>Total</span><span>${receipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Payment</span><span className="uppercase">{receipt.method}</span>
              </div>
              {receipt.change > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Change</span><span>${receipt.change.toFixed(2)}</span></div>}
            </div>
            <div className="p-5 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm hover:border-gray-400"><Printer size={14}/>Print</button>
              <button onClick={() => setReceipt(null)} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm hover:bg-[#c4e000]">New Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
