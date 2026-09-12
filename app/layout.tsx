import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Auto Core — Reliable Auto Parts & Accessories",
    template: "%s | Auto Core",
  },
  description:
    "Shop 500,000+ OEM and aftermarket auto parts from 200+ top brands. Fast shipping, expert support, and the best prices guaranteed.",
  keywords: [
    "auto parts",
    "car parts",
    "OEM parts",
    "aftermarket parts",
    "brake pads",
    "engine parts",
    "auto accessories",
  ],
  authors: [{ name: "Auto Core" }],
  creator: "Auto Core",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://autocore.com",
    siteName: "Auto Core",
    title: "Auto Core — Reliable Auto Parts & Accessories",
    description:
      "Shop 500,000+ OEM and aftermarket auto parts from 200+ top brands.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Auto Core" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Core — Auto Parts & Accessories",
    description: "Shop 500,000+ OEM and aftermarket auto parts.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d4f000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#111111]">
        {children}
      </body>
    </html>
  );
}
