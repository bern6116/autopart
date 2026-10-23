"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, LoaderCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveVehicle, useVehicleSelection } from "@/lib/vehicle";

type Option = { id:string; name:string };
type Fitment = { engine:string|null; trim:string|null; year_from:number; year_to:number };

export default function VehicleFinderDialog({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const router=useRouter(); const dialogRef=useRef<HTMLDialogElement>(null);
  const [honda,setHonda]=useState<Option|null>(null); const [models,setModels]=useState<Option[]>([]); const [fitments,setFitments]=useState<Fitment[]>([]);
  const [model,setModel]=useState(""); const [year,setYear]=useState(""); const [engine,setEngine]=useState("");
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const { vehicle } = useVehicleSelection();

  useEffect(()=>{ const dialog=dialogRef.current; if(!dialog)return; if(open&&!dialog.open)dialog.showModal(); if(!open&&dialog.open)dialog.close(); },[open]);
  useEffect(()=>{ if(!open)return; void Promise.resolve().then(()=>{setLoading(true);setError("");return supabase.from("vehicle_makes").select("id,name").eq("name","Honda").maybeSingle();}).then(async({data,error:e})=>{ if(e||!data){setHonda(null);setModels([]);setError(e?.message??"Honda has no verified fitment records yet.");setLoading(false);return;} const make=data as Option; setHonda(make); const result=await supabase.from("vehicle_models").select("id,name").eq("make_id",make.id).order("name"); const options=(result.data??[]) as Option[];setModels(options);if(vehicle&&options.some(v=>v.id===vehicle.modelId)){setModel(vehicle.modelId);setYear(vehicle.year);setEngine(vehicle.engine??"");}setError(result.error?.message??"");setLoading(false); }); },[open,vehicle]);
  useEffect(()=>{ if(!honda||!model)return; void supabase.from("vehicle_compatibility").select("engine,trim,year_from,year_to").eq("make_id",honda.id).eq("model_id",model).then(({data,error:e})=>{setFitments((data??[]) as Fitment[]);setError(e?.message??"");}); },[honda,model]);

  const selectedModel=models.find(v=>v.id===model);
  const years=Array.from(new Set(fitments.flatMap(f=>Array.from({length:f.year_to-f.year_from+1},(_,i)=>f.year_to-i)))).sort((a,b)=>b-a);
  const engines=Array.from(new Set(fitments.filter(f=>!year||(Number(year)>=f.year_from&&Number(year)<=f.year_to)).map(f=>f.engine).filter(Boolean))) as string[];
  const confirmed=Boolean(honda&&model&&year&&fitments.some(f=>Number(year)>=f.year_from&&Number(year)<=f.year_to&&(!engine||f.engine===engine)));
  const submit=()=>{if(!honda||!selectedModel||!year)return; const p=new URLSearchParams({make:"Honda",model:selectedModel.name,year,makeId:honda.id,modelId:model}); if(engine)p.set("engine",engine); saveVehicle({make:"Honda",makeId:honda.id,model:selectedModel.name,modelId:model,year,engine:engine||undefined}); onClose(); router.push(`/shop?${p}`);};

  const selectClass="w-full rounded-xl border border-gray-200 bg-[#f4f4f4] px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] disabled:opacity-50";
  return <dialog ref={dialogRef} onCancel={(e)=>{e.preventDefault();onClose();}} onClose={onClose} aria-labelledby="vehicle-dialog-title" className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/60">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d0d0d]"><Car size={18} className="text-[#d4f000]"/></span><div><h2 id="vehicle-dialog-title" className="font-extrabold">Select your Honda</h2><p className="text-xs text-gray-500">Select your model and year to check compatibility.</p></div></div><button onClick={onClose} aria-label="Close vehicle finder" className="rounded-lg p-2 hover:bg-gray-100 focus:ring-2 focus:ring-[#d4f000]"><X size={18}/></button></div>
    <div className="space-y-4 p-5">
      {loading&&<p className="flex items-center gap-2 text-sm text-gray-500"><LoaderCircle className="animate-spin" size={16}/>Loading vehicles…</p>}
      {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Could not load fitment data: {error}</p>}
      {!loading&&!error&&models.length===0&&<p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">No verified Honda compatibility data is available yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-600">Make<div className={`${selectClass} font-extrabold text-[#0d0d0d]`}>Honda</div></div>
        <label className="text-xs font-bold uppercase tracking-wide text-gray-600">Model<select className={selectClass} value={model} disabled={!honda||loading} onChange={e=>setModel(e.target.value)}><option value="">Select model</option>{models.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
        <label className="text-xs font-bold uppercase tracking-wide text-gray-600">Year<select className={selectClass} value={year} disabled={!model} onChange={e=>{setYear(e.target.value);setEngine("");}}><option value="">Select year</option>{years.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        {engines.length>0&&<label className="text-xs font-bold uppercase tracking-wide text-gray-600">Engine / variant (optional)<select className={selectClass} value={engine} disabled={!year} onChange={e=>setEngine(e.target.value)}><option value="">Any verified variant</option>{engines.map(v=><option key={v} value={v}>{v}</option>)}</select></label>}
      </div>
      {model&&year&&<p className={`rounded-xl p-3 text-sm ${confirmed?"bg-green-50 text-green-700":"bg-amber-50 text-amber-800"}`}>{confirmed?"Confirmed compatibility data exists for this Honda.":"Compatibility is unknown. No matching verified fitment record was found."}</p>}
    </div>
    <div className="flex gap-3 border-t border-gray-100 px-5 py-4"><button onClick={()=>{setModel("");setYear("");setEngine("");saveVehicle(null);}} className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-bold">Clear</button><button onClick={submit} disabled={!confirmed} className="flex-1 rounded-xl bg-[#d4f000] px-5 py-2.5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-40">Show compatible parts</button></div>
  </dialog>;
}
