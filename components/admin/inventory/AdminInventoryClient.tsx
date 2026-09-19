/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, SlidersHorizontal, AlertTriangle, X, Check } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminProducts, inventoryTransactions } from "@/lib/admin-data";
import type { DBProduct, StockTxType } from "@/types/database";

type TxForm = { product_id:string; type:StockTxType; quantity:number; notes:string };

const TX_TYPES: { value: StockTxType; label: string }[] = [
  { value:"stock_in",    label:"Stock In"     },
  { value:"stock_out",   label:"Stock Out"    },
  { value:"adjustment",  label:"Adjustment"   },
  { value:"damaged",     label:"Damaged"      },
  { value:"returned",    label:"Returned"     },
];

const TX_COLORS: Record<string, string> = {
  stock_in:"text-green-600 bg-green-50", stock_out:"text-red-600 bg-red-50",
  sale:"text-blue-600 bg-blue-50", purchase:"text-indigo-600 bg-indigo-50",
  adjustment:"text-orange-600 bg-orange-50", damaged:"text-red-700 bg-red-100",
  returned:"text-purple-600 bg-purple-50",
};

export default function AdminInventoryClient() {
  const [products, setProducts] = useState<DBProduct[]>(adminProducts as DBProduct[]);
  const [txModal, setTxModal] = useState(false);
  const [tab, setTab] = useState<"stock"|"transactions">("stock");
  const [txForm, setTxForm] = useState<TxForm>({ product_id:"", type:"stock_in", quantity:1, notes:"" });
  const [saved, setSaved] = useState(false);

  const lowStock = products.filter(p => p.stock_quantity <= p.reorder_level && p.stock_quantity > 0).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;

  const handleTx = () => {
    const qty = txForm.type === "stock_out" || txForm.type === "damaged" ? -txForm.quantity : txForm.quantity;
    setProducts(prev => prev.map(p => p.id === txForm.product_id ? { ...p, stock_quantity: Math.max(0, p.stock_quantity + qty) } : p));
    setSaved(true); setTimeout(() => { setSaved(false); setTxModal(false); }, 1200);
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
    { key:"product_id", label:"Product", render:(r) => { const p = adminProducts.find(p=>p.id===r.product_id); return <div><div className="text-xs font-bold">{p?.name??String(r.product_id)}</div><div className="text-[10px] text-gray-400 font-mono">{p?.sku}</div></div>; } },
    { key:"type", label:"Type", render:(r) => <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${TX_COLORS[String(r.type)]??""}`}>{String(r.type).replace("_"," ")}</span> },
    { key:"quantity", label:"Qty", render:(r) => <span className={`font-extrabold ${Number(r.quantity)<0?"text-red-600":"text-green-600"}`}>{Number(r.quantity)>0?"+":""}{String(r.quantity)}</span> },
    { key:"previous_stock", label:"Before", render:(r) => <span className="text-xs text-gray-500">{String(r.previous_stock)}</span> },
    { key:"new_stock", label:"After", render:(r) => <span className="text-xs font-bold text-[#0d0d0d]">{String(r.new_stock)}</span> },
    { key:"notes", label:"Notes", render:(r) => <span className="text-xs text-gray-500">{String(r.notes)}</span> },
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

      {tab==="stock" && (
        <AdminTable data={products} columns={cols} searchKeys={["name","sku"]}
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
        <AdminTable data={inventoryTransactions} columns={txCols} searchKeys={["notes"]} pageSize={8} />
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
                  {adminProducts.map(p=><option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
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
                <textarea rows={2} value={txForm.notes} onChange={e=>setTxForm(f=>({...f,notes:e.target.value}))} className={`${inputCls} resize-none`} placeholder="Optional notes…"/>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setTxModal(false)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleTx} disabled={!txForm.product_id} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm disabled:opacity-50">Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


