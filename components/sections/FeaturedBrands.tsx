import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brands } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";

export default function FeaturedBrands() {
  const featuredBrands = brands.filter((b) => b.isFeatured);

  return (
    <section className="bg-white py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Trusted"
          title="Top Automotive Brands"
          subtitle="We carry parts from the world's most trusted auto parts manufacturers."
          action={
            <Link
              href="/brands"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 transition-colors"
            >
              All brands <ArrowRight size={15} />
            </Link>
          }
          className="mb-8"
        />

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center justify-center gap-2 p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#d4f000] hover:shadow-md transition-all duration-200"
            >
              {/* Brand logo — using styled placeholder */}
              <div className="w-16 h-10 flex items-center justify-center">
                <span className="font-black text-[#0d0d0d] text-sm tracking-tight text-center group-hover:text-[#0d0d0d] transition-colors">
                  {brand.name}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium text-center">
                {brand.productCount.toLocaleString()}+ parts
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "200+", label: "Trusted Brands" },
            { value: "500K+", label: "Parts In Stock" },
            { value: "50K+", label: "Happy Customers" },
            { value: "24hr", label: "Same Day Dispatch" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-5 bg-[#f9f9f9] rounded-2xl border border-gray-100">
              <div className="text-2xl font-black text-[#0d0d0d]">{value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
