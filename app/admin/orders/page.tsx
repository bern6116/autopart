import type { Metadata } from "next";
import AdminOrdersClient from "@/components/admin/orders/AdminOrdersClient";
export const metadata: Metadata = { title: "Orders — Admin" };
export default function AdminOrdersPage() { return <AdminOrdersClient />; }
