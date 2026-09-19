/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Eye, Printer, X, ChevronRight } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminOrders } from "@/lib/admin-data";
import type { DBOrder, OrderStatus } from "@/types/database";

const ORDER_STATUSES: OrderStatus[] = ["pending","confirmed","processing","ready","shipped","delivered","cancelled","refunded"];

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<DBOrder[]>(adminOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<DBOrder | null>(null);
  const [modal, setModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");

  const displayed = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const openOrder = (o: DBOrder) => { setSelected(o); setNewStatus(o.status); setModal(true); };
  const updateStatus = () => {
    if (!selected) return;
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o));
    setModal(false);
  };

  const cols: Column[] = [
    { key:"order_number", label:"Order #",   sortable:true, render:(o)=><span className="font-mono text-xs font-bold text-[#0d0d0d]">{o.order_number}</span> },
    { key:"customer_name",label:"Customer",  sortable:true, render:(o)=>(
      <div><div className="font-bold text-[#0d0d0d] text-sm">{o.customer_name}</div><div className="text-[10px] text-gray-400">{o.customer_email}</div></div>
    )},
    { key:"payment_method",label:"Payment", render:(o)=><span className="text-xs font-semibold text-gray-600 capitalize">{o.payment_method.toUpperCase()}</span> },
    { key:"payment_status",label:"Payment Status", render:(o)=><StatusBadge status={o.payment_status} /> },
    { key:"total",         label:"Total",    sortable:true, render:(o)=><span className="font-extrabold text-[#0d0d0d]">${o.total.toFixed(2)}</span> },
    { key:"status",        label:"Status",   render:(o)=><StatusBadge status={o.status} /> },
    { key:"created_at",    label:"Date",     sortable:true, render:(o)=><span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-[#0d0d0d]">Orders</h1><p className="text-sm text-gray-500">{orders.length} total orders</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setFilter("all")} className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${filter==="all"?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"bg-white border-gray-200 text-gray-600"}`}>All</button>
          {ORDER_STATUSES.slice(0,5).map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${filter===s?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"bg-white border-gray-200 text-gray-600"} capitalize`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total Orders", value:orders.length, cls:"bg-blue-50 text-blue-600" },
          { label:"Pending",      value:orders.filter(o=>o.status==="pending").length, cls:"bg-yellow-50 text-yellow-700" },
          { label:"Shipped",      value:orders.filter(o=>o.status==="shipped").length, cls:"bg-cyan-50 text-cyan-700" },
          { label:"Revenue",      value:`$${orders.filter(o=>o.payment_status==="paid").reduce((s,o)=>s+o.total,0).toFixed(0)}`, cls:"bg-green-50 text-green-700" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-xl font-extrabold ${cls.split(" ")[1]}`}>{value}</div>
          </div>
        ))}
      </div>

      <AdminTable
        data={displayed}
        columns={cols}
        searchKeys={["order_number","customer_name","customer_email"]}
        actions={(row) => {
          const o = row as unknown as DBOrder;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={()=>openOrder(o)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye size={14}/></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Printer size={14}/></button>
            </div>
          );
        }}
      />

      {modal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-[#0d0d0d]">{selected.order_number}</h2>
                <p className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={()=>setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer */}
              <div className="bg-[#f9f9f9] rounded-xl p-4 space-y-1 text-sm">
                <div className="font-extrabold text-[#0d0d0d] mb-2">Customer Information</div>
                {[["Name",selected.customer_name],["Email",selected.customer_email],["Phone",selected.customer_phone]].map(([k,v])=>(
                  <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>
                ))}
              </div>
              {/* Payment */}
              <div className="bg-[#f9f9f9] rounded-xl p-4 space-y-1 text-sm">
                <div className="font-extrabold text-[#0d0d0d] mb-2">Payment</div>
                {[["Method",selected.payment_method.toUpperCase()],["Status",""],["Subtotal",`$${selected.subtotal.toFixed(2)}`],["Shipping",`$${selected.shipping.toFixed(2)}`],["Tax",`$${selected.tax.toFixed(2)}`],["Total",`$${selected.total.toFixed(2)}`]].map(([k,v])=>(
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    {k==="Status" ? <StatusBadge status={selected.payment_status} /> : <span className={`font-semibold ${k==="Total"?"text-lg font-extrabold":""}`}>{v}</span>}
                  </div>
                ))}
              </div>
              {/* Status update */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Update Status</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ORDER_STATUSES.map(s => (
                    <button key={s} onClick={()=>setNewStatus(s)}
                      className={`py-2 rounded-xl text-[11px] font-bold border-2 capitalize transition-all ${newStatus===s?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setModal(false)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={updateStatus} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5">
                Update Status <ChevronRight size={15}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


