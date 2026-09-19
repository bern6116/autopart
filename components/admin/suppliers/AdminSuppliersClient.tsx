/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Building2 } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminSuppliers } from "@/lib/admin-data";
import type { DBSupplier } from "@/types/database";

export default function AdminSuppliersClient() {
  const [suppliers, setSuppliers] = useState<DBSupplier[]>(adminSuppliers);
  const [modal, setModal] = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<DBSupplier | null>(null);
  const [form, setForm] = useState<Partial<DBSupplier>>({});
  const [saved, setSaved] = useState(false);

  const EMPTY: Partial<DBSupplier> = { name:"", contact_person:"", email:"", phone:"", address:"", city:"", country:"USA", status:"active", notes:"" };
  const ic = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";
  const lbl = (t: string) => <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{t}</label>;
  const sf = (k: keyof DBSupplier, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (modal === "add") setSuppliers(p => [{ ...EMPTY, ...form, id:`s${Date.now()}`, created_at:new Date().toISOString(), updated_at:new Date().toISOString() } as DBSupplier, ...p]);
    else if (modal === "edit" && selected) setSuppliers(p => p.map(s => s.id === selected.id ? { ...s, ...form } as DBSupplier : s));
    setSaved(true); setTimeout(() => { setSaved(false); setModal(null); }, 1200);
  };

  const cols: Column[] = [
    { key:"name", label:"Supplier", sortable:true, render:(s) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><Building2 size={14} className="text-blue-600"/></div>
        <div><div className="font-bold text-[#0d0d0d] text-sm">{s.name}</div><div className="text-[10px] text-gray-400">{s.contact_person}</div></div>
      </div>
    )},
    { key:"email", label:"Contact", render:(s) => (
      <div><div className="text-xs text-gray-700">{s.email}</div><div className="text-[10px] text-gray-400">{s.phone}</div></div>
    )},
    { key:"city", label:"Location", render:(s) => <span className="text-xs text-gray-600">{s.city}, {s.country}</span> },
    { key:"status", label:"Status", render:(s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#0d0d0d]">Suppliers</h1><p className="text-sm text-gray-500">{suppliers.length} suppliers</p></div>
        <button onClick={() => { setForm(EMPTY); setModal("add"); }} className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] text-sm"><Plus size={15}/>Add Supplier</button>
      </div>

      <AdminTable data={suppliers} columns={cols} searchKeys={["name","contact_person","email","city"]}
        actions={(row) => {
          const s = row as unknown as DBSupplier;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => { setSelected(s); setForm({...s}); setModal("edit"); }} className="p-1.5 rounded-lg hover:bg-[#d4f000]/20 text-gray-400 hover:text-[#0d0d0d]"><Edit2 size={14}/></button>
              <button onClick={() => { setSelected(s); setModal("delete"); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
            </div>
          );
        }}
      />

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">{modal === "add" ? "Add Supplier" : "Edit Supplier"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm"><Check size={14}/>Saved!</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">{lbl("Company Name *")}<input value={form.name??""} onChange={e=>sf("name",e.target.value)} className={ic} placeholder="Company name"/></div>
                <div>{lbl("Contact Person")}<input value={form.contact_person??""} onChange={e=>sf("contact_person",e.target.value)} className={ic}/></div>
                <div>{lbl("Email")}<input type="email" value={form.email??""} onChange={e=>sf("email",e.target.value)} className={ic}/></div>
                <div>{lbl("Phone")}<input value={form.phone??""} onChange={e=>sf("phone",e.target.value)} className={ic}/></div>
                <div>{lbl("Status")}<select value={form.status??""} onChange={e=>sf("status",e.target.value)} className={`${ic} appearance-none`}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                <div className="col-span-2">{lbl("Address")}<input value={form.address??""} onChange={e=>sf("address",e.target.value)} className={ic}/></div>
                <div>{lbl("City")}<input value={form.city??""} onChange={e=>sf("city",e.target.value)} className={ic}/></div>
                <div>{lbl("Country")}<input value={form.country??""} onChange={e=>sf("country",e.target.value)} className={ic}/></div>
                <div className="col-span-2">{lbl("Notes")}<textarea rows={2} value={form.notes??""} onChange={e=>sf("notes",e.target.value)} className={`${ic} resize-none`}/></div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle size={22} className="text-red-600"/></div>
            <h2 className="font-extrabold text-center mb-1">Delete &ldquo;{selected.name}&rdquo;?</h2>
            <p className="text-sm text-gray-500 text-center mb-5">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={() => { setSuppliers(p => p.filter(s => s.id !== selected.id)); setModal(null); }} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


