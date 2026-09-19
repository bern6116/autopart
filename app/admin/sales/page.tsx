import type { Metadata } from "next";
import AdminSalesClient from "@/components/admin/sales/AdminSalesClient";
export const metadata: Metadata = { title: "Sales / POS — Admin" };
export default function AdminSalesPage() { return <AdminSalesClient />; }
