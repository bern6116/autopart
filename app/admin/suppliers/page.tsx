import type { Metadata } from "next";
import AdminSuppliersClient from "@/components/admin/suppliers/AdminSuppliersClient";
export const metadata: Metadata = { title: "Suppliers — Admin" };
export default function AdminSuppliersPage() { return <AdminSuppliersClient />; }
