import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 Proxy (formerly "middleware").
 *
 * Server-side route protection that runs before any page renders.
 *
 * Routing rules (in order):
 *
 *   1. /admin/login → /login (unified login)
 *   2. No session  + /admin/*            → /login
 *   3. Session + user is admin + customer route → /admin/dashboard
 *   4. Session + user is NOT admin + /admin/*    → /account
 *   5. Session + /login | /register               → /account
 *
 * "Admin" is determined by the NEXT_PUBLIC_ADMIN_USER_ID env var
 * (the specific Supabase Auth user UUID permitted to access /admin/*).
 * When that var is not set, the proxy falls back to checking only
 * session presence for /admin/* protection, and the client-side
 * AdminLayout gate enforces role = 'super_admin' + is_active.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? "";

// Customer-facing routes where the admin should be bounced to the dashboard.
const CUSTOMER_ROUTES = [
  "/", "/shop", "/products", "/categories", "/brands",
  "/cart", "/checkout", "/account", "/track", "/support",
  "/about", "/guides", "/login", "/register", "/forgot-password",
];

function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // 1. /admin/login → /login (unified login page)
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Determine whether the authenticated user is the permitted admin.
  // When ADMIN_USER_ID is set, only that exact UUID is treated as admin.
  const isAdmin =
    !!session && !!ADMIN_USER_ID && session.user.id === ADMIN_USER_ID;

  // 2. No session + /admin/* → /login
  if (!session && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session) {
    // 3. Admin on a customer route → /admin/dashboard
    if (isAdmin && isCustomerRoute(pathname)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // 4. Non-admin on /admin/* → /account (when admin lock is active)
    if (!isAdmin && ADMIN_USER_ID && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/account", request.url));
    }

    // 5. Authenticated on /login or /register → /account
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|css|js|map)$).*)",
  ],
};
