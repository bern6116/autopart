import type { OrderStatus, ProductStatus, PurchaseStatus, SupplierStatus, CustomerStatus } from "@/types/database";

type AnyStatus = OrderStatus | ProductStatus | PurchaseStatus | SupplierStatus | CustomerStatus | string;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // Order
  pending:    { label: "Pending",    cls: "bg-yellow-100 text-yellow-800" },
  confirmed:  { label: "Confirmed",  cls: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", cls: "bg-indigo-100 text-indigo-800" },
  ready:      { label: "Ready",      cls: "bg-purple-100 text-purple-800" },
  shipped:    { label: "Shipped",    cls: "bg-cyan-100 text-cyan-800" },
  delivered:  { label: "Delivered",  cls: "bg-green-100 text-green-800" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-100 text-red-800" },
  refunded:   { label: "Refunded",   cls: "bg-gray-200 text-gray-700" },
  // Product
  active:     { label: "Active",     cls: "bg-green-100 text-green-800" },
  inactive:   { label: "Inactive",   cls: "bg-gray-200 text-gray-600" },
  out_of_stock:{ label:"Out of Stock",cls: "bg-red-100 text-red-700" },
  // Purchase
  draft:      { label: "Draft",      cls: "bg-gray-200 text-gray-600" },
  ordered:    { label: "Ordered",    cls: "bg-blue-100 text-blue-700" },
  partial:    { label: "Partial",    cls: "bg-orange-100 text-orange-700" },
  received:   { label: "Received",   cls: "bg-green-100 text-green-700" },
  // Other
  suspended:  { label: "Suspended",  cls: "bg-orange-100 text-orange-700" },
  blocked:    { label: "Blocked",    cls: "bg-red-100 text-red-700" },
  paid:       { label: "Paid",       cls: "bg-green-100 text-green-700" },
  failed:     { label: "Failed",     cls: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: AnyStatus }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
