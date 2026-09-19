import type { Metadata } from "next";
import AdminCustomersClient from "@/components/admin/customers/AdminCustomersClient";
export const metadata: Metadata = { title: "Customers — Admin" };
export default function AdminCustomersPage() { return <AdminCustomersClient />; }
