"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/ui/BrandLogo";

const links = [
  { label: "Shop all parts", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Parts Brands", href: "/brands" },
  { label: "Tips & guides", href: "/guides" },
  { label: "Track an order", href: "/track" },
  { label: "Support", href: "/support" },
  { label: "About Auto Core", href: "/about" },
  { label: "My account", href: "/account" },
];

type Contact = { email?: string; phone?: string; address?: string };
const PLACEHOLDERS = ["support@autocore.com", "1-800-auto-core", "4821 industrial blvd"];

function isUsable(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return Boolean(normalized && !PLACEHOLDERS.some((placeholder) => normalized.includes(placeholder)));
}

export default function Footer() {
  const [contact, setContact] = useState<Contact>({});

  useEffect(() => {
    let active = true;
    void supabase.from("system_settings").select("key,value").in("key", ["business_email", "business_phone", "business_address", "business_city"]).then(({ data }) => {
      if (!active || !data) return;
      const settings = Object.fromEntries(data.map((row) => [row.key, row.value]));
      const address = [settings.business_address, settings.business_city].filter(Boolean).join(", ");
      setContact({
        email: isUsable(settings.business_email) ? settings.business_email : undefined,
        phone: isUsable(settings.business_phone) ? settings.business_phone : undefined,
        address: isUsable(address) ? address : undefined,
      });
    });
    return () => { active = false; };
  }, []);

  const hasContact = contact.email || contact.phone || contact.address;

  return (
    <footer className="bg-[#0d0d0d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4f000]" aria-label="Auto Core home">
            <BrandLogo size="nav" alt="Auto Core" />
            <span><strong className="block text-lg font-black">AUTO CORE</strong><span className="text-xs text-gray-400">Parts &amp; Accessories</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">Browse vehicle parts and accessories by product, brand, part number, or recorded vehicle fitment.</p>
          {hasContact && (
            <address className="mt-5 space-y-2 not-italic text-sm text-gray-300">
              {contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 hover:text-[#d4f000]"><Phone aria-hidden="true" size={15}/>{contact.phone}</a>}
              {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-[#d4f000]"><Mail aria-hidden="true" size={15}/>{contact.email}</a>}
              {contact.address && <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 shrink-0" size={15}/>{contact.address}</p>}
            </address>
          )}
        </div>

        <nav aria-label="Store links">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Store</h2>
          <ul className="mt-4 grid gap-2.5">
            {links.slice(0, 4).map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-gray-300 hover:text-[#d4f000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4f000]">{link.label}</Link></li>)}
          </ul>
        </nav>

        <nav aria-label="Customer links">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Customer</h2>
          <ul className="mt-4 grid gap-2.5">
            {links.slice(4).map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-gray-300 hover:text-[#d4f000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4f000]">{link.label}</Link></li>)}
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">Checkout</p>
          <p className="mt-2 text-sm text-gray-300">Cash on delivery</p>
        </nav>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto max-w-7xl px-4 py-4 text-xs text-gray-400 sm:px-6">© {new Date().getFullYear()} Auto Core.</div></div>
    </footer>
  );
}
