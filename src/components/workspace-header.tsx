"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ArrowUpRight, LogOut } from "lucide-react";
import { Brand } from "./site-header";
import { usePortalSession } from "./forms/portal-client";
import styles from "./workspace-header.module.css";

const links = [
  { href: "/dashboard", label: "Questions" },
  { href: "/dashboard/consultations", label: "Sessions" },
  { href: "/dashboard/content", label: "Content library" },
];

export function WorkspaceHeader() {
  const pathname = usePathname();
  const session = usePortalSession();
  const staff = session.user && ["ADMIN", "CONSULTANT"].includes(session.user.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = session.user?.role === "ADMIN" ? [...links, {href:"/dashboard/users",label:"Users & consultants"}, {href:"/dashboard/governance",label:"Oversight"}] : links;
  async function logout() {
    setBusy(true); setError(null);
    try { await signOut({ callbackUrl: "/sign-in" }); }
    catch { setError("Could not sign out. Please try again."); setBusy(false); }
  }
  return <header className={styles.header}>
    <div className={`container ${styles.top}`}>
      <div className={styles.identity}><Brand href="/dashboard" label="InvestMentor workspace"/><span className={styles.badge}>{staff && session.user?.role === "ADMIN" ? "Admin workspace" : "Consultant workspace"}</span></div>
      <div className={styles.actions}>
        <Link href="/" className="text-link">View public website <ArrowUpRight size={15}/></Link>
        {staff && <details className={styles.account} key={pathname}><summary>Account</summary><div className={styles.accountPanel}>
          <span className="eyebrow">{session.user?.role === "ADMIN" ? "Administrator" : "Consultant"}</span>
          <p>{session.user?.email}</p>
          <button type="button" className="button button-secondary button-small" disabled={busy} onClick={logout}><LogOut size={15}/>{busy ? "Signing out…" : "Sign out"}</button>
          {error && <p role="alert">{error}</p>}
        </div></details>}
      </div>
    </div>
    {staff && <nav className={`container ${styles.navigation}`} aria-label="Workspace navigation">
      {navigation.map(link => {
        const active = link.href === "/dashboard" ? pathname === link.href || pathname.startsWith("/dashboard/questions/") : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>{link.label}</Link>;
      })}
    </nav>}
  </header>;
}
