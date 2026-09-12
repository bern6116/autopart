"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight, Star, Shield, Truck, ArrowRight } from "lucide-react";
import { heroSlides } from "@/lib/data";

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [query, setQuery] = useState("");
  const slide = heroSlides[activeSlide];

  return (
    <section className="bg-[#0d0d0d] overflow-hidden relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left Content */}
          <div className="space-y-6 z-10 relative">
            {/* Badge */}
            {slide.badge && (
              <div className="inline-flex items-center gap-2 bg-[#d4f000]/10 border border-[#d4f000]/30 text-[#d4f000] text-xs font-bold px-4 py-1.5 rounded-full">
                <Truck size={12} />
                {slide.badge}
              </div>
            )}

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
                {slide.headline}
                <br />
                <span className="text-[#d4f000]">{slide.subheadline}</span>
              </h1>
              <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-md leading-relaxed">
                {slide.description}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-md">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by part name, SKU, brand..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent"
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <Link
                href={`/shop${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                className="bg-[#d4f000] text-[#0d0d0d] px-5 py-3.5 rounded-xl font-bold text-sm hover:bg-[#c4e000] transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                Search
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Quick category pills */}
            <div className="flex flex-wrap gap-2">
              {["Brake Pads", "Oil Filters", "Spark Plugs", "Struts", "Alternators"].map((tag) => (
                <Link
                  key={tag}
                  href={`/shop?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 hover:bg-[#d4f000]/10 hover:text-[#d4f000] hover:border-[#d4f000]/30 transition-all"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-7 py-3.5 rounded-xl hover:bg-[#c4e000] transition-colors text-base"
              >
                {slide.cta}
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/vehicle-lookup"
                className="inline-flex items-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base"
              >
                Find by Vehicle
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Shield size={14} className="text-[#d4f000]" />
                <span>OEM & Genuine Parts</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <span>4.9/5 from 18,000+ reviews</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Truck size={14} className="text-[#d4f000]" />
                <span>Ships in 24 hours</span>
              </div>
            </div>
          </div>

          {/* Right — Hero Image Card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 aspect-[4/3]">
                <Image
                  src={slide.image}
                  alt="Featured vehicle"
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 via-transparent to-transparent" />

                {/* Floating stat cards */}
                <div className="absolute bottom-4 left-4 bg-[#0d0d0d]/90 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5">
                  <div className="text-[#d4f000] font-black text-xl leading-none">500K+</div>
                  <div className="text-gray-400 text-xs mt-0.5">Parts in stock</div>
                </div>
                <div className="absolute top-4 right-4 bg-[#d4f000] rounded-xl px-3 py-2">
                  <div className="text-[#0d0d0d] font-black text-sm leading-none">200+</div>
                  <div className="text-[#0d0d0d]/70 text-xs mt-0.5">Top Brands</div>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeSlide
                        ? "w-8 bg-[#d4f000]"
                        : "w-4 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
