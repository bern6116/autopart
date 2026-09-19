"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User, Package, Heart, MapPin, CreditCard, Settings,
  ChevronRight, Star, LogOut, Edit2, Check, Plus,
  Truck, RotateCcw, Shield, Bell, Car, X, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/data";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";

type Tab = "dashboard" | "orders" | "wishlist" | "vehicles" | "profile" | "addresses" | "notifications" | "settings";

// ── Sample data ───────────────────────────────────────────────
const SAMPLE_ORDERS = [
  {
    id: "AC-20241001",
    date: "Oct 1, 2024",
    status: "delivered" as const,
    items: [products[0], products[4]],
    total: 137.98,
    tracking: "1Z999AA10123456784",
  },
  {
    id: "AC-20240918",
    date: "Sep 18, 2024",
    status: "shipped" as const,
    items: [products[2]],
    total: 129.99,
    tracking: "1Z999AA10123456785",
  },
  {
    id: "AC-20240905",
    date: "Sep 5, 2024",
    status: "processing" as const,
    items: [products[7], products[11]],
    total: 23.98,
    tracking: null,
  },
];

const WISHLIST_ITEMS = products.filter((p) => p.isFeatured).slice(0, 6);

const STATUS_STYLES: Record<string, { label: string; variant: "green" | "blue" | "orange" | "gray" }> = {
  delivered: { label: "Delivered", variant: "green" },
  shipped: { label: "Shipped", variant: "blue" },
  processing: { label: "Processing", variant: "orange" },
  cancelled: { label: "Cancelled", variant: "gray" },
};

  const SIDEBAR_TABS: { id: Tab; icon: typeof User; label: string; badge?: number }[] = [
    { id: "dashboard",     icon: User,       label: "Dashboard" },
    { id: "orders",        icon: Package,    label: "My Orders",      badge: 3 },
    { id: "wishlist",      icon: Heart,      label: "Wishlist",       badge: WISHLIST_ITEMS.length },
    { id: "vehicles",      icon: Car,        label: "Saved Vehicles" },
    { id: "profile",       icon: User,       label: "Profile" },
    { id: "addresses",     icon: MapPin,     label: "Addresses" },
    { id: "notifications", icon: Bell,       label: "Notifications" },
    { id: "settings",      icon: Settings,   label: "Settings" },
  ];

export default function AccountClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // ── Load real Supabase session + user profile ─────────────
  const [profile, setProfile] = useState({
    firstName: "John", lastName: "Doe",
    email: "john.doe@example.com", phone: "+1 (555) 012-3456",
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // No active session — redirect to login
        router.replace("/login?from=/account");
        return;
      }
      // Populate profile from Supabase user metadata
      const user = session.user;
      const meta = user.user_metadata ?? {};
      setProfile({
        firstName: meta.first_name ?? meta.name?.split(" ")[0] ?? "",
        lastName:  meta.last_name  ?? meta.name?.split(" ").slice(1).join(" ") ?? "",
        email:     user.email ?? "",
        phone:     meta.phone ?? "",
      });
      setAuthLoading(false);
    };
    init();

    // Listen for sign-out events from other tabs
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Notification toggles — stored as array so hooks never called inside loops
  const [notifSettings, setNotifSettings] = useState([true, true, false, false]);

  type SavedVehicle = { id:string; make:string; model:string; year:string; nickname:string; isPrimary:boolean };
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([
    { id:"v1", make:"Toyota", model:"Camry",    year:"2021", nickname:"My Daily Driver", isPrimary:true  },
    { id:"v2", make:"Ford",   model:"F-150",    year:"2019", nickname:"Work Truck",       isPrimary:false },
  ]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make:"", model:"", year:"", nickname:"" });

  type Notification = { id:string; title:string; message:string; type:string; isRead:boolean; date:string };
  const [notifications, setNotifications] = useState<Notification[]>([
    { id:"n1", title:"Order Shipped!", message:"Your order AC-20241001 has shipped. Track: 1Z999AA10123456784", type:"order", isRead:false, date:"Oct 5, 2024" },
    { id:"n2", title:"Price Drop Alert", message:"Bosch Brake Pads dropped to $34.99 — an item on your wishlist!", type:"promotion", isRead:false, date:"Oct 3, 2024" },
    { id:"n3", title:"Order Delivered", message:"Your order AC-20240918 has been delivered. How was it?", type:"order", isRead:true, date:"Sep 25, 2024" },
    { id:"n4", title:"New Arrival", message:"K&N Performance Cold Air Intake is now in stock for your Toyota Camry.", type:"system", isRead:true, date:"Sep 20, 2024" },
  ]);
  const unreadCount = notifications.filter(n=>!n.isRead).length;
  const markRead = (id:string) => setNotifications(prev=>prev.map(n=>n.id===id?{...n,isRead:true}:n));
  const markAllRead = () => setNotifications(prev=>prev.map(n=>({...n,isRead:true})));

  // ── Sign out ──────────────────────────────────────────────
  // Calls Supabase Auth signOut({ scope: 'local' }) to terminate
  // only the current browser session, then redirects to /login.
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        // Supabase returned an error — do NOT navigate as if logout succeeded
        console.error("[AutoCore] signOut error:", error.message);
        setSignOutError("Unable to sign out. Please try again.");
        setSigningOut(false);
        return;
      }
      // Session cleared — hard-navigate so Next.js server state also resets
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[AutoCore] signOut unexpected error:", err);
      setSignOutError("Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  };

  // Tabs with live badges (computed inside component so unreadCount is in scope)
  const sidebarTabs = SIDEBAR_TABS.map(t =>
    t.id === "notifications" ? { ...t, badge: unreadCount || undefined } : t
  );

  const saveProfile = () => {
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const inputCls = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] transition";

  // ── Auth loading / redirect guard ────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-[#d4f000]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p className="text-sm text-gray-500 font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0d0d0d] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[#0d0d0d] font-semibold">My Account</span>
      </nav>

      <div className="flex gap-6">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 self-start sticky top-24 gap-2">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center mb-1">
            <div className="w-16 h-16 bg-[#d4f000] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="font-black text-[#0d0d0d] text-xl">
                {(profile.firstName[0] ?? "U")}{(profile.lastName[0] ?? "")}
              </span>
            </div>
            <div className="font-extrabold text-[#0d0d0d] text-sm">{profile.firstName} {profile.lastName}</div>
            <div className="text-xs text-gray-400 mt-0.5">{profile.email}</div>
            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              Loyalty Member · 2,450 pts
            </div>
          </div>

          <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {sidebarTabs.map(({ id, icon: Icon, label, badge }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                  tab === id
                    ? "bg-[#0d0d0d] text-[#d4f000]"
                    : "text-gray-600 hover:bg-[#f4f4f4] hover:text-[#0d0d0d]"
                }`}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    tab === id ? "bg-[#d4f000] text-[#0d0d0d]" : "bg-gray-200 text-gray-600"
                  }`}>{badge}</span>
                )}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {signingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing Out…
                </>
              ) : (
                <><LogOut size={15} /> Sign Out</>
              )}
            </button>
          </nav>
        </aside>

        {/* ── Main Content ──────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Sign out error toast */}
          {signOutError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {signOutError}
              <button onClick={() => setSignOutError("")} className="ml-auto text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Mobile tab pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {sidebarTabs.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === id ? "bg-[#0d0d0d] text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── DASHBOARD ──────────────────────────────────── */}
          {tab === "dashboard" && (
            <div className="space-y-4">
              {/* Welcome + stats */}
              <div className="bg-[#0d0d0d] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #d4f000 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Welcome back,</p>
                    <h1 className="text-2xl font-extrabold text-white">{profile.firstName} {profile.lastName} 👋</h1>
                    <p className="text-gray-500 text-xs mt-1">Member since January 2024</p>
                  </div>
                  <div className="bg-[#d4f000]/10 border border-[#d4f000]/20 rounded-2xl px-5 py-3 text-center">
                    <div className="text-[#d4f000] font-black text-2xl">2,450</div>
                    <div className="text-gray-500 text-xs">Loyalty Points</div>
                    <div className="text-[#d4f000] text-[10px] font-semibold mt-0.5">= $24.50 credit</div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Package,    label: "Total Orders",   value: "3",  color: "text-blue-500" },
                  { icon: Heart,      label: "Wishlist Items", value: String(WISHLIST_ITEMS.length), color: "text-red-500" },
                  { icon: Truck,      label: "In Transit",     value: "1",  color: "text-orange-500" },
                  { icon: RotateCcw,  label: "Returns",        value: "0",  color: "text-gray-400" },
                ].map(({ icon: Icon, label: l, value, color }) => (
                  <div key={l} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <Icon size={20} className={`${color} mx-auto mb-2`} />
                    <div className="font-extrabold text-[#0d0d0d] text-xl">{value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>

              {/* Recent order */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-[#0d0d0d]">Recent Order</h3>
                  <button onClick={() => setTab("orders")} className="text-xs font-bold text-gray-400 hover:text-[#0d0d0d]">View all →</button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#f9f9f9] rounded-xl">
                  <div>
                    <div className="font-extrabold text-[#0d0d0d] text-sm">{SAMPLE_ORDERS[0].id}</div>
                    <div className="text-xs text-gray-400">{SAMPLE_ORDERS[0].date}</div>
                  </div>
                  <Badge variant={STATUS_STYLES[SAMPLE_ORDERS[0].status].variant} size="sm" dot>
                    {STATUS_STYLES[SAMPLE_ORDERS[0].status].label}
                  </Badge>
                  <div className="font-extrabold text-[#0d0d0d]">${SAMPLE_ORDERS[0].total.toFixed(2)}</div>
                  <button onClick={() => setTab("orders")} className="text-xs font-bold text-[#0d0d0d] border-2 border-gray-200 px-3 py-1.5 rounded-xl hover:border-[#0d0d0d] transition-all">
                    View Details
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Package, label: "Track My Order", sub: "Check order status & tracking", tab: "orders" as Tab },
                  { icon: Heart,   label: "My Wishlist",    sub: `${WISHLIST_ITEMS.length} saved items`,     tab: "wishlist" as Tab },
                  { icon: Car,     label: "Saved Vehicles", sub: "Find parts for your cars",   tab: "vehicles" as Tab },
                  { icon: MapPin,  label: "Addresses",      sub: "Manage shipping addresses",    tab: "addresses" as Tab },
                ].map(({ icon: Icon, label: l, sub, tab: t }) => (
                  <button key={l} onClick={() => setTab(t)}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#d4f000] hover:shadow-sm transition-all text-left">
                    <div className="w-10 h-10 bg-[#f4f4f4] rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#0d0d0d]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0d0d0d] text-sm">{l}</div>
                      <div className="text-xs text-gray-400">{sub}</div>
                    </div>
                    <ChevronRight size={15} className="ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ORDERS ─────────────────────────────────────── */}
          {tab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#0d0d0d]">My Orders</h2>
              {SAMPLE_ORDERS.map((order) => {
                const st = STATUS_STYLES[order.status];
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="font-extrabold text-[#0d0d0d]">{order.id}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Placed {order.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={st.variant} size="sm" dot>{st.label}</Badge>
                        <span className="font-extrabold text-[#0d0d0d]">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      {order.items.map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                            <Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${p.slug}`} className="text-sm font-bold text-[#0d0d0d] hover:text-gray-600 line-clamp-1">{p.name}</Link>
                            <div className="text-xs text-gray-400">{p.brand} · SKU: {p.sku}</div>
                          </div>
                          <span className="text-sm font-extrabold text-[#0d0d0d] shrink-0">${p.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.tracking && (
                        <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl font-semibold">
                          <Truck size={12} /> {order.tracking}
                        </div>
                      )}
                      <button className="text-xs font-bold border-2 border-gray-200 text-[#0d0d0d] px-3 py-1.5 rounded-xl hover:border-[#0d0d0d] transition-all">
                        View Invoice
                      </button>
                      {order.status === "delivered" && (
                        <button className="text-xs font-bold border-2 border-gray-200 text-[#0d0d0d] px-3 py-1.5 rounded-xl hover:border-[#0d0d0d] transition-all flex items-center gap-1">
                          <RotateCcw size={11} /> Return Item
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── WISHLIST ───────────────────────────────────── */}
          {tab === "wishlist" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-[#0d0d0d]">Wishlist ({WISHLIST_ITEMS.length})</h2>
                <Link href="/shop" className="text-sm font-bold text-gray-400 hover:text-[#0d0d0d]">Add more →</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {WISHLIST_ITEMS.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:border-[#d4f000] transition-all group">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <Image src={p.thumbnail} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">{p.brand}</div>
                      <Link href={`/products/${p.slug}`} className="text-sm font-bold text-[#0d0d0d] hover:text-gray-600 line-clamp-2 leading-snug">{p.name}</Link>
                      <StarRating rating={p.rating} size={11} className="mt-1" />
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-[#0d0d0d]">${p.price.toFixed(2)}</span>
                        <Link href={`/products/${p.slug}`} className="text-xs font-bold bg-[#d4f000] text-[#0d0d0d] px-3 py-1.5 rounded-lg hover:bg-[#c4e000] transition-colors">
                          Add to Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROFILE ────────────────────────────────────── */}
          {tab === "profile" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-[#0d0d0d]">Profile Information</h2>
                {!editingProfile ? (
                  <button onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-1.5 text-sm font-bold border-2 border-gray-200 px-4 py-2 rounded-xl hover:border-[#0d0d0d] transition-all">
                    <Edit2 size={13} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProfile(false)} className="text-sm font-bold border-2 border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-all">Cancel</button>
                    <button onClick={saveProfile} className="flex items-center gap-1.5 text-sm font-bold bg-[#d4f000] text-[#0d0d0d] px-4 py-2 rounded-xl hover:bg-[#c4e000] transition-all">
                      <Check size={13} /> Save
                    </button>
                  </div>
                )}
              </div>

              {profileSaved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <Check size={15} /> Profile saved successfully!
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name", key: "firstName" as const },
                  { label: "Last Name",  key: "lastName"  as const },
                  { label: "Email",      key: "email"     as const },
                  { label: "Phone",      key: "phone"     as const },
                ].map(({ label: l, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{l}</label>
                    {editingProfile ? (
                      <input value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} className={inputCls} />
                    ) : (
                      <div className="text-sm font-semibold text-[#0d0d0d] bg-[#f9f9f9] rounded-xl px-4 py-3">{profile[key]}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-extrabold text-[#0d0d0d] mb-3">Security</h3>
                <button className="flex items-center gap-2 text-sm font-bold border-2 border-gray-200 px-4 py-2.5 rounded-xl hover:border-[#0d0d0d] transition-all">
                  <Shield size={14} /> Change Password
                </button>
              </div>
            </div>
          )}

          {/* ── ADDRESSES ──────────────────────────────────── */}
          {tab === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-[#0d0d0d]">Saved Addresses</h2>
                <button className="flex items-center gap-1.5 text-sm font-bold bg-[#d4f000] text-[#0d0d0d] px-4 py-2.5 rounded-xl hover:bg-[#c4e000] transition-colors">
                  <Plus size={14} /> Add Address
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Home", address: "123 Main Street, Detroit, MI 48201", default: true },
                  { label: "Work", address: "4821 Industrial Blvd, Detroit, MI 48210", default: false },
                ].map(({ label: l, address, default: isDefault }) => (
                  <div key={l} className="bg-white rounded-2xl border-2 border-gray-100 p-5 relative">
                    {isDefault && (
                      <span className="absolute top-3 right-3 bg-[#d4f000] text-[#0d0d0d] text-[9px] font-extrabold px-2 py-0.5 rounded-full">DEFAULT</span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-[#0d0d0d]" />
                      <span className="font-extrabold text-[#0d0d0d] text-sm">{l}</span>
                    </div>
                    <p className="text-sm text-gray-600">{address}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-all">Edit</button>
                      {!isDefault && <button className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-all">Set Default</button>}
                      {!isDefault && <button className="text-xs font-bold text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">Remove</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SAVED VEHICLES ─────────────────────────────── */}
          {tab === "vehicles" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-[#0d0d0d]">Saved Vehicles</h2>
                <button onClick={() => setShowVehicleForm(true)}
                  className="flex items-center gap-1.5 text-sm font-bold bg-[#d4f000] text-[#0d0d0d] px-4 py-2.5 rounded-xl hover:bg-[#c4e000]">
                  <Plus size={14} /> Add Vehicle
                </button>
              </div>

              {/* Vehicle cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-[#d4f000] transition-all relative">
                    {v.isPrimary && (
                      <span className="absolute top-3 right-3 bg-[#d4f000] text-[#0d0d0d] text-[9px] font-extrabold px-2 py-0.5 rounded-full">PRIMARY</span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#0d0d0d] rounded-xl flex items-center justify-center">
                        <Car size={18} className="text-[#d4f000]" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[#0d0d0d] text-sm">{v.nickname}</div>
                        <div className="text-xs text-gray-500">{v.year} {v.make} {v.model}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/shop?make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(v.model)}&year=${v.year}`}
                        className="text-xs font-bold bg-[#f4f4f4] text-[#0d0d0d] px-3 py-1.5 rounded-lg hover:bg-[#d4f000]/20 transition-colors">
                        Find Parts
                      </Link>
                      {!v.isPrimary && (
                        <button onClick={() => setVehicles(prev => prev.map(vv => ({...vv, isPrimary: vv.id === v.id})))}
                          className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[#0d0d0d] transition-all">
                          Set Primary
                        </button>
                      )}
                      <button onClick={() => setVehicles(prev => prev.filter(vv => vv.id !== v.id))}
                        className="text-xs font-bold text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 ml-auto transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add vehicle form */}
              {showVehicleForm && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-[#0d0d0d]">Add New Vehicle</h3>
                    <button onClick={() => setShowVehicleForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[["Nickname","nickname","e.g. My Daily Driver"],["Make","make","Toyota"],["Model","model","Camry"],["Year","year","2022"]].map(([lbl,key,ph]) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{lbl}</label>
                        <input value={newVehicle[key as keyof typeof newVehicle]} onChange={e=>setNewVehicle(p=>({...p,[key]:e.target.value}))}
                          placeholder={ph} className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]"/>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowVehicleForm(false)} className="flex-1 border-2 border-gray-200 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
                    <button onClick={() => {
                      if (newVehicle.make && newVehicle.model && newVehicle.year) {
                        setVehicles(prev => [...prev, { id:`v${Date.now()}`, ...newVehicle, isPrimary: prev.length === 0 }]);
                        setNewVehicle({ make:"", model:"", year:"", nickname:"" });
                        setShowVehicleForm(false);
                      }
                    }} className="flex-1 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-2.5 rounded-xl text-sm hover:bg-[#c4e000]">
                      Save Vehicle
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── NOTIFICATIONS ──────────────────────────────── */}
          {tab === "notifications" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-[#0d0d0d]">Notifications</h2>
                  {unreadCount > 0 && <p className="text-sm text-gray-500">{unreadCount} unread</p>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-sm font-bold text-gray-400 hover:text-[#0d0d0d] transition-colors">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                    <Bell size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No notifications yet.</p>
                  </div>
                ) : notifications.map((n) => {
                  const TYPE_COLORS: Record<string,string> = {
                    order:"bg-blue-100 text-blue-700", promotion:"bg-yellow-100 text-yellow-700",
                    system:"bg-gray-100 text-gray-600", inventory:"bg-orange-100 text-orange-700",
                  };
                  return (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      className={`flex gap-4 bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${n.isRead ? "border-gray-100 opacity-70" : "border-[#d4f000]/40 shadow-sm"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[n.type] ?? "bg-gray-100"}`}>
                        <Bell size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-[#0d0d0d] text-sm">{n.title}</div>
                          {!n.isRead && <div className="w-2 h-2 bg-[#d4f000] rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5">{n.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SETTINGS ───────────────────────────────────── */}
          {tab === "settings" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <h2 className="text-xl font-extrabold text-[#0d0d0d] pb-4 border-b border-gray-100">Account Settings</h2>
              {[
                { label: "Order updates", sub: "Get notified when your order ships or is delivered" },
                { label: "Promotional emails", sub: "Deals, new arrivals, and exclusive member offers" },
                { label: "Wishlist reminders", sub: "Be reminded when items on your wishlist go on sale" },
                { label: "Newsletter", sub: "Weekly automotive tips and product guides" },
              ].map(({ label: l, sub }, i) => {
                const on = notifSettings[i];
                const toggle = () =>
                  setNotifSettings((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
                return (
                  <div key={l} className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[#0d0d0d] flex items-center gap-2">
                        <Bell size={14} className="text-gray-400" /> {l}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                    </div>
                    <button
                      onClick={toggle}
                      aria-pressed={on}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-[#0d0d0d]" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                );
              })}
              <div className="pt-4 border-t border-gray-100">
                <button className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

