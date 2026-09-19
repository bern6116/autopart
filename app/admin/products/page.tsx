import type { Metadata } from "next";
import AdminProductsClient from "@/components/admin/products/AdminProductsClient";
export const metadata: Metadata = { title: "Products — Admin" };
export default function AdminProductsPage() { return <AdminProductsClient />; }
