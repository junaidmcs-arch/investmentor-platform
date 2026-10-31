"use client";

import Link from "next/link";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { authErrorMessage, usePortalSession } from "@/components/forms/portal-client";
import { ConfigurationNotice, ErrorMessage, Field } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function SignInPage() {
  const session = usePortalSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [returnTo, setReturnTo] = useState("/my-questions");
  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const next = parameters.get("next");
    if (next && /^\/(?:(?:dashboard|my-questions|learn|company-studies|market-notes)(?:\/[a-zA-Z0-9/-]*)?|sessions\/book)$/.test(next)) setReturnTo(next);
    if (parameters.get("sent") === "1") setSent(true);
    const authError = parameters.get("error");
    if (authError) setError(authErrorMessage(authError));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    try {
      const result = await signIn("nodemailer", { email, callbackUrl: returnTo, redirect: false });
      if (!result || result.error || !result.ok) throw new Error(authErrorMessage(result?.error ?? "EmailSignInError"));
      setSent(true);
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Sign-in is temporarily unavailable."); }
    finally { setBusy(false); }
  }
  return <div className={styles.narrow}><div className={styles.signinIcon}><Mail size={23}/></div><span className="eyebrow">Your private learning conversation</span><h1>Welcome back.</h1><p className="muted">Access your questions, consultant responses, and educational session requests with a secure email link.</p><div className={styles.formPanel} style={{ marginTop: 30 }}>
    {session.user ? <div className={styles.stack}><p>You’re signed in as <strong>{session.user.email}</strong>.</p><Link href="/my-questions" className="button button-primary">Open my workspace <ArrowRight size={16}/></Link>{["ADMIN", "CONSULTANT"].includes(session.user.role) && <Link href="/dashboard" className="text-link">Open consultant dashboard</Link>}</div> : sent ? <div className={styles.success} role="status"><CheckCircle2 size={26}/><h2>Check your inbox.</h2><p>Use the sign-in link sent to your email. If you do not see it, check your spam folder.</p><button className="button button-secondary" onClick={() => setSent(false)}>Use another email</button></div> : <form onSubmit={submit} className={styles.stack}><ConfigurationNotice session={session}/><Field id="email" label="Your email address"><input className="input" id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com"/></Field><ErrorMessage message={error}/><button type="submit" className="button button-primary" disabled={busy || session.loading || !session.configured}>{busy ? "Sending your link…" : "Send secure sign-in link"}<ArrowRight size={16}/></button><p className={styles.help}>No password to remember. Use the same email address you used to submit your questions.</p></form>}
  </div><p className={styles.help} style={{ marginTop: 24 }}>By continuing, you agree to our <Link href="/terms">terms of use</Link> and <Link href="/privacy">privacy policy</Link>.</p></div>;
}
