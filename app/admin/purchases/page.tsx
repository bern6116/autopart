import type { Metadata } from "next";
import AdminPurchasesClient from "@/components/admin/purchases/AdminPurchasesClient";
export const metadata: Metadata = { title: "Purchases — Admin" };
export default function AdminPurchasesPage() { return <AdminPurchasesClient />; }
