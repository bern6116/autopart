"use client";
import Link from "next/link";
import {
  Package, DollarSign, AlertTriangle, ShoppingCart,
  TrendingUp, Users, BarChart2, ArrowUpRight, ArrowRight,
} from "lucide-react";
import { dashboardStats, adminOrders, adminProducts, MONTHS } from "@/lib/admin-data";
import StatusBadge from "@/components/admin/StatusBadge";

const STAT_CARDS = [
  { label: "Total Products",    value: dashboardStats.total_products.toLocaleString(),             icon: Package,       sub: "486 active",              color: "bg-blue-50 text-blue-600" },
  { label: "Inventory Value",   value: `$${dashboardStats.inventory_value.toLocaleString("en-US",{minimumFractionDigits:2})}`, icon: DollarSign, sub: "+5.2% this month", color: "bg-green-50 text-green-600" },
  { label: "Low Stock Items",   value: String(dashboardStats.low_stock_count),                     icon: AlertTriangle, sub: "Need reorder",            color: "bg-orange-50 text-orange-600" },
  { label: "Out of Stock",      value: String(dashboardStats.out_of_stock_count),                  icon: Package,       sub: "Urgent action needed",     color: "bg-red-50 text-red-600" },
  { label: "Today's Sales",     value: `$${dashboardStats.today_sales.toLocaleString()}`,          icon: TrendingUp,    sub: "12 transactions",          color: "bg-[#d4f000]/20 text-[#6b7a00]" },
  { label: "Monthly Sales",     value: `$${dashboardStats.monthly_sales.toLocaleString()}`,        icon: BarChart2,     sub: "+18% vs last month",       color: "bg-purple-50 text-purple-600" },
  { label: "Pending Orders",    value: String(dashboardStats.pending_orders),                      icon: ShoppingCart,  sub: "Awaiting processing",      color: "bg-yellow-50 text-yellow-600" },
  { label: "Total Customers",   value: dashboardStats.total_customers.toLocaleString(),            icon: Users,         sub: "+43 this month",           color: "bg-indigo-50 text-indigo-600" },
];

const LOW_STOCK = adminProducts.filter((p) => p.stock_quantity <= p.reorder_level).slice(0, 6);
const RECENT_ORDERS = adminOrders.slice(0, 6);
const maxRev = Math.max(...dashboardStats.monthly_revenue.filter(Boolean));

export default function AdminDashboardClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d0d0d]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Daniel. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="text-xs text-gray-400 bg-white border border-gray-200 rounded-xl px-3 py-2">
          {new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={15} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0d0d0d] leading-none">{value}</div>
            <div className="text-[11px] text-gray-400 mt-1.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue Chart (CSS bars — no library needed) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-extrabold text-[#0d0d0d]">Monthly Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">January – October 2024</p>
            </div>
            <div className="bg-[#d4f000]/10 text-[#0d0d0d] text-xs font-bold px-3 py-1.5 rounded-full">2024</div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {dashboardStats.monthly_revenue.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${v > 0 ? "bg-[#d4f000]" : "bg-gray-100"}`}
                  style={{ height: v > 0 ? `${Math.round((v / maxRev) * 140)}px` : "4px" }}
                />
                <span className="text-[9px] text-gray-400 font-medium">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#d4f000] inline-block" />Revenue</span>
            <span className="ml-auto font-bold text-[#0d0d0d]">
              Total: ${dashboardStats.monthly_revenue.reduce((a,b)=>a+b,0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#0d0d0d]">Top Products</h2>
            <Link href="/admin/products" className="text-xs font-bold text-gray-400 hover:text-[#0d0d0d]">View all →</Link>
          </div>
          <div className="space-y-3">
            {dashboardStats.top_products.map(({ name, sold, revenue }, i) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#f4f4f4] rounded-lg flex items-center justify-center text-xs font-extrabold text-gray-500 shrink-0">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#0d0d0d] truncate">{name}</div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-1.5 bg-[#d4f000] rounded-full" style={{ width:`${(sold/dashboardStats.top_products[0].sold)*100}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-[#0d0d0d]">${revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400">{sold} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-extrabold text-[#0d0d0d]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-gray-400 hover:text-[#0d0d0d] flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f9f9f9]">
                <th className="px-4 py-2.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide">Order</th>
                <th className="px-4 py-2.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-2.5 text-right text-xs font-extrabold text-gray-400 uppercase tracking-wide">Total</th>
                <th className="px-4 py-2.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f9f9f9]">
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-[#0d0d0d]">{o.order_number}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{o.customer_name}</td>
                    <td className="px-4 py-2.5 text-xs font-extrabold text-[#0d0d0d] text-right">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-extrabold text-[#0d0d0d] flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Low Stock Alert
            </h2>
            <Link href="/admin/inventory" className="text-xs font-bold text-gray-400 hover:text-[#0d0d0d] flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f9f9f9]">
                <th className="px-4 py-2.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide">Product</th>
                <th className="px-4 py-2.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide">SKU</th>
                <th className="px-4 py-2.5 text-center text-xs font-extrabold text-gray-400 uppercase tracking-wide">Stock</th>
                <th className="px-4 py-2.5 text-center text-xs font-extrabold text-gray-400 uppercase tracking-wide">Reorder</th>
                <th className="px-4 py-2.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {LOW_STOCK.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f9f9f9]">
                    <td className="px-4 py-2.5 text-xs font-bold text-[#0d0d0d] max-w-[140px] truncate">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs font-extrabold ${p.stock_quantity === 0 ? "text-red-600" : "text-orange-600"}`}>{p.stock_quantity}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{p.reorder_level}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Add Product",    href:"/admin/products",   icon:Package,       color:"bg-blue-50 text-blue-700" },
          { label:"New Purchase",   href:"/admin/purchases",  icon:TrendingUp,    color:"bg-green-50 text-green-700" },
          { label:"Open POS",       href:"/admin/sales",      icon:ShoppingCart,  color:"bg-[#d4f000]/20 text-yellow-700" },
          { label:"View Reports",   href:"/admin/reports",    icon:BarChart2,     color:"bg-purple-50 text-purple-700" },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={label} href={href}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm hover:border-[#d4f000] transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
            <div>
              <div className="font-bold text-[#0d0d0d] text-sm">{label}</div>
              <div className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Go <ArrowUpRight size={10} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
