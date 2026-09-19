import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Auto Parts",
  description:
    "Browse 500,000+ OEM and aftermarket auto parts. Filter by category, brand, vehicle, price, and more.",
};

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <ShopClient />
      </main>
      <Footer />
    </>
  );
}
