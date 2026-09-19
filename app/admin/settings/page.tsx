import type { Metadata } from "next";
import AdminSettingsClient from "@/components/admin/settings/AdminSettingsClient";
export const metadata: Metadata = { title: "Settings — Admin" };
export default function AdminSettingsPage() { return <AdminSettingsClient />; }
