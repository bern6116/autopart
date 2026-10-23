"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, Warehouse, ShoppingBag,
  Truck, Users, ShoppingCart, BarChart2, Settings, UserCog,
  Menu, X, ChevronRight, Bell, Search, LogOut, Building2, ScanLine,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products",   icon: Package,          label: "Products" },
  { href: "/admin/categories", icon: Tag,              label: "Categories" },
  { href: "/admin/inventory",  icon: Warehouse,        label: "Inventory" },
  { href: "/admin/reader",     icon: ScanLine,         label: "Barcode & QR Reader" },
  { href: "/admin/sales",      icon: ShoppingBag,      label: "Sales / POS" },
  { href: "/admin/purchases",  icon: Truck,            label: "Purchases" },
  { href: "/admin/suppliers",  icon: Building2,        label: "Suppliers" },
  { href: "/admin/customers",  icon: Users,            label: "Customers" },
  { href: "/admin/orders",     icon: ShoppingCart,     label: "Orders" },
  { href: "/admin/reports",    icon: BarChart2,        label: "Reports" },
  { href: "/admin/users",      icon: UserCog,          label: "Users" },
  { href: "/admin/settings",   icon: Settings,         label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {profile,loading,error,signOut}=useAuth();

  const handleLogout = async () => {
    try { await signOut(); router.replace("/login"); router.refresh(); } catch { router.replace("/login?error=signout"); }
  };

  const pageTitle = NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Admin";

  // Redirect unauthenticated / failed-profile users to the shared login.
  // This effect must be called BEFORE any early return so hook order
  // stays stable across all renders (Rules of Hooks).
  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (loading) return;
    if (!profile || error) {
      router.replace("/login");
    }
  }, [pathname, loading, profile, error, router]);

  // Don't render admin chrome on the login page
  if(pathname==="/admin/login")return <>{children}</>;

  if(loading)return <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] text-sm text-white">Verifying staff access…</div>;

  // Unauthenticated or profile lookup failed → show redirecting screen
  // (useEffect above handles the actual redirect)
  if(!profile||error)return <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] text-sm text-white">Redirecting to login…</div>;

  // Authenticated but not authorized (inactive or wrong role) → block
  if(!profile.is_active||profile.role!=="super_admin")return <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] p-6 text-center text-white"><div><h1 className="text-xl font-extrabold">Admin access unavailable</h1><p className="mt-2 text-sm text-gray-400">{!profile.is_active?"This account is inactive.":"This account is not authorized for the admin area."}</p><Link href="/" className="mt-4 inline-block text-[#d4f000]">Return to storefront</Link></div></div>;

  const sidebar = (
    <aside className="flex flex-col h-full bg-[#0d0d0d] w-64 shrink-0">
      {/* Logo — links to /admin/dashboard */}
      <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <BrandLogo size="admin" alt="Auto Core" />
        <div>
          <div className="font-black text-white text-sm leading-none">AUTO CORE</div>
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mt-0.5">Admin Panel</div>
        </div>
        <button className="ml-auto lg:hidden text-gray-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <X size={18} />
        </button>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active ? "bg-[#d4f000] text-[#0d0d0d]" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}>
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={16} />Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#f4f4f4] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {sidebar}
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="font-extrabold text-[#0d0d0d] text-sm">{pageTitle}</div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xs ml-4">
            <div className="relative w-full">
              <input placeholder="Quick search…"
                className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]" />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-7 h-7 bg-[#d4f000] rounded-full flex items-center justify-center">
                <span className="font-black text-[#0d0d0d] text-xs">{profile.first_name?.[0]??"A"}</span>
              </div>
              <span className="hidden sm:block text-xs font-bold text-gray-700">{profile.first_name||"Administrator"}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
