import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import VehicleFinder from "@/components/sections/VehicleFinder";
import ShopByCategory from "@/components/sections/ShopByCategory";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import FrequentlyBoughtTogether from "@/components/sections/FrequentlyBoughtTogether";
import BlogSection from "@/components/sections/BlogSection";
import ServiceStrip from "@/components/sections/ServiceStrip";

export const metadata: Metadata = {
  title: "Auto Core — Auto Parts for Cars and Trucks",
  description: "Search AutoCore's Honda-focused parts catalog by vehicle, product name, parts brand, or part number.",
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

        {/* 6. Tips and guides */}
        <BlogSection />

        {/* 7. Verified store services */}
        <ServiceStrip />
      </main>
      <Footer />
    </>
  );
}
