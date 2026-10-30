"use client";

import Link from "next/link";
import { ArrowRight, Inbox, Plus, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, categories, pakistanDate, type Question, usePortalSession } from "@/components/forms/portal-client";
import { AccessGate, ErrorMessage, Field, StatusBadge } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

type Overview = { questions: { total: number; new: number; inProgress: number; answered: number; declined: number }; consultations: { total: number; requested: number; confirmed: number }; content: { published: number; drafts: number }; notifications: { pending: number; failed: number } };

export default function DashboardPage() {
  const session = usePortalSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [revision, setRevision] = useState(0);
  const [showOffline, setShowOffline] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState<string | null>(null);
  const staff = session.user && ["ADMIN", "CONSULTANT"].includes(session.user.role);
  useEffect(() => {
    if (!staff) return;
    let active = true; setLoading(true); setError(null);
    const query = new URLSearchParams({ status, search });
    Promise.all([apiRequest<{ questions: Question[] }>(`/api/admin/questions?${query}`), apiRequest<Overview>("/api/admin/overview")])
      .then(([inquiries, summary]) => { if (active) { setQuestions(inquiries.questions); setOverview(summary); } })
      .catch((problem: Error) => { if (active) setError(problem.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [staff, status, search, revision]);
  async function logInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLogging(true); setError(null); setLogged(null);
    const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    if (!values.email) delete values.email;
    try { const result = await apiRequest<{ reference: string }>("/api/admin/questions", { method: "POST", body: JSON.stringify(values) }); setLogged(`Inquiry ${result.reference} has been logged.`); form.reset(); setRevision((value) => value + 1); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Could not log this inquiry."); }
    finally { setLogging(false); }
  }
  return <div className={`container ${styles.workspace}`}><header className="page-intro"><span className="eyebrow">Consultant workspace</span><h1>Good guidance<br/>starts with listening.</h1><p className="muted">Review questions, prepare considered responses, and keep the conversation moving.</p></header><AccessGate session={session} staff>
    {overview && <div className={styles.countGrid}><div className={styles.count}><span>New questions</span><strong>{overview.questions.new}</strong></div><div className={styles.count}><span>In progress</span><strong>{overview.questions.inProgress}</strong></div><div className={styles.count}><span>Answered</span><strong>{overview.questions.answered}</strong></div><div className={styles.count}><span>Session requests</span><strong>{overview.consultations.requested}</strong></div></div>}
    {overview && overview.notifications.failed > 0 && <div className={styles.quietNotice} role="status">{overview.notifications.failed} email notification(s) need attention. Check the notification worker and email service configuration before retrying delivery.</div>}
    <div className={styles.sectionHeader}><h2>Question inbox</h2><button className="button button-secondary button-small" onClick={() => setShowOffline((value) => !value)} aria-expanded={showOffline}><Plus size={15}/>Log WhatsApp inquiry</button></div>
    {showOffline && <section className={styles.formPanel} style={{ marginBottom: 24 }}><h2>Record a WhatsApp conversation</h2><p className={styles.meta}>Record only the context needed to answer the inquiry. An email is optional for WhatsApp-only contacts.</p><form className={styles.stack} onSubmit={logInquiry}><div className={styles.split}><Field id="offline-name" label="Contact name"><input className="input" id="offline-name" name="name" required minLength={2} maxLength={100}/></Field><Field id="offline-whatsapp" label="WhatsApp number"><input className="input" id="offline-whatsapp" name="whatsapp" type="tel" required maxLength={30}/></Field></div><div className={styles.split}><Field id="offline-email" label="Email (optional)"><input className="input" id="offline-email" name="email" type="email" maxLength={254}/></Field><Field id="offline-category" label="Category"><select className="select" id="offline-category" name="category">{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field></div><Field id="offline-subject" label="Subject"><input className="input" id="offline-subject" name="subject" required minLength={5} maxLength={160}/></Field><Field id="offline-body" label="Question and relevant context"><textarea className="textarea" id="offline-body" name="body" required minLength={20} maxLength={6000} rows={4}/></Field>{logged && <div className={styles.success} role="status">{logged}</div>}<button className="button button-primary" type="submit" disabled={logging}>{logging ? "Saving…" : "Save inquiry"}</button></form></section>}
    <form className={styles.toolbar} onSubmit={(event) => { event.preventDefault(); setSearch(searchInput); }}><Field id="search" label="Search questions"><input className="input" id="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Subject, reference, or contact…"/></Field><Field id="status-filter" label="Status"><select className="select" id="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="ANSWERED">Answered</option><option value="DECLINED">Declined</option></select></Field><button type="submit" className="button button-secondary"><Search size={16}/>Search</button></form>
    <ErrorMessage message={error}/>{loading ? <p className={styles.loading} role="status">Loading questions…</p> : questions.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Question</th><th>Contact</th><th>Status</th><th>Received</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{questions.map((question) => <tr key={question.id}><td><Link href={`/dashboard/questions/${question.id}`}>{question.subject}</Link><small>{question.reference}</small></td><td>{question.name ?? question.contactName}<small>{question.email ?? question.contactEmail}</small></td><td><StatusBadge status={question.status}/></td><td>{pakistanDate(question.createdAt, false)}</td><td><Link href={`/dashboard/questions/${question.id}`} aria-label={`Review ${question.subject}`}><ArrowRight size={17}/></Link></td></tr>)}</tbody></table></div> : !error && <div className={styles.empty}><Inbox size={30}/><h2>{search || status ? "No matching questions." : "Your inbox is clear."}</h2><p>{search || status ? "Try another search or status filter." : "Website questions and manually logged WhatsApp inquiries will appear here."}</p></div>}
  </AccessGate></div>;
}
