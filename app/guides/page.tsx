import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductImage from "@/components/sections/ProductImage";
import { guides } from "@/lib/guides";

export const metadata: Metadata = { title: "Tips & Guides", description: "Practical vehicle maintenance and parts-selection guides." };

export default function GuidesPage() {
  return <><Navbar/><main className="min-h-screen bg-[#f7f7f7] py-10"><div className="mx-auto max-w-7xl px-4 sm:px-6"><h1 className="text-3xl font-black text-[#0d0d0d]">Tips &amp; Guides</h1><p className="mt-2 text-gray-600">Practical information for selecting and maintaining vehicle parts.</p><div className="mt-8 grid gap-5 md:grid-cols-3">{guides.map(guide=><Link key={guide.slug} href={`/guides/${guide.slug}`} className="group overflow-hidden rounded-xl border border-gray-200 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]"><ProductImage src={guide.image} alt={guide.imageAlt} sizes="(max-width: 767px) 100vw, 33vw" className="aspect-[4/3]" illustrative={guide.slug==="suspension-warning-signs"}/><div className="p-5"><h2 className="text-lg font-extrabold">{guide.title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{guide.summary}</p></div></Link>)}</div></div></main><Footer/></>;
}
