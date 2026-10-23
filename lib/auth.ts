import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";

export const STAFF_ROLES: readonly UserRole[] = ["super_admin", "admin", "manager", "inventory_staff", "cashier"];
export const ADMIN_ROLES: readonly UserRole[] = ["super_admin", "admin", "manager", "inventory_staff"];

export function isStaffRole(role: string | null | undefined): role is UserRole {
  return Boolean(role && STAFF_ROLES.includes(role as UserRole));
}

/** Only super_admin is permitted to reach the admin dashboard. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "super_admin";
}

export function safeInternalPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "http://autocore.local");
    return url.origin === "http://autocore.local" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch { return fallback; }
}

export function destinationFor(profile: Profile, requested: string | null) {
  if (isAdminRole(profile.role) && profile.is_active) {
    const safe = safeInternalPath(requested, "/admin/dashboard");
    return safe.startsWith("/admin") ? safe : "/admin/dashboard";
  }
  const safe = safeInternalPath(requested, "/account");
  return safe.startsWith("/admin") ? "/account" : safe;
}

export type AuthSnapshot = { user: User | null; profile: Profile | null; loading: boolean; error: string | null };
