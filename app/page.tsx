import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import VehicleFinder from "@/components/sections/VehicleFinder";
import ShopByCategory from "@/components/sections/ShopByCategory";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import FrequentlyBoughtTogether from "@/components/sections/FrequentlyBoughtTogether";
import DealsOfTheWeek from "@/components/sections/DealsOfTheWeek";
import FeaturedBrands from "@/components/sections/FeaturedBrands";
import PromoBanner from "@/components/sections/PromoBanner";
import BlogSection from "@/components/sections/BlogSection";

export const metadata: Metadata = {
  title: "Auto Core — Reliable Auto Parts Built To Last",
  description:
    "Shop OEM and aftermarket auto parts from 200+ trusted brands. Find parts by vehicle, browse categories, and get free shipping on orders over $75.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero Banner */}
        <HeroSection />

        {/* 2. Vehicle Finder */}
        <VehicleFinder />

        {/* 3. Shop by Category */}
        <ShopByCategory />

        {/* 4. Featured / High-Demand Parts */}
        <FeaturedProducts />

        {/* 5. Frequently Bought Together */}
        <FrequentlyBoughtTogether />

        {/* 6. Deals of the Week */}
        <DealsOfTheWeek />

        {/* 7. Featured Brands + Stats */}
        <FeaturedBrands />

        {/* 8. Promo Banner (Online Exclusive + smaller promos) */}
        <PromoBanner />

        {/* 9. Blog / Insights */}
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}
