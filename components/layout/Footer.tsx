import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
  Headphones,
} from "lucide-react";

const footerLinks = {
  information: [
    { label: "About Auto Core", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Sitemap", href: "/sitemap" },
  ],
  quickLinks: [
    { label: "Shop All Parts", href: "/shop" },
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Deals & Offers", href: "/deals" },
    { label: "Vehicle Lookup", href: "/vehicle-lookup" },
    { label: "Track My Order", href: "/track" },
    { label: "Bulk Orders", href: "/bulk" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "Order History", href: "/account/orders" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Loyalty Rewards", href: "/rewards" },
  ],
};

const guarantees = [
  { icon: Truck, title: "Free Shipping", desc: "Orders over $75" },
  { icon: Shield, title: "Genuine Parts", desc: "100% authenticated" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day returns" },
  { icon: Headphones, title: "Expert Support", desc: "7 days a week" },
];

// Social icon SVGs (lucide-react doesn't include brand icons)
const SocialFacebook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
const SocialTwitter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const SocialInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const SocialYoutube = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);

const socials = [
  { Icon: SocialFacebook, href: "#", label: "Facebook" },
  { Icon: SocialTwitter, href: "#", label: "Twitter" },
  { Icon: SocialInstagram, href: "#", label: "Instagram" },
  { Icon: SocialYoutube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] text-white">
      {/* Guarantee Bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {guarantees.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4f000]/10 border border-[#d4f000]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#d4f000]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{title}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#d4f000] rounded-xl flex items-center justify-center">
                <span className="text-[#0d0d0d] font-black text-lg leading-none">AC</span>
              </div>
              <div>
                <div className="font-black text-white text-xl tracking-tight leading-none">
                  AUTO CORE
                </div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
                  Parts &amp; Accessories
                </div>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Your trusted source for OEM and aftermarket auto parts. We stock over 500,000 parts from 200+ top brands, shipped fast to your door.
            </p>

            {/* Contact */}
            <div className="space-y-2.5">
              <a href="tel:18002886267" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#d4f000] transition-colors">
                <Phone size={14} className="text-[#d4f000]" />
                1-800-AUTO-CORE (288-6273)
              </a>
              <a href="mailto:support@autocore.com" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#d4f000] transition-colors">
                <Mail size={14} className="text-[#d4f000]" />
                support@autocore.com
              </a>
              <div className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin size={14} className="text-[#d4f000] mt-0.5 shrink-0" />
                <span>4821 Industrial Blvd, Detroit, MI 48201</span>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <div className="text-sm font-bold text-white mb-2">Stay in the loop</div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d4f000] focus:border-transparent"
                />
                <button className="bg-[#d4f000] text-[#0d0d0d] px-3 py-2 rounded-lg font-bold hover:bg-[#c4e000] transition-colors shrink-0">
                  <ArrowRight size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">Get deals, tips & new arrivals. No spam.</p>
            </div>
          </div>

          {/* Information */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Information</div>
            <ul className="space-y-2.5">
              {footerLinks.information.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-[#d4f000] transition-colors flex items-center gap-1 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Quick Links</div>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-[#d4f000] transition-colors flex items-center gap-1 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">My Account</div>
            <ul className="space-y-2.5">
              {footerLinks.account.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-[#d4f000] transition-colors flex items-center gap-1 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Follow Us</div>
              <div className="flex gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#d4f000] hover:border-[#d4f000] hover:text-[#0d0d0d] text-gray-400 transition-all"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Auto Core. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-gray-400 transition-colors">Cookies</Link>
          </div>
          {/* Payment icons row */}
          <div className="flex items-center gap-2">
            {["VISA", "MC", "AMEX", "PayPal"].map((p) => (
              <span key={p} className="px-2 py-1 border border-white/10 rounded text-[10px] font-bold text-gray-600">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
