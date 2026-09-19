/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Tag } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminCategories } from "@/lib/admin-data";
import type { DBCategory } from "@/types/database";

export default function AdminCategoriesClient() {
  const [cats, setCats] = useState<DBCategory[]>(adminCategories);
  const [modal, setModal] = useState<"add"|"edit"|"delete"|null>(null);
  const [selected, setSelected] = useState<DBCategory | null>(null);
  const [form, setForm] = useState<Partial<DBCategory>>({});
  const [saved, setSaved] = useState(false);

  const inputCls = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";
  const lbl = (t: string) => <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{t}</label>;
  const sf = (k: keyof DBCategory, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm({ name:"", description:"", status:"active", product_count:0 }); setModal("add"); };
  const openEdit = (c: DBCategory) => { setSelected(c); setForm({ ...c }); setModal("edit"); };
  const openDelete = (c: DBCategory) => { setSelected(c); setModal("delete"); };

  const handleSave = () => {
    const slug = (form.name ?? "").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    if (modal === "add") setCats(p => [{ id:`cat${Date.now()}`, slug, image_url:null, parent_id:null, created_at:new Date().toISOString(), updated_at:new Date().toISOString(), ...form, product_count: Number(form.product_count)||0 } as DBCategory, ...p]);
    else if (modal === "edit" && selected) setCats(p => p.map(c => c.id === selected.id ? { ...c, ...form, slug, updated_at:new Date().toISOString() } as DBCategory : c));
    setSaved(true); setTimeout(() => { setSaved(false); setModal(null); }, 1200);
  };

  const cols: Column[] = [
    { key:"name", label:"Category", sortable:true, render:(c) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#d4f000]/10 rounded-xl flex items-center justify-center"><Tag size={14} className="text-[#0d0d0d]"/></div>
        <div><div className="font-bold text-[#0d0d0d] text-sm">{c.name}</div><div className="text-[10px] text-gray-400">/{c.slug}</div></div>
      </div>
    )},
    { key:"description", label:"Description", render:(c) => <span className="text-xs text-gray-600 truncate max-w-[200px] block">{c.description}</span> },
    { key:"product_count", label:"Products", sortable:true, render:(c) => <span className="font-bold text-[#0d0d0d]">{c.product_count.toLocaleString()}</span> },
    { key:"status", label:"Status", render:(c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#0d0d0d]">Categories</h1><p className="text-sm text-gray-500">{cats.length} categories</p></div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] text-sm"><Plus size={15}/>Add Category</button>
      </div>

      <AdminTable data={cats} columns={cols} searchKeys={["name","description"]}
        actions={(row) => {
          const c = row as unknown as DBCategory;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg hover:bg-[#d4f000]/20 text-gray-400 hover:text-[#0d0d0d]"><Edit2 size={14}/></button>
              <button onClick={()=>openDelete(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
            </div>
          );
        }}
      />

      {(modal==="add"||modal==="edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">{modal==="add"?"Add Category":"Edit Category"}</h2>
              <button onClick={()=>setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm"><Check size={14}/>Saved!</div>}
              <div>{lbl("Category Name *")}<input value={form.name??""} onChange={e=>sf("name",e.target.value)} className={inputCls} placeholder="Engine Parts"/></div>
              <div>{lbl("Description")}<textarea rows={2} value={form.description??""} onChange={e=>sf("description",e.target.value)} className={`${inputCls} resize-none`}/></div>
              <div>{lbl("Image URL")}<input value={form.image_url??""} onChange={e=>sf("image_url",e.target.value)} className={inputCls} placeholder="https://…"/></div>
              <div>{lbl("Status")}<select value={form.status??""} onChange={e=>sf("status",e.target.value)} className={`${inputCls} appearance-none`}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div>{lbl("Product Count")}<input type="number" value={form.product_count??0} onChange={e=>sf("product_count",parseInt(e.target.value)||0)} className={inputCls}/></div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {modal==="delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle size={22} className="text-red-600"/></div>
            <h2 className="font-extrabold text-center mb-1">Delete &ldquo;{selected.name}&rdquo;?</h2>
            <p className="text-sm text-gray-500 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={()=>setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={()=>{setCats(p=>p.filter(c=>c.id!==selected.id));setModal(null);}} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


