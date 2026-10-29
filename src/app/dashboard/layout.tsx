import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isAuthConfigured } from "@/lib/server/auth";
import { AccessGate } from "@/components/forms/portal-ui";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consultant workspace", robots: { index: false, follow: false } };
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (isAuthConfigured()) {
    const user = await getCurrentUser();
    if (!user) return <div className="container"><AccessGate session={{ user: null, configured: true, loading: false, error: null }}>{null}</AccessGate></div>;
    if (!["ADMIN", "CONSULTANT"].includes(user.role)) redirect("/my-questions");
  }
  return children;
}
