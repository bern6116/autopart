"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Client-side guard that redirects the signed-in admin away from
 * customer-facing pages to /admin/dashboard.
 *
 * Only the specific admin user (matching NEXT_PUBLIC_ADMIN_USER_ID)
 * with role = 'super_admin' and is_active = true is redirected.
 * This prevents redirect loops when the proxy also enforces the
 * same UUID check server-side.
 *
 * When NEXT_PUBLIC_ADMIN_USER_ID is not set, falls back to checking
 * role = 'super_admin' + is_active from the profile.
 */

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? "";

const CUSTOMER_ROUTES = [
  "/", "/shop", "/products", "/categories", "/brands",
  "/cart", "/checkout", "/account", "/track", "/support",
  "/about", "/guides", "/login", "/register", "/forgot-password",
];

function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!profile || !profile.is_active || profile.role !== "super_admin") return;
    // When ADMIN_USER_ID is configured, only that exact UUID may redirect.
    if (ADMIN_USER_ID && user?.id !== ADMIN_USER_ID) return;
    if (!isCustomerRoute(pathname)) return;
    router.replace("/admin/dashboard");
  }, [pathname, profile, user, loading, router]);

  return <>{children}</>;
}
