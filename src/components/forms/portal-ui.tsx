"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { displayLabel, type SessionState } from "./portal-client";
import styles from "./portal.module.css";

export function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: ReactNode }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children}{hint && <span className={styles.help}>{hint}</span>}</div>;
}

export function ErrorMessage({ message }: { message: string | null }) {
  return message ? <div className={styles.error} role="alert">{message}</div> : null;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={styles.status} data-state={status}>{displayLabel(status)}</span>;
}

export function ConfigurationNotice({ session }: { session: SessionState }) {
  if (session.loading) return <p className={styles.meta} role="status">Checking service availability…</p>;
  if (session.error) return <ErrorMessage message={session.error} />;
  if (session.configured) return null;
  return <div className={styles.quietNotice} role="status">Online inquiries and private accounts are not available yet. Service setup is in progress. You can continue exploring the public learning library.</div>;
}

export function AccessGate({ session, staff = false, children }: { session: SessionState; staff?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  if (session.loading) return <p className={styles.loading} role="status">Opening your workspace…</p>;
  if (session.error) return <div className={styles.authNotice}><ErrorMessage message={session.error} /></div>;
  if (!session.configured) return <div className={styles.authNotice}><ShieldCheck size={30}/><h2>Private accounts are being prepared</h2><p>Secure sign-in and inquiry handling will be available once service setup is complete.</p><Link className="button button-secondary" href="/learn">Explore the learning library</Link></div>;
  if (!session.user) return <div className={styles.authNotice}><LockKeyhole size={30}/><h2>Sign in to continue</h2><p>Use your verified email to access your questions and responses. A question reference number does not grant access to private information.</p><Link className="button button-primary" href={`/sign-in?next=${encodeURIComponent(pathname)}`}>Sign in with email</Link></div>;
  if (staff && !["ADMIN", "CONSULTANT"].includes(session.user.role)) return <div className={styles.authNotice}><LockKeyhole size={30}/><h2>This is the consultant workspace</h2><p>Your account can access your own questions and responses.</p><Link className="button button-primary" href="/my-questions">Go to my questions</Link></div>;
  return children;
}

export function WorkspaceNavigation() {
  const pathname = usePathname();
  return <nav className={styles.workspaceNav} aria-label="Consultant workspace"><Link href="/dashboard" aria-current={pathname === "/dashboard" || pathname.startsWith("/dashboard/questions/") ? "page" : undefined}>Questions</Link><Link href="/dashboard/consultations" aria-current={pathname === "/dashboard/consultations" ? "page" : undefined}>Sessions</Link><Link href="/dashboard/content" aria-current={pathname === "/dashboard/content" ? "page" : undefined}>Content library</Link></nav>;
}
