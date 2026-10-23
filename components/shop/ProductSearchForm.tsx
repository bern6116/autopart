"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

export default function ProductSearchForm({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  };

  return (
    <form onSubmit={submit} role="search" className="flex w-full gap-2">
      <label className="relative flex-1">
        <span className="sr-only">Search by product name, SKU, or brand</span>
        <Search size={16} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={query} onChange={(e)=>setQuery(e.target.value)} type="search"
          placeholder="Search parts, brands, or part numbers"
          className={`w-full rounded-xl border pl-11 pr-4 ${compact?"py-2":"py-3.5"} text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] ${dark?"border-white/20 bg-white/10 text-white placeholder:text-gray-500":"border-gray-200 bg-[#f4f4f4] text-gray-800 placeholder:text-gray-400"}`}/>
      </label>
      <button type="submit" aria-label={compact?"Search products":undefined} className={`flex items-center justify-center whitespace-nowrap rounded-xl bg-[#d4f000] text-sm font-bold text-[#0d0d0d] transition-colors hover:bg-[#c4e000] focus:outline-none focus:ring-2 focus:ring-[#0d0d0d] ${compact?"w-10":"gap-1.5 px-5 py-3.5"}`}>{compact?<Search size={16}/>:<>Search <ArrowRight size={15}/></>}</button>
    </form>
  );
}
