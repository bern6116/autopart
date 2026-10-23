"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductSearchForm from "@/components/shop/ProductSearchForm";
import VehicleFinderDialog from "@/components/sections/VehicleFinderDialog";

const shortcuts = [["Brake Pads","Brake System"],["Oil Filters","Filters"],["Spark Plugs","Engine Parts"],["Struts","Suspension"],["Alternators","Electrical"]] as const;
type CategoryOption={name:string;slug:string};

export default function HeroSection(){
  const [finderOpen,setFinderOpen]=useState(false); const [categories,setCategories]=useState<CategoryOption[]>([]);
  useEffect(()=>{void supabase.from("categories").select("name,slug").eq("status","active").then(({data})=>setCategories((data??[]) as CategoryOption[]));},[]);
  return <section className="overflow-hidden bg-[#0d0d0d]">
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14"><div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="relative z-10 space-y-6">
        <div><h1 className="max-w-xl text-[34px] font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">Find the right parts<br/>for your <span className="text-[#d4f000]">Honda.</span></h1><p className="mt-4 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">Select your model and year to check compatibility.</p></div>
        <div className="max-w-xl"><ProductSearchForm dark/></div>
        {categories.length>0&&<div className="flex flex-wrap gap-2">{shortcuts.map(([label,categoryName])=>{const category=categories.find(c=>c.name===categoryName);return category?<Link key={label} href={`/shop?cat=${encodeURIComponent(category.slug)}&q=${encodeURIComponent(label)}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-all hover:border-[#d4f000]/30 hover:bg-[#d4f000]/10 hover:text-[#d4f000]">{label}</Link>:null;})}</div>}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row"><Link href="/shop" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d4f000] px-7 py-3.5 text-base font-bold text-[#0d0d0d] hover:bg-[#c4e000] focus:outline-none focus:ring-2 focus:ring-white">Shop Parts<ChevronRight size={18}/></Link><button onClick={()=>setFinderOpen(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#d4f000]"><Car size={18}/>Find by Vehicle</button></div>
      </div>
      <div className="relative flex justify-center lg:justify-end"><div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-xl border border-white/15 bg-[#1a1a1a]"><Image src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=900&fit=crop&q=88" alt="Modern passenger car representing the AutoCore parts catalog" fill className="object-cover brightness-105" sizes="(max-width: 1024px) 100vw, 50vw" priority/></div></div>
    </div></div>
    <VehicleFinderDialog open={finderOpen} onClose={()=>setFinderOpen(false)}/>
  </section>;
}
