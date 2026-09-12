"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import ProductCard from "@/components/sections/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

const tabs = ["All", "Brakes", "Engine", "Suspension", "Electrical", "Filters"];

const tabFilters: Record<string, string[]> = {
  All: [],
  Brakes: ["Brake System"],
  Engine: ["Engine Parts"],
  Suspension: ["Suspension"],
  Electrical: ["Electrical"],
  Filters: ["Filters"],
};

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    tabFilters[activeTab].length === 0
      ? products.filter((p) => p.isFeatured)
      : products.filter((p) => tabFilters[activeTab].includes(p.category));

  const displayed = filtered.slice(0, 8);

  return (
    <section className="bg-[#f9f9f9] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <SectionHeader
            eyebrow="Popular"
            title="High-Demand Parts"
            subtitle="Top-rated parts trusted by thousands of mechanics and car owners."
          />
          <Link
            href="/shop"
            className="shrink-0 hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#0d0d0d] hover:text-gray-600 transition-colors"
          >
            View all products <ArrowRight size={15} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-8 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-[#0d0d0d] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-[#0d0d0d]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔧</div>
            <p className="font-semibold">No featured products in this category yet.</p>
          </div>
        )}

        {/* Load more */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#0d0d0d] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#1a1a1a] transition-colors"
          >
            Shop All Parts <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
