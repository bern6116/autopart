"use client";
import { useState } from "react";
import { Download, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import { dashboardStats, adminOrders, adminProducts, MONTHS } from "@/lib/admin-data";

type DateRange = "today"|"week"|"month"|"year"|"custom";

const MAX_REV = Math.max(...dashboardStats.monthly_revenue.filter(Boolean));

const PRODUCT_SALES = [
  { name:"Bosch Brake Pads", category:"Brakes",  sold:142, revenue:6104.58, cost:3124.00, profit:2980.58 },
  { name:"NGK Iridium Plugs",category:"Engine",  sold:98,  revenue:1469.02, cost:686.00,  profit:783.02 },
  { name:"K&N Air Filter",   category:"Filters", sold:76,  revenue:4179.24, cost:2128.00, profit:2051.24 },
  { name:"Monroe Strut",     category:"Susp.",   sold:54,  revenue:7019.46, cost:4050.00, profit:2969.46 },
  { name:"Brembo Rotor",     category:"Brakes",  sold:49,  revenue:4654.51, cost:2695.00, profit:1959.51 },
  { name:"ACDelco Belt",     category:"Engine",  sold:41,  revenue:1024.59, cost:492.00,  profit:532.59 },
];

export default function AdminReportsClient() {
  const [range, setRange] = useState<DateRange>("month");
  const [tab, setTab] = useState<"sales"|"inventory"|"profit"|"customers">("sales");

  const totalRevenue = dashboardStats.monthly_revenue.reduce((a,b)=>a+b,0);
  const totalOrders  = adminOrders.length;
  const paidRevenue  = adminOrders.filter(o=>o.payment_status==="paid").reduce((s,o)=>s+o.total,0);

  const handleExport = () => {
    const csvData = PRODUCT_SALES.map(r => `${r.name},${r.sold},${r.revenue},${r.profit}`).join("\n");
    const blob = new Blob([`Product,Sold,Revenue,Profit\n${csvData}`], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "autocore-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[#0d0d0d]">Reports</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(["today","week","month","year"] as DateRange[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${range===r?"bg-[#0d0d0d] text-white":"text-gray-600 hover:text-[#0d0d0d]"}`}>{r}</button>
            ))}
          </div>
          <button onClick={handleExport} className="flex items-center gap-1.5 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-4 py-2 rounded-xl hover:bg-[#c4e000] text-sm">
            <Download size={14}/>Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total Revenue",   value:`$${totalRevenue.toLocaleString("en-US",{maximumFractionDigits:0})}`, icon:DollarSign, cls:"bg-green-50 text-green-600" },
          { label:"Total Orders",    value:String(totalOrders),                                                     icon:ShoppingCart, cls:"bg-blue-50 text-blue-600" },
          { label:"Products Sold",   value:String(PRODUCT_SALES.reduce((s,p)=>s+p.sold,0)),                       icon:Package, cls:"bg-orange-50 text-orange-600" },
          { label:"Gross Profit",    value:`$${PRODUCT_SALES.reduce((s,p)=>s+p.profit,0).toLocaleString("en-US",{maximumFractionDigits:0})}`, icon:TrendingUp, cls:"bg-purple-50 text-purple-600" },
        ].map(({ label, value, icon:Icon, cls }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cls}`}><Icon size={14}/></div>
            </div>
            <div className="text-2xl font-extrabold text-[#0d0d0d]">{value}</div>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {(["sales","inventory","profit","customers"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab===t?"bg-[#0d0d0d] text-white":"text-gray-600 hover:text-[#0d0d0d]"}`}>{t}</button>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-[#0d0d0d]">Monthly Revenue 2024</h2>
          <span className="text-sm text-gray-500 font-semibold">Total: <span className="text-[#0d0d0d] font-extrabold">${totalRevenue.toLocaleString()}</span></span>
        </div>
        <div className="flex items-end gap-2 h-48">
          {dashboardStats.monthly_revenue.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {v > 0 && (
                <div className="absolute -top-7 hidden group-hover:block bg-[#0d0d0d] text-[#d4f000] text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
                  ${v.toLocaleString()}
                </div>
              )}
              <div className={`w-full rounded-t-lg transition-all cursor-pointer ${v > 0 ? "bg-[#d4f000] hover:bg-[#c4e000]" : "bg-gray-100"}`}
                style={{ height: v > 0 ? `${Math.round((v/MAX_REV)*180)}px` : "4px" }} />
              <span className="text-[9px] text-gray-400 font-medium">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product performance table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-extrabold text-[#0d0d0d]">Product Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f9f9f9] border-b border-gray-100">
              {["Product","Category","Units Sold","Revenue","Cost","Gross Profit","Margin"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {PRODUCT_SALES.map(r => {
                const margin = (r.profit / r.revenue) * 100;
                return (
                  <tr key={r.name} className="hover:bg-[#f9f9f9]">
                    <td className="px-4 py-3 font-bold text-[#0d0d0d]">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.category}</td>
                    <td className="px-4 py-3 font-bold">{r.sold}</td>
                    <td className="px-4 py-3 font-extrabold text-[#0d0d0d]">${r.revenue.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3 text-gray-500">${r.cost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3 font-extrabold text-green-600">${r.profit.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-green-500 rounded-full" style={{ width:`${margin}%` }} />
                        </div>
                        <span className="text-xs font-bold text-green-600">{margin.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order status breakdown */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-extrabold text-[#0d0d0d] mb-4">Order Status Breakdown</h2>
          {["delivered","shipped","processing","pending","cancelled"].map(s => {
            const count = adminOrders.filter(o=>o.status===s).length;
            const pct = (count / adminOrders.length) * 100;
            return (
              <div key={s} className="flex items-center gap-3 mb-2.5">
                <span className="text-xs font-semibold text-gray-600 w-20 capitalize">{s}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-[#d4f000] rounded-full" style={{ width:`${pct}%` }} />
                </div>
                <span className="text-xs font-extrabold text-[#0d0d0d] w-5">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-extrabold text-[#0d0d0d] mb-4">Payment Methods</h2>
          {["card","online","cash","cod"].map(m => {
            const count = adminOrders.filter(o=>o.payment_method===m).length;
            const rev = adminOrders.filter(o=>o.payment_method===m&&o.payment_status==="paid").reduce((s,o)=>s+o.total,0);
            return (
              <div key={m} className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold capitalize text-gray-700 uppercase">{m}</span>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#0d0d0d]">${rev.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-400">{count} orders</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
