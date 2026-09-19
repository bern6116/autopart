import type { Metadata } from "next";
import AdminDashboardClient from "@/components/admin/dashboard/AdminDashboardClient";
export const metadata: Metadata = { title: "Dashboard — Admin" };
export default function AdminDashboardPage() { return <AdminDashboardClient />; }
