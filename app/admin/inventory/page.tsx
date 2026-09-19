import type { Metadata } from "next";
import AdminInventoryClient from "@/components/admin/inventory/AdminInventoryClient";
export const metadata: Metadata = { title: "Inventory — Admin" };
export default function AdminInventoryPage() { return <AdminInventoryClient />; }
