import { redirect } from "next/navigation";

/**
 * /admin/login has been unified into the shared /login page.
 * This route now redirects there so existing bookmarks and links
 * still work. All authentication (password, OTP, Google OAuth)
 * happens at /login with the same authorization checks.
 */
export default function AdminLoginRedirect() {
  redirect("/login");
}
