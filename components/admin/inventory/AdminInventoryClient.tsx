"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, SlidersHorizontal, AlertTriangle, X, Check } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase } from "@/lib/supabase";
import { adjustStock, createIdempotencyKey } from "@/lib/inventory-service";
import type { DBProduct, StockTxType } from "@/types/database";

type TxForm = { product_id:string; type:StockTxType; quantity:number; notes:string };
type Movement = { id:string; product_id:string; quantity_delta:number; stock_before:number; stock_after:number; reason:string; created_at:string };

const TX_TYPES: { value: StockTxType; label: string }[] = [
  { value:"stock_in",    label:"Stock In"     },
  { value:"stock_out",   label:"Stock Out"    },
  { value:"adjustment",  label:"Adjustment"   },
  { value:"damaged",     label:"Damaged"      },
  { value:"returned",    label:"Returned"     },
];

export default function AdminInventoryClient() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [txModal, setTxModal] = useState(false);
  const [tab, setTab] = useState<"stock"|"transactions">("stock");
  const [txForm, setTxForm] = useState<TxForm>({ product_id:"", type:"stock_in", quantity:1, notes:"" });
  const [saved, setSaved] = useState(false);

  const loadInventory = async (initial = false) => {
    if (!initial) setLoading(true);
    const [productResult, movementResult] = await Promise.all([
      supabase.rpc("admin_inventory_products"),
      supabase.from("stock_movements").select("id,product_id,quantity_delta,stock_before,stock_after,reason,created_at").order("created_at", { ascending:false }).limit(200),
    ]);
    setError(productResult.error?.message ?? "");
    if (!productResult.error) setProducts((productResult.data ?? []) as DBProduct[]);
    if (!movementResult.error) setMovements((movementResult.data ?? []) as Movement[]);
    setLoading(false);
  };

  useEffect(() => {
    void Promise.all([
      supabase.rpc("admin_inventory_products"),
      supabase.from("stock_movements").select("id,product_id,quantity_delta,stock_before,stock_after,reason,created_at").order("created_at", { ascending:false }).limit(200),
    ]).then(([productResult, movementResult]) => {
      setError(productResult.error?.message ?? "");
      if (!productResult.error) setProducts((productResult.data ?? []) as DBProduct[]);
      if (!movementResult.error) setMovements((movementResult.data ?? []) as Movement[]);
      setLoading(false);
    });
  }, []);

  const lowStock = products.filter(p => p.stock_quantity <= p.reorder_level && p.stock_quantity > 0).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;

  const handleTx = async () => {
    const qty = txForm.type === "stock_out" || txForm.type === "damaged" ? -txForm.quantity : txForm.quantity;
    setError("");
    try {
      await adjustStock({ productId:txForm.product_id, quantityDelta:qty, reason:txForm.notes, idempotencyKey:createIdempotencyKey("adjust") });
      await loadInventory();
      setSaved(true); setTimeout(() => { setSaved(false); setTxModal(false); }, 900);
    } catch (e) { setError(e instanceof Error ? e.message : "Stock adjustment failed"); }
  };

  const cols: Column[] = [
    { key:"name", label:"Product", sortable:true, render:(p) => (
      <div><div className="font-bold text-[#0d0d0d] text-sm">{p.name}</div><div className="text-[10px] text-gray-400 font-mono">{p.sku}</div></div>
    )},
    { key:"stock_quantity", label:"Current Stock", sortable:true, render:(p) => (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-extrabold ${p.stock_quantity===0?"text-red-600":p.stock_quantity<=p.reorder_level?"text-orange-500":"text-green-600"}`}>{p.stock_quantity}</span>
        {p.stock_quantity<=p.reorder_level && p.stock_quantity>0 && <AlertTriangle size={12} className="text-orange-400"/>}
      </div>
    )},
    { key:"reorder_level", label:"Reorder Level", render:(p) => <span className="text-sm text-gray-600">{p.reorder_level}</span> },
    { key:"status", label:"Status", render:(p) => <StatusBadge status={p.stock_quantity===0?"out_of_stock":p.status} /> },
    { key:"selling_price", label:"Value", render:(p) => <span className="font-bold text-[#0d0d0d]">${(p.selling_price*p.stock_quantity).toFixed(2)}</span> },
  ];

  const txCols: Column[] = [
    { key:"id", label:"ID", render:(r) => <span className="font-mono text-xs text-gray-500">{String(r.id).slice(0,6)}</span> },
    { key:"product_id", label:"Product", render:(r) => { const p = products.find(p=>p.id===r.product_id); return <div><div className="text-xs font-bold">{p?.name??String(r.product_id)}</div><div className="text-[10px] text-gray-400 font-mono">{p?.sku}</div></div>; } },
    { key:"quantity_delta", label:"Qty", render:(r) => <span className={`font-extrabold ${Number(r.quantity_delta)<0?"text-red-600":"text-green-600"}`}>{Number(r.quantity_delta)>0?"+":""}{String(r.quantity_delta)}</span> },
    { key:"stock_before", label:"Before", render:(r) => <span className="text-xs text-gray-500">{String(r.stock_before)}</span> },
    { key:"stock_after", label:"After", render:(r) => <span className="text-xs font-bold text-[#0d0d0d]">{String(r.stock_after)}</span> },
    { key:"reason", label:"Reason", render:(r) => <span className="text-xs text-gray-500">{String(r.reason)}</span> },
    { key:"created_at", label:"Date", render:(r) => <span className="text-xs text-gray-400">{new Date(String(r.created_at)).toLocaleDateString()}</span> },
  ];

  const inputCls = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-[#0d0d0d]">Inventory</h1><p className="text-sm text-gray-500">{products.length} products tracked</p></div>
        <button onClick={()=>setTxModal(true)} className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] text-sm">
          <SlidersHorizontal size={15}/>Stock Adjustment
        </button>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total SKUs",    value:String(products.length),    icon:SlidersHorizontal, cls:"bg-blue-50 text-blue-600" },
          { label:"Low Stock",     value:String(lowStock),           icon:AlertTriangle,     cls:"bg-orange-50 text-orange-600" },
          { label:"Out of Stock",  value:String(outOfStock),         icon:ArrowDown,         cls:"bg-red-50 text-red-600" },
          { label:"Inventory Value",value:`$${products.reduce((s,p)=>s+p.selling_price*p.stock_quantity,0).toLocaleString("en-US",{maximumFractionDigits:0})}`, icon:ArrowUp, cls:"bg-green-50 text-green-600" },
        ].map(({ label, value, icon:Icon, cls }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cls}`}><Icon size={14}/></div>
            </div>
            <div className="text-2xl font-extrabold text-[#0d0d0d]">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {(["stock","transactions"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab===t?"bg-[#0d0d0d] text-white":"text-gray-600 hover:text-[#0d0d0d]"}`}>
            {t==="stock"?"Stock Levels":"Transactions"}
          </button>
        ))}
      </div>
      <button onClick={()=>setLowOnly(v=>!v)} className={`text-xs font-bold px-3 py-2 rounded-xl border ${lowOnly?"bg-orange-50 border-orange-300 text-orange-700":"bg-white border-gray-200 text-gray-600"}`}>Low stock only</button>

      {tab==="stock" && (
        loading ? <div className="py-12 text-center text-sm text-gray-500">Loading inventory…</div> : <AdminTable data={lowOnly?products.filter(p=>p.stock_quantity<=p.reorder_level):products} columns={cols} searchKeys={["name","sku"]}
          actions={(row) => {
            const p = row as unknown as DBProduct;
            return (
              <button onClick={()=>{ setTxForm({product_id:p.id,type:"stock_in",quantity:1,notes:""}); setTxModal(true); }}
                className="text-xs font-bold bg-[#d4f000] text-[#0d0d0d] px-3 py-1.5 rounded-lg hover:bg-[#c4e000]">Adjust</button>
            );
          }}
        />
      )}
      {tab==="transactions" && (
        <AdminTable data={movements} columns={txCols} searchKeys={["reason"]} pageSize={8} />
      )}

      {/* Stock Adjustment Modal */}
      {txModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">Stock Transaction</h2>
              <button onClick={()=>setTxModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm"><Check size={14}/>Transaction saved!</div>}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Product</label>
                <select value={txForm.product_id} onChange={e=>setTxForm(f=>({...f,product_id:e.target.value}))} className={`${inputCls} appearance-none`}>
                  <option value="">Select product…</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Transaction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {TX_TYPES.map(t=>(
                    <button key={t.value} onClick={()=>setTxForm(f=>({...f,type:t.value}))}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${txForm.type===t.value?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Quantity</label>
                <input type="number" min={1} value={txForm.quantity} onChange={e=>setTxForm(f=>({...f,quantity:parseInt(e.target.value)||1}))} className={inputCls}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Notes</label>
                <textarea rows={2} value={txForm.notes} onChange={e=>setTxForm(f=>({...f,notes:e.target.value}))} className={`${inputCls} resize-none`} placeholder="Required reason…"/>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setTxModal(false)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleTx} disabled={!txForm.product_id || txForm.notes.trim().length<3} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm disabled:opacity-50">Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


