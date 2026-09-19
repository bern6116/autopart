/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Plus, Edit2, UserX, UserCheck, X, Check } from "lucide-react";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminUsers } from "@/lib/admin-data";
import type { Profile, UserRole } from "@/types/database";

const ROLES: UserRole[] = ["super_admin","admin","manager","cashier","inventory_staff"];
const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:"Super Admin", admin:"Admin", manager:"Manager", cashier:"Cashier", inventory_staff:"Inventory Staff",
};
const ROLE_COLORS: Record<UserRole, string> = {
  super_admin:"bg-red-100 text-red-800", admin:"bg-purple-100 text-purple-800",
  manager:"bg-blue-100 text-blue-800", cashier:"bg-green-100 text-green-800",
  inventory_staff:"bg-orange-100 text-orange-800",
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<Profile[]>(adminUsers);
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saved, setSaved] = useState(false);

  const ic = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";
  const sf = (k: keyof Profile, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (modal === "add") setUsers(p => [{ id:`u${Date.now()}`, avatar_url:null, last_login:null, is_active:true, created_at:new Date().toISOString(), updated_at:new Date().toISOString(), role:"cashier", ...form } as Profile, ...p]);
    else if (modal === "edit" && selected) setUsers(p => p.map(u => u.id === selected.id ? { ...u, ...form } as Profile : u));
    setSaved(true); setTimeout(() => { setSaved(false); setModal(null); }, 1200);
  };

  const toggleActive = (u: Profile) => setUsers(prev => prev.map(us => us.id === u.id ? { ...us, is_active: !us.is_active } : us));

  const cols: Column[] = [
    { key:"first_name", label:"User", sortable:true, render:(u) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#d4f000] rounded-full flex items-center justify-center shrink-0">
          <span className="font-black text-[#0d0d0d] text-xs">{u.first_name[0]}{u.last_name[0]}</span>
        </div>
        <div>
          <div className="font-bold text-[#0d0d0d] text-sm">{u.first_name} {u.last_name}</div>
          <div className="text-[10px] text-gray-400">{u.email}</div>
        </div>
      </div>
    )},
    { key:"role", label:"Role", render:(u) => {
      const role = u.role as UserRole;
      return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</span>;
    }},
    { key:"phone", label:"Phone", render:(u) => <span className="text-xs text-gray-600">{u.phone ?? "—"}</span> },
    { key:"last_login", label:"Last Login", render:(u) => <span className="text-xs text-gray-400">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "—"}</span> },
    { key:"is_active", label:"Status", render:(u) => <StatusBadge status={u.is_active ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold text-[#0d0d0d]">Users & Staff</h1><p className="text-sm text-gray-500">{users.length} system users</p></div>
        <button onClick={() => { setForm({ role:"cashier", is_active:true }); setModal("add"); }}
          className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] text-sm"><Plus size={15}/>Add User</button>
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ROLES.map(r => (
          <div key={r} className={`rounded-xl px-3 py-2.5 text-center ${ROLE_COLORS[r]}`}>
            <div className="text-lg font-extrabold">{users.filter(u=>u.role===r).length}</div>
            <div className="text-[10px] font-bold">{ROLE_LABELS[r]}</div>
          </div>
        ))}
      </div>

      <AdminTable data={users} columns={cols} searchKeys={["first_name","last_name","email"]}
        actions={(row) => {
          const u = row as unknown as Profile;
          return (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => { setSelected(u); setForm({...u}); setModal("edit"); }} className="p-1.5 rounded-lg hover:bg-[#d4f000]/20 text-gray-400 hover:text-[#0d0d0d]"><Edit2 size={14}/></button>
              <button onClick={() => toggleActive(u)} className={`p-1.5 rounded-lg transition-colors ${u.is_active ? "hover:bg-orange-50 text-gray-400 hover:text-orange-600" : "hover:bg-green-50 text-gray-400 hover:text-green-600"}`}>
                {u.is_active ? <UserX size={14}/> : <UserCheck size={14}/>}
              </button>
            </div>
          );
        }}
      />

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d0d0d]">{modal === "add" ? "Add User" : "Edit User"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm"><Check size={14}/>Saved!</div>}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">First Name</label><input value={form.first_name??""} onChange={e=>sf("first_name",e.target.value)} className={ic}/></div>
                <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Last Name</label><input value={form.last_name??""} onChange={e=>sf("last_name",e.target.value)} className={ic}/></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email</label><input type="email" value={form.email??""} onChange={e=>sf("email",e.target.value)} className={ic}/></div>
              <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone</label><input value={form.phone??""} onChange={e=>sf("phone",e.target.value)} className={ic}/></div>
              {modal === "add" && <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Password</label><input type="password" placeholder="Temporary password" className={ic}/></div>}
              <div><label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Role</label>
                <select value={form.role??""} onChange={e=>sf("role",e.target.value as UserRole)} className={`${ic} appearance-none`}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => sf("is_active", !form.is_active)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${form.is_active ? "bg-[#0d0d0d]" : "bg-gray-200"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? "left-6" : "left-1"}`}/>
                </button>
                <span className="text-sm text-gray-600">Active Account</span>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm">Save User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


