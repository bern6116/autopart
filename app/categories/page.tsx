import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CategoriesClient from "@/components/categories/CategoriesClient";

export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Browse all auto parts categories — engine parts, brakes, suspension, electrical, wheels, filters, and more.",
};

export default function CategoriesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <CategoriesClient />
      </main>
      <Footer />
    </>
  );
}
