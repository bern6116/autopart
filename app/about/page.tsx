import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AboutClient from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Auto Core — our story, mission, and the team behind your trusted auto parts destination.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white min-h-screen">
        <AboutClient />
      </main>
      <Footer />
    </>
  );
}
