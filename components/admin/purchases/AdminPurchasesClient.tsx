/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Plus, Eye, Check, X, Truck } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminPurchaseOrders, adminSuppliers, adminProducts } from "@/lib/admin-data";
import type { DBPurchaseOrder, DBPurchaseItem, PurchaseStatus } from "@/types/database";

interface DraftLine { product_id: string; qty: number; cost: number; }

export default function AdminPurchasesClient() {
  const [orders, setOrders] = useState<DBPurchaseOrder[]>(adminPurchaseOrders);
  const [modal, setModal] = useState<"add"|"view"|"receive"|null>(null);
  const [selected, setSelected] = useState<DBPurchaseOrder | null>(null);
  const [lines, setLines] = useState<DraftLine[]>([{ product_id:"", qty:1, cost:0 }]);
  const [suppId, setSuppId] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const ic = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";

  const handleCreate = () => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.cost, 0);
    const tax = subtotal * 0.08;
    const newPO: DBPurchaseOrder = {
      id: `po${Date.now()}`, po_number: `PO-2024-00${orders.length + 1}`,
      supplier_id: suppId, status: "draft", order_date: new Date().toISOString().slice(0,10),
      expected_date: null, received_date: null, subtotal, tax, shipping: 0, total: subtotal + tax,
      notes: note, created_by: "staff1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setOrders(prev => [newPO, ...prev]);
    setSaved(true); setTimeout(() => { setSaved(false); setModal(null); setLines([{ product_id:"", qty:1, cost:0 }]); setSuppId(""); setNote(""); }, 1200);
  };

  const updateStatus = (id: string, status: PurchaseStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString(), ...(status === "received" ? { received_date: new Date().toISOString().slice(0,10) } : {}) } : o));
  };

  const cols: Column[] = [
    { key:"po_number", label:"PO Number", sortable:true, render:(o) => <span className="font-mono font-bold text-[#0d0d0d] text-sm">{o.po_number}</span> },
    { key:"supplier_id", label:"Supplier", render:(o) => <span className="text-sm text-gray-700">{adminSuppliers.find(s=>s.id===o.supplier_id)?.name ?? "—"}</span> },
    { key:"order_date", label:"Date", sortable:true, render:(o) => <span className="text-xs text-gray-500">{o.order_date}</span> },
    { key:"expected_date", label:"Expected", render:(o) => <span className="text-xs text-gray-500">{o.expected_date ?? "—"}</span> },
    { key:"total", label:"Total", sortable:true, render:(o) => <span className="font-extrabold text-[#0d0d0d]">${o.total.toFixed(2)}</span> },
    { key:"status", label:"Status", render:(o) => <StatusBadge status={o.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#0d0d0d]">Purchases</h1><p className="text-sm text-gray-500">{orders.length} purchase orders</p></div>
        <button onClick={() => setModal("add")} className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] text-sm"><Plus size={15}/>New PO</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(["draft","ordered","partial","received"] as PurchaseStatus[]).map(s => (
          <div key={s} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 capitalize">{s}</div>
            <div className="text-2xl font-extrabold text-[#0d0d0d]">{orders.filter(o=>o.status===s).length}</div>
          </div>
        ))}
      </div>

      <AdminTable data={orders} columns={cols} searchKeys={["po_number"]}
        actions={(row) => {
          const o = row as unknown as DBPurchaseOrder;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => { setSelected(o); setModal("view"); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye size={14}/></button>
              {(o.status === "ordered" || o.status === "partial") && (
                <button onClick={() => updateStatus(o.id, "received")}
                  className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100">
                  <Truck size={11}/>Receive
                </button>
              )}
              {o.status === "draft" && (
                <button onClick={() => updateStatus(o.id, "ordered")}
                  className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100">
                  <Check size={11}/>Place
                </button>
              )}
            </div>
          );
        }}
      />

      {/* Create PO Modal */}
      {modal === "add" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">Create Purchase Order</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-5">
              {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm"><Check size={14}/>PO Created!</div>}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Supplier *</label>
                <select value={suppId} onChange={e=>setSuppId(e.target.value)} className={`${ic} appearance-none`}>
                  <option value="">Select supplier…</option>
                  {adminSuppliers.filter(s=>s.status==="active").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Products</label>
                  <button onClick={() => setLines(prev => [...prev, { product_id:"", qty:1, cost:0 }])} className="text-xs font-bold text-[#0d0d0d] hover:text-gray-600 flex items-center gap-1"><Plus size={12}/>Add line</button>
                </div>
                <div className="space-y-2">
                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <select value={l.product_id} onChange={e=>{ const p=adminProducts.find(p=>p.id===e.target.value); setLines(prev=>prev.map((ln,idx)=>idx===i?{...ln,product_id:e.target.value,cost:p?.cost_price??0}:ln)); }} className={`${ic} appearance-none col-span-6`}>
                        <option value="">Select product…</option>
                        {adminProducts.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" min={1} value={l.qty} onChange={e=>setLines(prev=>prev.map((ln,idx)=>idx===i?{...ln,qty:parseInt(e.target.value)||1}:ln))} className={`${ic} col-span-2`} placeholder="Qty"/>
                      <input type="number" min={0} step="0.01" value={l.cost} onChange={e=>setLines(prev=>prev.map((ln,idx)=>idx===i?{...ln,cost:parseFloat(e.target.value)||0}:ln))} className={`${ic} col-span-3`} placeholder="Cost $"/>
                      <button onClick={()=>setLines(prev=>prev.filter((_,idx)=>idx!==i))} className="col-span-1 p-1.5 text-gray-400 hover:text-red-500"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right font-extrabold text-[#0d0d0d]">
                  Subtotal: ${lines.reduce((s,l)=>s+l.qty*l.cost,0).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Notes</label>
                <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} className={`${ic} resize-none`}/>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={!suppId || lines.every(l=>!l.product_id)} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm disabled:opacity-50">Create PO</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div><h2 className="font-extrabold text-[#0d0d0d]">{selected.po_number}</h2></div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[["Supplier", adminSuppliers.find(s=>s.id===selected.supplier_id)?.name ?? "—"], ["Status",""], ["Order Date",selected.order_date],["Expected",selected.expected_date??"-"],["Received",selected.received_date??"-"],["Subtotal",`$${selected.subtotal.toFixed(2)}`],["Tax",`$${selected.tax.toFixed(2)}`],["Total",`$${selected.total.toFixed(2)}`]].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  {k === "Status" ? <StatusBadge status={selected.status} /> : <span className="font-semibold text-[#0d0d0d]">{v}</span>}
                </div>
              ))}
              {selected.notes && <div className="bg-[#f9f9f9] rounded-xl p-3 text-xs text-gray-600">{selected.notes}</div>}
            </div>
            <div className="px-6 pb-5 flex gap-2">
              {selected.status === "draft" && <button onClick={() => { updateStatus(selected.id, "ordered"); setModal(null); }} className="flex-1 bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm">Place Order</button>}
              {(selected.status === "ordered"||selected.status === "partial") && <button onClick={() => { updateStatus(selected.id, "received"); setModal(null); }} className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm">Mark Received</button>}
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


