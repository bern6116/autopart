"use client";
import { useEffect, useState, type ElementType } from "react";
import Link from "next/link";
import { ArrowRight, CarFront, CircleDot, Cog, Disc3, Filter, Gauge, Lightbulb, Package, Settings2, Thermometer, Wrench, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { categories as fallbackCategories } from "@/lib/data";

type CategoryRow={id:string;name:string;slug:string};
const icons:Record<string,ElementType>={
  "engine-parts":Cog,"brake-system":Disc3,suspension:Wrench,electrical:Zap,
  "wheels-tires":CircleDot,filters:Filter,lighting:Lightbulb,"body-parts":CarFront,
  "cooling-system":Thermometer,transmission:Gauge,accessories:Settings2,"other-parts":Package,
};

export default function ShopByCategory(){
  const [categories,setCategories]=useState<CategoryRow[]>(fallbackCategories.map(({id,name,slug})=>({id,name,slug})));
  const [counts,setCounts]=useState<Record<string,number>|null>(null);
  useEffect(()=>{void Promise.all([supabase.from("categories").select("id,name,slug").eq("status","active").order("name"),supabase.from("catalog_products").select("id,category_id")]).then(([categoryResult,productResult])=>{
    if(!categoryResult.error&&categoryResult.data?.length)setCategories(categoryResult.data as CategoryRow[]);
    if(!productResult.error){const next:Record<string,Set<string>>={};for(const product of productResult.data??[]){if(!product.category_id)continue;(next[product.category_id]??=new Set()).add(product.id);}setCounts(Object.fromEntries(Object.entries(next).map(([id,items])=>[id,items.size])));}
  });},[]);
  return <section className="bg-white py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6">
    <div className="mb-7 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-extrabold tracking-tight text-[#0d0d0d]">Shop by Category</h2><p className="mt-1 text-sm text-gray-500">Browse parts by automotive system.</p></div><Link href="/categories" className="hidden items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:underline focus:outline-none focus:ring-2 focus:ring-[#d4f000] sm:inline-flex">View all categories<ArrowRight size={15}/></Link></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{categories.map(category=>{const Icon=icons[category.slug]??Package;const count=counts?.[category.id];return <Link key={category.id} href={`/categories/${category.slug}`} className="group flex min-h-32 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#8a9d00] focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:ring-offset-2"><Icon size={24} strokeWidth={1.7} className="text-[#0d0d0d] transition-colors group-hover:text-[#728200]"/><div className="mt-5"><div className="text-sm font-bold leading-snug text-[#0d0d0d]">{category.name}</div>{count!==undefined&&<div className="mt-1 text-xs text-gray-500">{count} {count===1?"product":"products"}</div>}</div></Link>;})}</div>
    <div className="mt-6 sm:hidden"><Link href="/categories" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#d4f000]">View all categories<ArrowRight size={15}/></Link></div>
  </div></section>;
}
