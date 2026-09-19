import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TrackOrderClient from "@/components/track/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Enter your Auto Core order number and email address to view your real-time delivery status.",
};

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <TrackOrderClient />
      </main>
      <Footer />
    </>
  );
}
