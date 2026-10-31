"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiRequest, pakistanInputToIso, usePortalSession } from "@/components/forms/portal-client";
import { ConfigurationNotice, ErrorMessage, Field } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function SessionsPage() {
  const session = usePortalSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { setResult(await apiRequest("/api/consultations", { method: "POST", body: JSON.stringify({ ...values, preferredAt: pakistanInputToIso(String(values.preferredAt)) }) })); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "The session request could not be sent."); }
    finally { setBusy(false); }
  }
  return <div className="container">
    <header className="page-intro"><span className="eyebrow">A conversation with context</span><h1>Make room<br/>for understanding.</h1><p className="muted">Request a free educational session to discuss investment fundamentals, research methods, or how to understand risk.</p></header>
    <p><Link className="button button-secondary" href="/sessions/book">Sign in to reserve an available time</Link></p>
    <div className={styles.formLayout}><section className={styles.formPanel}>
      {result ? <div className={styles.success} role="status"><CheckCircle2 size={30}/><h2>Your request has been received.</h2><p>{result.message}</p><span className={styles.reference}>{result.reference}</span><p>Your preferred time is a request. The consultant will confirm availability and share the meeting details separately.</p><Link href="/my-questions" className="button button-primary">View my workspace <ArrowRight size={16}/></Link></div> : <form className={styles.stack} onSubmit={submit}>
        <div><h2>Request an educational session</h2><p className={styles.meta}>All dates and times below are in Pakistan Standard Time (PKT).</p></div>
        <ConfigurationNotice session={session}/>
        <div className={styles.split}><Field id="name" label="Your name *"><input key={session.user?.id ?? "guest"} className="input" id="name" name="name" autoComplete="name" defaultValue={session.user?.name ?? ""} required minLength={2} maxLength={100}/></Field><Field id="email" label="Email address *"><input key={session.user?.id ?? "guest"} className="input" id="email" name="email" type="email" defaultValue={session.user?.email ?? ""} readOnly={Boolean(session.user)} autoComplete="email" required maxLength={254}/></Field></div>
        <Field id="whatsapp" label="WhatsApp number" hint="Optional · for follow-up communication"><input className="input" id="whatsapp" name="whatsapp" type="tel" maxLength={30}/></Field>
        <Field id="preferredAt" label="Preferred date and time (PKT) *"><input className="input" id="preferredAt" name="preferredAt" type="datetime-local" required/></Field>
        <Field id="topic" label="What would you like to discuss? *"><select className="select" id="topic" name="topic" required defaultValue=""><option value="" disabled>Select a session topic</option>{["Getting started with PSX", "Reading company financial statements", "Understanding valuation methods", "Diversification and risk fundamentals", "Understanding market behavior", "Another educational topic"].map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></Field>
        <Field id="notes" label="Anything useful to know?" hint="Tell us your experience level and what you hope to learn. Please do not share private account details."><textarea className="textarea" id="notes" name="notes" rows={4} maxLength={3000}/></Field>
        <label className={styles.check}><input type="checkbox" required/><span>I understand this is a session request, subject to confirmation, and have read the <Link href="/privacy">privacy policy</Link>.</span></label>
        <ErrorMessage message={error}/><button className="button button-primary" type="submit" disabled={busy || session.loading || !session.configured}>{busy ? "Sending request…" : "Request a session"}<ArrowRight size={16}/></button>
      </form>}
    </section><aside className={styles.aside}><CalendarDays size={28} strokeWidth={1.4}/><h2>Come with a question.<br/>Leave with a framework.</h2><p>Educational sessions are a space to unpack unfamiliar ideas and develop a more deliberate approach to research.</p><div className={styles.step}><span className={styles.stepNumber}>01</span><div><strong>Choose a topic and preferred time</strong><p>Tell us what you want to learn so we can prepare.</p></div></div><div className={styles.step}><span className={styles.stepNumber}>02</span><div><strong>Wait for confirmation</strong><p>We’ll confirm availability or suggest an alternative time.</p></div></div><div className={styles.step}><span className={styles.stepNumber}>03</span><div><strong>Join the conversation</strong><p>Meeting details are shared once your session is confirmed.</p></div></div><p className={styles.help}>Sessions focus on education. They do not include personalized portfolio recommendations, execution services, or return guarantees.</p></aside></div>
  </div>;
}
