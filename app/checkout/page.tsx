import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Auto Core order securely.",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <CheckoutClient />
      </main>
    </>
  );
}
