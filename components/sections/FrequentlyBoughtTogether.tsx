import Link from "next/link";
import Image from "next/image";
import { Plus, ShoppingCart } from "lucide-react";
import { frequentlyBoughtTogether } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";

export default function FrequentlyBoughtTogether() {
  const bundle = frequentlyBoughtTogether[0];
  const bundlePrice = bundle.reduce((sum, p) => sum + p.price, 0);
  const bundleSavings = bundle.reduce((sum, p) => sum + (p.originalPrice ? p.originalPrice - p.price : 0), 0);

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Bundle"
          title="Frequently Bought Together"
          subtitle="These parts are commonly purchased together for a complete repair."
          className="mb-8"
        />

        <div className="bg-[#f9f9f9] rounded-2xl border border-gray-100 p-6 lg:p-8">
          {/* Products row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {bundle.map((product, i) => (
              <div key={product.id} className="flex items-center gap-4">
                <Link href={`/products/${product.slug}`} className="group flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="96px"
                    />
                    {/* Number badge */}
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-[#0d0d0d] rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-black text-white">{i + 1}</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left max-w-[140px]">
                    <div className="text-xs font-bold text-gray-400">{product.brand}</div>
                    <div className="text-sm font-bold text-[#0d0d0d] line-clamp-2 leading-snug mt-0.5">{product.name}</div>
                    <div className="text-base font-black text-[#0d0d0d] mt-1">${product.price.toFixed(2)}</div>
                  </div>
                </Link>
                {i < bundle.length - 1 && (
                  <div className="w-8 h-8 bg-[#d4f000] rounded-full flex items-center justify-center shrink-0">
                    <Plus size={16} className="text-[#0d0d0d]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bundle CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500 font-medium">Bundle Price</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#0d0d0d]">${bundlePrice.toFixed(2)}</span>
                {bundleSavings > 0 && (
                  <span className="text-sm font-bold text-green-600">
                    Save ${bundleSavings.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{bundle.length} items • Free shipping</div>
            </div>
            <button className="flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-bold px-6 py-3 rounded-xl hover:bg-[#c4e000] transition-colors text-sm">
              <ShoppingCart size={16} />
              Add Bundle to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
