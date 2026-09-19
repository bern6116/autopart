import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route protection ──────────────────────────────────────────
// /admin/*  → requires admin_auth cookie (set on admin login)
// /account  → Supabase session is stored in localStorage (client-side only).
//             The proxy cannot read localStorage, so we let /account through
//             and rely on the AccountClient component itself to check auth
//             and redirect to /login if there is no session.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ─────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminAuth = request.cookies.get("admin_auth")?.value;
    if (!adminAuth) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // /account is protected client-side by AccountClient — see components/account/AccountClient.tsx
  // The Supabase JS client uses localStorage for sessions which is inaccessible in middleware,
  // so we handle auth checks inside the client component instead.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
