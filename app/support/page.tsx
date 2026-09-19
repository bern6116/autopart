import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SupportClient from "@/components/support/SupportClient";

export const metadata: Metadata = {
  title: "Support & Contact",
  description: "Get help with your Auto Core orders, returns, and product questions.",
};

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <SupportClient />
      </main>
      <Footer />
    </>
  );
}
