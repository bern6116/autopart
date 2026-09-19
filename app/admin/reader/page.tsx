import type { Metadata } from "next";
import AdminReaderClient from "@/components/admin/reader/AdminReaderClient";

export const metadata: Metadata = {
  title: "Barcode & QR Reader — Admin",
  description: "Scan automotive parts barcodes to check inventory, manage stock, or add to sale.",
};

export default function AdminReaderPage() {
  return <AdminReaderClient />;
}
