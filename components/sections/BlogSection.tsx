import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/sections/ProductImage";
import { guides } from "@/lib/guides";

export default function BlogSection() {
  if (guides.length === 0) return null;

  return (
    <section className="border-t border-gray-100 bg-white py-14" aria-labelledby="tips-guides-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gray-500">Helpful information</p>
            <h2 id="tips-guides-title" className="text-3xl font-black tracking-tight text-[#0d0d0d]">Tips &amp; Guides</h2>
          </div>
          <Link href="/guides" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
            View all <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {guides.map((guide) => (
            <article key={guide.slug} className="group overflow-hidden rounded-xl border border-gray-200 bg-white">
              <Link href={`/guides/${guide.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]">
                <ProductImage src={guide.image} alt={guide.imageAlt} sizes="(max-width: 767px) 100vw, 33vw" className="aspect-[16/7] w-full" illustrative={guide.slug === "suspension-warning-signs"} />
                <div className="p-5">
                  <h3 className="text-lg font-extrabold leading-snug text-[#0d0d0d]">{guide.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{guide.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#0d0d0d]">Read guide <ArrowRight aria-hidden="true" size={14} /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
