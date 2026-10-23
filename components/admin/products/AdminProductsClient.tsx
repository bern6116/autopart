"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, Package, X, Check, AlertCircle } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase } from "@/lib/supabase";
import type { DBBrand, DBCategory, DBProduct, DBSupplier, ProductStatus } from "@/types/database";
import HondaFitmentEditor from "@/components/admin/products/HondaFitmentEditor";
import { clearCatalogCache } from "@/lib/homeCatalog";

const EMPTY: Partial<DBProduct> = {
  name:"", sku:"", category_id:"", brand_id:"", supplier_id:"",
  short_description:"", description:"", cost_price:0, selling_price:0,
  discount_percent:0, stock_quantity:0, reorder_level:5, status:"active",
  is_featured:false, tags:[], specifications:{},
};

export default function AdminProductsClient() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories,setCategories]=useState<DBCategory[]>([]); const [brands,setBrands]=useState<DBBrand[]>([]); const [suppliers,setSuppliers]=useState<DBSupplier[]>([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [modal, setModal] = useState<"add"|"edit"|"view"|"delete"|null>(null);
  const [selected, setSelected] = useState<DBProduct | null>(null);
  const [form, setForm] = useState<Partial<DBProduct>>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProductStatus | "all">("all");

  const refreshProducts=async()=>{const result=await supabase.rpc("admin_inventory_products");if(result.error){setError(result.error.message);return false;}setProducts((result.data??[]) as DBProduct[]);return true;};

  useEffect(()=>{let active=true;void Promise.all([supabase.rpc("admin_inventory_products"),supabase.from("categories").select("*"),supabase.from("brands").select("*").order("name"),supabase.from("suppliers").select("*")]).then(([p,c,b,s])=>{if(!active)return;const queryError=p.error??c.error??b.error??s.error;if(queryError){setError(queryError.message);return;}setProducts((p.data??[]) as DBProduct[]);setCategories((c.data??[]) as DBCategory[]);setBrands((b.data??[]) as DBBrand[]);setSuppliers((s.data??[]) as DBSupplier[]);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);

  const filtered = filterStatus === "all" ? products : products.filter(p => p.status === filterStatus);

  const setF = (k: keyof DBProduct, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (p: DBProduct) => { setSelected(p); setForm({ ...p }); setModal("edit"); };
  const openView = (p: DBProduct) => { setSelected(p); setModal("view"); };
  const openDelete = (p: DBProduct) => { setSelected(p); setModal("delete"); };

  const handleSave = async () => {
    setError("");
    if (!form.brand_id) { setError("Select the product’s parts manufacturer before saving."); return; }
    const payload={...form,slug:(form.name??"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")};
    if (modal === "add") {
      const {error:e}=await supabase.from("products").insert(payload); if(e){setError(e.message);return;} await refreshProducts();
    } else if (modal === "edit" && selected) {
      const {error:e}=await supabase.from("products").update(payload).eq("id",selected.id); if(e){setError(e.message);return;} await refreshProducts();
    }
    clearCatalogCache();
    setSaved(true); setTimeout(() => { setSaved(false); setModal(null); }, 1200);
  };

  const handleDelete = async () => {
    if (selected) { const {error:e}=await supabase.from("products").update({status:"inactive"}).eq("id",selected.id); if(e){setError(e.message);return;} setProducts(prev=>prev.map(p=>p.id===selected.id?{...p,status:"inactive"}:p)); clearCatalogCache(); }
    setModal(null);
  };

  const columns: Column[] = [
    { key:"name",           label:"Product",      sortable:true, render:(p) => (
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0"><Package size={14} className="text-gray-400" /></div>
        <div>
          <div className="font-bold text-[#0d0d0d] text-sm truncate max-w-[200px]">{p.name}</div>
          <div className="text-[10px] text-gray-400 font-mono">{p.sku}</div>
        </div>
      </div>
    )},
    { key:"category_id",    label:"Category",     render:(p) => <span className="text-xs text-gray-600">{categories.find(c=>c.id===p.category_id)?.name ?? "—"}</span> },
    { key:"brand_id",       label:"Parts Brand", sortable:true, render:(p) => <span className="text-xs font-semibold text-gray-700">{brands.find(b=>b.id===p.brand_id)?.name??"—"}</span> },
    { key:"selling_price",  label:"Price",        sortable:true, render:(p) => <span className="font-bold text-[#0d0d0d] text-sm">${p.selling_price.toFixed(2)}</span> },
    { key:"stock_quantity", label:"Stock",        sortable:true, render:(p) => (
      <span className={`text-sm font-extrabold ${p.stock_quantity === 0 ? "text-red-600" : p.stock_quantity <= p.reorder_level ? "text-orange-500" : "text-green-600"}`}>
        {p.stock_quantity}
      </span>
    )},
    { key:"status", label:"Status", render:(p) => <StatusBadge status={p.status} /> },
  ];

  const inputCls = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";
  const lbl = (t: string) => <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{t}</label>;

  return (
    <div className="space-y-4">
      {/* Header */}
      {loading&&<div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">Loading products…</div>}
      {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d0d0d]">Products</h1>
          <p className="text-sm text-gray-500">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all","active","inactive","out_of_stock"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${filterStatus === s ? "bg-[#0d0d0d] text-white border-[#0d0d0d]" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
              {s === "all" ? "All" : s === "out_of_stock" ? "Out of Stock" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={openAdd}
            className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] transition-colors text-sm">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      <AdminTable
        data={filtered}
        columns={columns}
        searchKeys={["name","sku"]}
        actions={(row) => {
          const p = row as unknown as DBProduct;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => openView(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={14}/></button>
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#d4f000]/20 text-gray-400 hover:text-[#0d0d0d] transition-colors"><Edit2 size={14}/></button>
              <button onClick={() => openDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
            </div>
          );
        }}
      />

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d] text-lg">{modal === "add" ? "Add New Product" : "Edit Product"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm"><Check size={14}/>Saved!</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">{lbl("Product Name *")}<input value={form.name??""} onChange={e=>setF("name",e.target.value)} className={inputCls} placeholder="Product name"/></div>
                <div>{lbl("SKU *")}<input value={form.sku??""} onChange={e=>setF("sku",e.target.value)} className={inputCls} placeholder="BSH-BC905"/></div>
                <div>{lbl("Status")}<select value={form.status??""} onChange={e=>setF("status",e.target.value)} className={`${inputCls} appearance-none`}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="out_of_stock">Out of Stock</option>
                </select></div>
                <div>{lbl("Category")}<select value={form.category_id??""} onChange={e=>setF("category_id",e.target.value)} className={`${inputCls} appearance-none`}>
                  <option value="">Select…</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
                <div>{lbl("Parts Brand *")}<select required value={form.brand_id??""} onChange={e=>setF("brand_id",e.target.value)} className={`${inputCls} appearance-none`}>
                  <option value="">Select…</option>{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
                <div>{lbl("Supplier")}<select value={form.supplier_id??""} onChange={e=>setF("supplier_id",e.target.value)} className={`${inputCls} appearance-none`}>
                  <option value="">Select…</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select></div>
                <div>{lbl("Cost Price ($)")}<input type="number" value={form.cost_price??0} onChange={e=>setF("cost_price",parseFloat(e.target.value)||0)} className={inputCls}/></div>
                <div>{lbl("Selling Price ($)")}<input type="number" value={form.selling_price??0} onChange={e=>setF("selling_price",parseFloat(e.target.value)||0)} className={inputCls}/></div>
                <div>{lbl("Discount %")}<input type="number" value={form.discount_percent??0} onChange={e=>setF("discount_percent",parseInt(e.target.value)||0)} className={inputCls}/></div>
                <div>{lbl("Stock Quantity")}<input type="number" value={form.stock_quantity??0} onChange={e=>setF("stock_quantity",parseInt(e.target.value)||0)} className={inputCls}/></div>
                <div>{lbl("Reorder Level")}<input type="number" value={form.reorder_level??5} onChange={e=>setF("reorder_level",parseInt(e.target.value)||5)} className={inputCls}/></div>
                <div className="col-span-2">{lbl("Short Description")}<input value={form.short_description??""} onChange={e=>setF("short_description",e.target.value)} className={inputCls} placeholder="Brief description"/></div>
                <div className="col-span-2">{lbl("Full Description")}<textarea rows={3} value={form.description??""} onChange={e=>setF("description",e.target.value)} className={`${inputCls} resize-none`}/></div>
                <div className="col-span-2 flex items-center gap-3">
                  <button type="button" onClick={()=>setF("is_featured",!form.is_featured)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_featured?"bg-[#0d0d0d] border-[#0d0d0d]":"border-gray-300"}`}>
                    {form.is_featured && <Check size={11} color="white" strokeWidth={3}/>}
                  </button>
                  <span className="text-sm text-gray-600">Featured product</span>
                </div>
                {modal==="edit"&&selected&&<div className="col-span-2"><HondaFitmentEditor productId={selected.id}/></div>}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl hover:border-gray-400 text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl hover:bg-[#c4e000] text-sm">
                {modal === "add" ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">Product Details</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[["Name",selected.name],["SKU",selected.sku],["Price",`$${selected.selling_price}`],["Cost",`$${selected.cost_price}`],["Stock",String(selected.stock_quantity)],["Status",selected.status],["Description",selected.short_description]].map(([k,v])=>(
                <div key={k} className="flex justify-between gap-4"><span className="text-gray-500 font-medium">{k}</span><span className="font-bold text-[#0d0d0d] text-right">{v}</span></div>
              ))}
              <div className="pt-2"><div className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-2">Specifications</div>
                <div className="bg-[#f9f9f9] rounded-xl p-3 space-y-1">
                  {Object.entries(selected.specifications).map(([k,v])=>(<div key={k} className="flex justify-between text-xs"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button onClick={() => { setModal(null); openEdit(selected); }} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-bold py-2.5 rounded-xl text-sm hover:bg-[#c4e000]">Edit</button>
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle size={22} className="text-red-600"/></div>
            <h2 className="font-extrabold text-[#0d0d0d] text-center mb-1">Archive Product?</h2>
            <p className="text-sm text-gray-500 text-center mb-5">&ldquo;{selected.name}&rdquo; will be hidden without deleting inventory, orders, or cart references.</p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600">Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


