import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductImage from "@/components/sections/ProductImage";
import { getGuide, guides } from "@/lib/guides";

export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const guide=getGuide((await params).slug); return guide ? { title: guide.title, description: guide.summary } : { title: "Guide Not Found" }; }

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide=getGuide((await params).slug); if(!guide) notFound();
  return <><Navbar/><main className="min-h-screen bg-[#f7f7f7] py-10"><article className="mx-auto max-w-3xl px-4 sm:px-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">AutoCore guide</p><h1 className="mt-2 text-3xl font-black leading-tight text-[#0d0d0d] sm:text-4xl">{guide.title}</h1><p className="mt-4 text-lg leading-7 text-gray-600">{guide.summary}</p><ProductImage src={guide.image} alt={guide.imageAlt} sizes="768px" className="mt-8 aspect-[16/9] w-full rounded-xl border border-gray-200 bg-white" illustrative={guide.slug==="suspension-warning-signs"}/><div className="mt-8 space-y-7">{guide.sections.map(section=><section key={section.heading}><h2 className="text-xl font-extrabold text-[#0d0d0d]">{section.heading}</h2><p className="mt-2 leading-7 text-gray-700">{section.body}</p></section>)}</div><p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">General information only. Confirm the vehicle-specific service procedure and part fitment before ordering or beginning repairs.</p></article></main><Footer/></>;
}
