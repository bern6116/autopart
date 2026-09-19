/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Eye, UserCheck, UserX, X } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminCustomers } from "@/lib/admin-data";
import type { DBCustomer } from "@/types/database";

export default function AdminCustomersClient() {
  const [customers, setCustomers] = useState<DBCustomer[]>(adminCustomers);
  const [selected, setSelected] = useState<DBCustomer | null>(null);
  const [modal, setModal] = useState(false);

  const toggle = (c: DBCustomer) => {
    setCustomers(prev => prev.map(cu => cu.id === c.id ? { ...cu, status: cu.status === "active" ? "suspended" : "active" } : cu));
  };

  const cols: Column[] = [
    { key:"first_name", label:"Customer", sortable:true, render:(c) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#d4f000] rounded-full flex items-center justify-center shrink-0">
          <span className="font-black text-[#0d0d0d] text-xs">{c.first_name[0]}{c.last_name[0]}</span>
        </div>
        <div>
          <div className="font-bold text-[#0d0d0d] text-sm">{c.first_name} {c.last_name}</div>
          <div className="text-[10px] text-gray-400">{c.email}</div>
        </div>
      </div>
    )},
    { key:"phone", label:"Phone", render:(c) => <span className="text-xs text-gray-600">{c.phone}</span> },
    { key:"total_orders", label:"Orders", sortable:true, render:(c) => <span className="font-extrabold text-[#0d0d0d]">{c.total_orders}</span> },
    { key:"total_spent",  label:"Spent",  sortable:true, render:(c) => <span className="font-extrabold text-[#0d0d0d]">${c.total_spent.toFixed(2)}</span> },
    { key:"last_order_date", label:"Last Order", render:(c) => <span className="text-xs text-gray-400">{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : "—"}</span> },
    { key:"status", label:"Status", render:(c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0d0d0d]">Customers</h1>
        <p className="text-sm text-gray-500">{customers.length} registered customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total",    value:customers.length,                              cls:"text-blue-600" },
          { label:"Active",   value:customers.filter(c=>c.status==="active").length, cls:"text-green-600" },
          { label:"Suspended",value:customers.filter(c=>c.status==="suspended").length, cls:"text-orange-600" },
          { label:"Revenue",  value:`$${customers.reduce((s,c)=>s+c.total_spent,0).toFixed(0)}`, cls:"text-purple-600" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-xl font-extrabold ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      <AdminTable
        data={customers}
        columns={cols}
        searchKeys={["first_name","last_name","email","phone"]}
        actions={(row) => {
          const c = row as unknown as DBCustomer;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => { setSelected(c); setModal(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Eye size={14}/></button>
              <button onClick={() => toggle(c)} className={`p-1.5 rounded-lg transition-colors ${c.status==="active"?"hover:bg-orange-50 text-gray-400 hover:text-orange-600":"hover:bg-green-50 text-gray-400 hover:text-green-600"}`}>
                {c.status === "active" ? <UserX size={14}/> : <UserCheck size={14}/>}
              </button>
            </div>
          );
        }}
      />

      {modal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">Customer Profile</h2>
              <button onClick={()=>setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-[#d4f000] rounded-full flex items-center justify-center">
                  <span className="font-black text-[#0d0d0d] text-lg">{selected.first_name[0]}{selected.last_name[0]}</span>
                </div>
                <div>
                  <div className="font-extrabold text-[#0d0d0d] text-lg">{selected.first_name} {selected.last_name}</div>
                  <div className="text-sm text-gray-400">{selected.email}</div>
                  <div className="mt-1"><StatusBadge status={selected.status} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["Phone",selected.phone],["Total Orders",String(selected.total_orders)],["Total Spent",`$${selected.total_spent.toFixed(2)}`],["Last Order",selected.last_order_date?new Date(selected.last_order_date).toLocaleDateString():"—"],["Member Since",new Date(selected.created_at).toLocaleDateString()]].map(([k,v])=>(
                  <div key={k} className="bg-[#f9f9f9] rounded-xl p-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{k}</div>
                    <div className="font-bold text-[#0d0d0d] mt-0.5 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-5">
              <button onClick={()=>setModal(false)} className="w-full border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm hover:border-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


