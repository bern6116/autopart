import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BrandsClient from "@/components/brands/BrandsClient";

export const metadata: Metadata = {
  title: "Shop by Brand",
  description: "Browse all Auto Core brands — Bosch, Brembo, Denso, K&N, Monroe, and more.",
};

export default function BrandsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <BrandsClient />
      </main>
      <Footer />
    </>
  );
}
