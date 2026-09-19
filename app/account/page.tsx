import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountClient from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Auto Core account, orders, and wishlist.",
};

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#f4f4f4] min-h-screen">
        <AccountClient />
      </main>
      <Footer />
    </>
  );
}
