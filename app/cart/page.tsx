import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartClient from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your Auto Core cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <CartClient />
      </main>
      <Footer />
    </>
  );
}
