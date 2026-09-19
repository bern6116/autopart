import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free Auto Core account and start shopping.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
