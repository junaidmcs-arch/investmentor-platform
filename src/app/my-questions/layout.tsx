import type { Metadata } from "next";
import { getCurrentUser, isAuthConfigured } from "@/lib/server/auth";
import { AccessGate } from "@/components/forms/portal-ui";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Investor workspace", robots: { index: false, follow: false } };
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  if (isAuthConfigured() && !await getCurrentUser()) return <div className="container"><AccessGate session={{ user: null, configured: true, loading: false, error: null }}>{null}</AccessGate></div>;
  return children;
}
