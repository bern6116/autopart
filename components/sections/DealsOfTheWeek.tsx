import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag, Zap } from "lucide-react";
import { dealsOfTheWeek } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";
import StarRating from "@/components/ui/StarRating";
import CountdownTimer from "@/components/ui/CountdownTimer";

export default function DealsOfTheWeek() {
  return (
    <section className="bg-[#0d0d0d] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-8 h-1 bg-[#d4f000] rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4f000]">Limited Time</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Deals of the Week
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
              Hot deals on top-selling parts. Don't miss out — these prices won't last.
            </p>
          </div>
          <Link
            href="/deals"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#d4f000] hover:text-[#e8ff33] transition-colors"
          >
            All deals <ArrowRight size={15} />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealsOfTheWeek.map(({ product, dealPrice, dealEndsAt, savings }) => (
            <div key={product.id} className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#d4f000]/40 transition-all hover:shadow-[0_0_30px_rgba(212,240,0,0.08)]">
              {/* Image */}
              <Link href={`/products/${product.slug}`} className="relative block overflow-hidden aspect-[4/3] bg-[#212121]">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Deal badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  <Zap size={11} />
                  -{Math.round((savings / (product.originalPrice ?? product.price)) * 100)}% OFF
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">{product.brand}</div>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug hover:text-[#d4f000] transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <StarRating rating={product.rating} showCount count={product.reviewCount} className="mt-2" />

                {/* Pricing */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[#d4f000] font-black text-xl">${dealPrice.toFixed(2)}</span>
                  <span className="text-gray-600 text-sm line-through">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tag size={11} className="text-green-500" />
                  <span className="text-green-500 text-xs font-bold">Save ${savings.toFixed(2)}</span>
                </div>

                {/* Countdown */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-[10px] text-gray-600 font-medium mb-1.5">Offer ends in:</div>
                  <CountdownTimer endsAt={dealEndsAt} />
                </div>

                {/* CTA */}
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-4 flex items-center justify-center gap-1.5 w-full bg-[#d4f000] text-[#0d0d0d] font-bold text-sm py-2.5 rounded-xl hover:bg-[#c4e000] transition-colors"
                >
                  Shop Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
