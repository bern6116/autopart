"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Truck,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";
import ProductSearchForm from "@/components/shop/ProductSearchForm";
import BrandLogo from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth-context";
import { isAdminRole } from "@/lib/auth";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Parts", href: "/shop" },
      { label: "New Arrivals", href: "/shop?filter=new" },
      { label: "On Sale", href: "/shop?filter=sale" },
      { label: "Best Sellers", href: "/shop?filter=bestsellers" },
    ],
  },
  {
    label: "Categories",
    href: "/categories",
    children: [
      { label: "Engine Parts", href: "/categories/engine-parts" },
      { label: "Brake System", href: "/categories/brake-system" },
      { label: "Suspension", href: "/categories/suspension" },
      { label: "Electrical", href: "/categories/electrical" },
      { label: "Wheels & Tires", href: "/categories/wheels-tires" },
      { label: "Filters", href: "/categories/filters" },
      { label: "View All →", href: "/categories" },
    ],
  },
  { label: "Parts Brands", href: "/brands" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const {user,profile,loading}=useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-[#0d0d0d] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
          <div className="hidden md:block text-gray-400">AutoCore Parts &amp; Accessories</div>
          <div className="flex items-center gap-1.5 text-[#d4f000]"><Truck size={12}/><span className="font-medium">Search by name, brand, or part number</span></div>
          <div className="hidden sm:flex items-center gap-4 text-gray-400">
            <Link
              href="/track"
              className={`hover:text-white transition-colors flex items-center gap-1 ${
                pathname === "/track" ? "text-[#d4f000]" : ""
              }`}
            >
              Track Order
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav
        className={`bg-white border-b border-gray-200 transition-shadow duration-200 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 mr-2" aria-label="Auto Core home">
              <BrandLogo size="nav" alt="Auto Core" />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1">
              {navLinks.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`nav-link flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      item.href === "/"
                        ? pathname === "/"
                          ? "text-[#0d0d0d] bg-[#d4f000]/20 font-bold"
                          : "text-[#0d0d0d] hover:bg-gray-50"
                        : "text-[#0d0d0d] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={13} className="mt-0.5 text-gray-400" />}
                  </Link>

                  {/* Dropdown */}
                  {item.children && openDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f4f4f4] hover:text-[#0d0d0d] transition-colors font-medium"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Spacer for mobile */}
            <div className="flex-1 lg:hidden" />

            {/* Search bar — desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-xs xl:max-w-sm">
              <ProductSearchForm compact/>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-[#0d0d0d]" />
              </button>

              <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Wishlist">
                <Heart size={20} className="text-[#0d0d0d]" />
              </Link>

              <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Cart">
                <ShoppingCart size={20} className="text-[#0d0d0d]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0d0d0d] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              <Link
                href={profile && isAdminRole(profile.role) && profile.is_active ? "/admin/dashboard" : user ? "/account" : "/login"}
                className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-gray-200 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Account"
              >
                <div className="w-8 h-8 bg-[#f4f4f4] rounded-full flex items-center justify-center">
                  <User size={16} className="text-[#0d0d0d]" />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-[10px] text-gray-400 leading-none">{loading ? "Checking account…" : user ? `Hello, ${profile?.first_name || "there"}` : "Hello, Sign In"}</div>
                  <div className="text-xs font-bold text-[#0d0d0d] leading-none mt-0.5">{profile && isAdminRole(profile.role) && profile.is_active ? "Admin Dashboard" : user ? "My Account" : "Sign In"}</div>
                </div>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} className="text-[#0d0d0d]" /> : <Menu size={22} className="text-[#0d0d0d]" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="md:hidden pb-3">
              <ProductSearchForm compact/>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(36px+64px)] z-40 flex">
          <div className="bg-white w-80 max-w-full h-full overflow-y-auto shadow-2xl">
            <div className="p-4 space-y-1">
              {navLinks.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-[#0d0d0d] font-semibold rounded-xl hover:bg-[#f4f4f4] transition-colors"
                  >
                    {item.label}
                    {item.children && <ChevronDown size={16} />}
                  </Link>
                  {item.children && (
                    <div className="pl-4 space-y-0.5 mb-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0d0d0d] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-100 space-y-2">
                {profile && isAdminRole(profile.role) && profile.is_active && (
                  <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f4f4f4]">
                    <LayoutDashboard size={18}/>
                    <span className="font-semibold">Admin Dashboard</span>
                  </Link>
                )}
                <Link href="/account" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f4f4f4] transition-colors">
                  <User size={18} className="text-gray-500" />
                  <span className="font-semibold text-[#0d0d0d]">My Account</span>
                </Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f4f4f4] transition-colors">
                  <Heart size={18} className="text-gray-500" />
                  <span className="font-semibold text-[#0d0d0d]">Wishlist</span>
                </Link>
                <Link href="/cart" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f4f4f4] transition-colors">
                  <ShoppingCart size={18} className="text-gray-500" />
                  <span className="font-semibold text-[#0d0d0d]">Cart</span>
                  {totalItems > 0 && (
                    <span className="ml-auto bg-[#0d0d0d] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
