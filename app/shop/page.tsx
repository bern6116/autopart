import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Honda Parts",
  description: "Browse confirmed Honda-fit parts by category, parts brand, model, year, price, and availability. AutoCore is independent and is not an official Honda dealership.",
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
