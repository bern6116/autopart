import type { Metadata } from "next";
import AdminCategoriesClient from "@/components/admin/categories/AdminCategoriesClient";
export const metadata: Metadata = { title: "Categories — Admin" };
export default function AdminCategoriesPage() { return <AdminCategoriesClient />; }
