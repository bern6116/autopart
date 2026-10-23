/**
 * BrandLogo — reusable AUTO CORE logo image.
 *
 * Uses /Logo/AUTOPARTLOGO.png from public/.
 * object-contain, no recoloring, no cropping, transparency preserved.
 *
 * size="nav"    → 36 px tall  (navbar / sidebar)
 * size="auth"   → 56 px tall  (login / register)
 * size="admin"  → 40 px tall  (admin sidebar / login)
 *
 * We use width={0} + explicit CSS height/width so Next.js Image does not
 * emit a "width or height modified" console warning from conflicting
 * width/height attributes vs style overrides.
 */

import Image from "next/image";

type LogoSize = "nav" | "auth" | "admin";

const SIZE_MAP: Record<LogoSize, number> = {
  nav:   36,
  auth:  56,
  admin: 40,
};

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
  /** Provide an explicit aria-label only when the logo is the sole accessible name of its parent link. */
  alt?: string;
}

export default function BrandLogo({
  size = "nav",
  className = "",
  alt = "Auto Core logo",
}: BrandLogoProps) {
  const h = SIZE_MAP[size];
  return (
    <Image
      src="/Logo/AUTOPARTLOGO.png"
      alt={alt}
      // width={0} + CSS height lets the image scale to its natural
      // aspect ratio without triggering the Next.js dimension-mismatch warning.
      width={0}
      height={0}
      className={`object-contain ${className}`}
      style={{ height: h, width: "auto" }}
      priority
      unoptimized
    />
  );
}
