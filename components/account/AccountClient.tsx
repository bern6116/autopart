"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAdminRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { DBOrder } from "@/types/database";

type AccountProfile={firstName:string;lastName:string;email:string;phone:string};

export default function AccountClient(){
  const router=useRouter(); const {user,profile,loading,error,refreshProfile,signOut}=useAuth();
  const [orders,setOrders]=useState<DBOrder[]>([]); const [ordersLoading,setOrdersLoading]=useState(true); const [ordersError,setOrdersError]=useState("");
  const [editing,setEditing]=useState(false); const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false); const [localError,setLocalError]=useState("");
  const [form,setForm]=useState<AccountProfile>({firstName:"",lastName:"",email:"",phone:""});

  useEffect(()=>{if(!profile)return;Promise.resolve().then(()=>setForm({firstName:profile.first_name??"",lastName:profile.last_name??"",email:profile.email??user?.email??"",phone:profile.phone??""}));},[profile,user]);
  useEffect(()=>{if(loading)return;if(!user){router.replace("/login?from=/account");return;}if(profile&&isAdminRole(profile.role)){router.replace("/admin/dashboard");return;}if(!profile||!profile.is_active){void Promise.resolve().then(()=>setOrdersLoading(false));return;}let active=true;void supabase.from("customers").select("id").eq("user_id",user.id).maybeSingle().then(async customer=>{if(!active)return;if(customer.error){setOrdersError(customer.error.message);setOrdersLoading(false);return;}if(!customer.data){setOrders([]);setOrdersLoading(false);return;}const result=await supabase.from("orders").select("*").eq("customer_id",customer.data.id).order("created_at",{ascending:false});if(!active)return;if(result.error)setOrdersError(result.error.message);else setOrders((result.data??[]) as DBOrder[]);setOrdersLoading(false);});return()=>{active=false;};},[loading,user,profile,router]);

  const save=async()=>{if(!user)return;setSaving(true);setLocalError("");const result=await supabase.from("profiles").update({first_name:form.firstName.trim(),last_name:form.lastName.trim(),phone:form.phone.trim()||null}).eq("id",user.id);setSaving(false);if(result.error){setLocalError(result.error.message);return;}await refreshProfile();setEditing(false);setSaved(true);window.setTimeout(()=>setSaved(false),2500);};
  const logout=async()=>{try{await signOut();router.replace("/login");router.refresh();}catch(e){setLocalError(e instanceof Error?e.message:"Unable to sign out.");}};

  if(loading)return <State text="Loading your account…"/>;
  if(!user)return <State text="Redirecting to sign in…"/>;
  if(error||!profile)return <State error text={error??"No profile is linked to this account."}/>;
  if(!profile.is_active)return <State error text="This account is inactive. Contact an administrator."/>;
  if(isAdminRole(profile.role))return <State text="Redirecting to the admin dashboard…"/>;
  const name=[profile.first_name,profile.last_name].filter(Boolean).join(" ")||profile.email;

  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">My Account</p><h1 className="text-3xl font-extrabold text-[#0d0d0d]">{name}</h1></div><div className="flex gap-2">{isAdminRole(profile.role)&&<Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-[#d4f000] px-4 py-2.5 text-sm font-bold"><LayoutDashboard size={15}/>Admin Dashboard</Link>}<button onClick={()=>void logout()} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold"><LogOut size={15}/>Sign out</button></div></div>
    {(localError||saved)&&<div className={`mb-4 flex items-center gap-2 rounded-xl border p-3 text-sm ${localError?"border-red-200 bg-red-50 text-red-700":"border-green-200 bg-green-50 text-green-700"}`}>{localError?<AlertCircle size={15}/>:<Check size={15}/>} {localError||"Profile saved."}</div>}
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl border border-gray-200 bg-white p-6"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-extrabold"><User size={18}/>Profile</h2><button onClick={()=>setEditing(v=>!v)} className="text-sm font-bold text-gray-500">{editing?"Cancel":"Edit"}</button></div><div className="space-y-4">{[["First name","firstName"],["Last name","lastName"],["Phone","phone"]].map(([label,key])=><label key={key} className="block text-xs font-bold uppercase tracking-wide text-gray-500">{label}<input disabled={!editing} value={form[key as keyof AccountProfile]} onChange={e=>setForm(v=>({...v,[key]:e.target.value}))} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm disabled:text-gray-600"/></label>)}<label className="block text-xs font-bold uppercase tracking-wide text-gray-500">Email<input disabled value={form.email} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"/></label>{editing&&<button disabled={saving} onClick={()=>void save()} className="w-full rounded-xl bg-[#0d0d0d] py-3 text-sm font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save profile"}</button>}</div></section>
      <section className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold"><Package size={18}/>My Orders</h2>{ordersLoading?<p className="text-sm text-gray-500">Loading orders…</p>:ordersError?<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Unable to load orders: {ordersError}</p>:orders.length===0?<div className="rounded-xl bg-gray-50 p-8 text-center"><Package className="mx-auto mb-3 text-gray-300" size={30}/><p className="font-bold">No orders yet</p><p className="mt-1 text-sm text-gray-500">Orders placed with this account will appear here.</p><Link href="/shop" className="mt-4 inline-block text-sm font-bold underline">Browse Honda parts</Link></div>:<div className="space-y-3">{orders.map(order=><article key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"><div><p className="font-bold">{order.order_number}</p><p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p></div><div className="text-right"><p className="font-extrabold">${Number(order.total).toFixed(2)}</p><p className="text-xs capitalize text-gray-500">{order.status}</p></div></article>)}</div>}</section>
    </div>
    <p className="mt-5 text-xs text-gray-500">Loyalty points and membership tiers are not currently supported and are intentionally not displayed.</p>
  </div>;
}

function State({text,error=false}:{text:string;error?:boolean}){return <div className="flex min-h-[60vh] items-center justify-center p-6"><p className={`rounded-xl p-4 text-sm ${error?"bg-red-50 text-red-700":"text-gray-500"}`}>{text}</p></div>}
