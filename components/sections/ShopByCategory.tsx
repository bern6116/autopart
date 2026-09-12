import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";

const categoryIcons: Record<string, string> = {
  "engine-parts": "⚙️",
  "brake-system": "🛑",
  "suspension": "🔩",
  "electrical": "⚡",
  "wheels-tires": "🔘",
  "filters": "🔧",
  "lighting": "💡",
  "body-parts": "🚗",
  "cooling-system": "🌡️",
  "transmission": "🔄",
  "accessories": "🎛️",
  "other-parts": "🔨",
};

const categoryColors: Record<string, string> = {
  "engine-parts": "bg-orange-50 border-orange-100 hover:border-orange-300",
  "brake-system": "bg-red-50 border-red-100 hover:border-red-300",
  "suspension": "bg-blue-50 border-blue-100 hover:border-blue-300",
  "electrical": "bg-yellow-50 border-yellow-100 hover:border-yellow-300",
  "wheels-tires": "bg-gray-50 border-gray-200 hover:border-gray-400",
  "filters": "bg-green-50 border-green-100 hover:border-green-300",
  "lighting": "bg-amber-50 border-amber-100 hover:border-amber-300",
  "body-parts": "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
  "cooling-system": "bg-cyan-50 border-cyan-100 hover:border-cyan-300",
  "transmission": "bg-purple-50 border-purple-100 hover:border-purple-300",
  "accessories": "bg-pink-50 border-pink-100 hover:border-pink-300",
  "other-parts": "bg-slate-50 border-slate-200 hover:border-slate-400",
};

export default function ShopByCategory() {
  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by Category"
          subtitle="Find the exact part you need across all major automotive systems."
          action={
            <Link
              href="/categories"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-[#b8d400] transition-colors"
            >
              View All <ArrowRight size={15} />
            </Link>
          }
          className="mb-8"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`group flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                categoryColors[cat.slug] ?? "bg-gray-50 border-gray-200 hover:border-gray-400"
              }`}
            >
              <span className="text-3xl mb-3 block leading-none">{categoryIcons[cat.slug] ?? "🔧"}</span>
              <div className="font-bold text-[#0d0d0d] text-xs leading-tight">{cat.name}</div>
              <div className="text-[10px] text-gray-400 mt-1 font-medium">
                {cat.productCount.toLocaleString()} parts
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0d0d0d] border-2 border-[#0d0d0d] px-5 py-2.5 rounded-xl hover:bg-[#0d0d0d] hover:text-white transition-colors"
          >
            View All Categories <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
