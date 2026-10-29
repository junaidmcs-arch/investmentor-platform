"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquareText } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, categories, usePortalSession } from "@/components/forms/portal-client";
import { ConfigurationNotice, ErrorMessage, Field } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function AskPage() {
  const session = usePortalSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; message: string } | null>(null);
  const [subject, setSubject] = useState("");
  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) setSubject(current => current || topic.trim().slice(0, 160));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { setResult(await apiRequest("/api/questions", { method: "POST", body: JSON.stringify(values) })); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Your question could not be submitted."); }
    finally { setBusy(false); }
  }

  return <div className="container">
    <header className="page-intro"><span className="eyebrow">A little clarity goes a long way</span><h1>What would you<br/>like to understand?</h1><p className="muted">Ask about a financial concept, a company disclosure, or a research method. We’ll help you find a thoughtful starting point.</p></header>
    <div className={styles.formLayout}>
      <section className={styles.formPanel} aria-label="Submit a question">
        {result ? <div className={styles.success} role="status"><CheckCircle2 size={30}/><h2>Your question is in the queue.</h2><p>{result.message}</p><span className={styles.reference}>{result.reference}</span><p>Keep this reference for follow-ups. Sign in with the email you provided to securely view your question and published response.</p><Link className="button button-primary" href="/my-questions">View my questions <ArrowRight size={16}/></Link></div> : <form onSubmit={submit} className={styles.stack}>
          <div><h2>Ask your question</h2><p className={styles.meta}>No account needed to submit. Fields marked * are required.</p></div>
          <ConfigurationNotice session={session}/>
          <div className={styles.split}>
            <Field id="name" label="Your name *"><input key={session.user?.id ?? "guest"} className="input" id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={session.user?.name ?? ""}/></Field>
            <Field id="email" label="Email address *" hint="Use this email to access your private reply."><input key={session.user?.id ?? "guest"} className="input" id="email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={session.user?.email ?? ""} readOnly={Boolean(session.user)}/></Field>
          </div>
          <Field id="whatsapp" label="WhatsApp number" hint="Optional · e.g. 0300 1234567"><input className="input" id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" maxLength={30}/></Field>
          <Field id="category" label="What is your question about? *"><select className="select" id="category" name="category" required defaultValue=""><option value="" disabled>Select a topic</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field id="subject" label="A short title *"><input className="input" id="subject" name="subject" placeholder="e.g. How do I interpret a company’s debt-to-equity ratio?" required minLength={5} maxLength={160} value={subject} onChange={event => setSubject(event.target.value)}/></Field>
          <Field id="body" label="Your question *" hint="Include useful context. Keep account numbers, passwords, CNIC details, and other sensitive information private."><textarea className="textarea" id="body" name="body" required minLength={20} maxLength={6000} rows={6} placeholder="Tell us what you are trying to understand…"/></Field>
          <label className={styles.check}><input type="checkbox" required/><span>I understand that this service provides education and general information, and I have read the <Link href="/privacy">privacy policy</Link>.</span></label>
          <ErrorMessage message={error}/>
          <button className="button button-primary" type="submit" disabled={busy || session.loading || !session.configured}>{busy ? "Sending your question…" : "Send my question"}<ArrowRight size={16}/></button>
        </form>}
      </section>
      <aside className={styles.aside}><MessageSquareText size={28} strokeWidth={1.4}/><h2>A question.<br/>A considered response.</h2><div className={styles.step}><span className={styles.stepNumber}>01</span><div><strong>We review the context</strong><p>Your question is categorized and reviewed by the consultant.</p></div></div><div className={styles.step}><span className={styles.stepNumber}>02</span><div><strong>We explain the reasoning</strong><p>Responses connect the explanation with sources, assumptions, and relevant risks.</p></div></div><div className={styles.step}><span className={styles.stepNumber}>03</span><div><strong>You keep a private record</strong><p>Verified email access keeps your conversation available for future reference.</p></div></div><p className={styles.help}>Questions are reviewed individually. Submission does not provide immediate investment advice or a buy/sell recommendation.</p><Link className="text-link" href="/learn">Find an answer in the learning library <ArrowRight size={14}/></Link></aside>
    </div>
  </div>;
}
