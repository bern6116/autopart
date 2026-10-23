"use client";
import { useState } from "react";
import { Car, ChevronRight, X } from "lucide-react";
import VehicleFinderDialog from "@/components/sections/VehicleFinderDialog";

import { useVehicleSelection } from "@/lib/vehicle";

export default function VehicleFinder(){
  const [open,setOpen]=useState(false); const {vehicle,clearVehicle}=useVehicleSelection();
  return <section className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
    <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"><Car size={18} strokeWidth={1.8} className="text-[#0d0d0d]"/></span><div className="min-w-0"><h2 className="text-base font-extrabold text-[#0d0d0d] sm:text-lg">Your vehicle</h2><p className="text-sm text-gray-500">{vehicle?"Use the Shop results to confirm recorded fitment.":"Choose your vehicle to check compatibility."}</p></div></div>
    {vehicle?<div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"><strong className="text-[#0d0d0d]">{vehicle.year} {vehicle.make} {vehicle.model}{vehicle.engine?` · ${vehicle.engine}`:""}</strong><button onClick={()=>setOpen(true)} className="font-bold text-[#0d0d0d] underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[#d4f000]">Change</button><button onClick={clearVehicle} aria-label="Clear selected vehicle" className="inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#d4f000]"><X size={13}/>Clear</button></div>:<button onClick={()=>setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#d4f000] px-5 py-2.5 text-sm font-extrabold text-[#0d0d0d] hover:bg-[#c4e000] focus:outline-none focus:ring-2 focus:ring-[#0d0d0d]">Select your Honda<ChevronRight size={16}/></button>}
    <VehicleFinderDialog open={open} onClose={()=>setOpen(false)}/>
  </div></section>;
}
