import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BrandsClient from "@/components/brands/BrandsClient";

export const metadata: Metadata = {
  title: "Parts Brands",
  description: "Browse parts manufacturers represented by products in the AutoCore catalog.",
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
