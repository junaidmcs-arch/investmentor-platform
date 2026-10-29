"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowRight, CalendarDays, MessageSquareText, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, pakistanDate, safeMeetingUrl, type Consultation, type Question, usePortalSession } from "@/components/forms/portal-client";
import { AccessGate, ErrorMessage, StatusBadge } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function MyQuestionsPage() {
  const session = usePortalSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session.user) return;
    let active = true; setLoading(true);
    Promise.all([apiRequest<{ questions: Question[] }>("/api/questions"), apiRequest<{ consultations: Consultation[] }>("/api/consultations")])
      .then(([inquiries, sessions]) => { if (active) { setQuestions(inquiries.questions); setConsultations(sessions.consultations); } })
      .catch((problem: Error) => { if (active) setError(problem.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session.user]);
  return <div className={`container ${styles.workspace}`}><header className="page-intro"><span className="eyebrow">Your private workspace</span><h1>A clearer picture,<br/>one question at a time.</h1><p className="muted">Your questions, published responses, and session requests, kept together.</p></header><AccessGate session={session}>
    <div className={styles.inline} style={{ justifyContent: "space-between", marginBottom: 30 }}><p className={styles.meta}>Signed in as {session.user?.email}</p><div className={styles.inline}>{session.user && ["ADMIN", "CONSULTANT"].includes(session.user.role) && <Link className="text-link" href="/dashboard">Consultant dashboard</Link>}<button className="button button-secondary button-small" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button></div></div>
    <ErrorMessage message={error}/>
    {loading ? <p className={styles.loading} role="status">Loading your questions and sessions…</p> : !error && <>
      <div className={styles.sectionHeader}><h2>My questions</h2><Link className="button button-primary button-small" href="/ask"><Plus size={15}/>Ask a question</Link></div>
      {questions.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Question</th><th>Status</th><th>Submitted</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{questions.map((question) => <tr key={question.id}><td><Link href={`/my-questions/${question.id}`}>{question.subject}</Link><small>{question.reference}</small></td><td><StatusBadge status={question.status}/></td><td>{pakistanDate(question.createdAt, false)}</td><td><Link href={`/my-questions/${question.id}`} aria-label={`Open ${question.subject}`}><ArrowRight size={17}/></Link></td></tr>)}</tbody></table></div> : <div className={styles.empty}><MessageSquareText size={28}/><h2>Your next question belongs here.</h2><p>Ask about a concept or research method. Your submitted question and published response will appear in this private workspace.</p><Link className="text-link" href="/ask">Ask your first question <ArrowRight size={15}/></Link></div>}
      <div className={styles.sectionHeader}><h2>Educational sessions</h2><Link className="text-link" href="/sessions">Request a session <ArrowRight size={15}/></Link></div>
      {consultations.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Topic</th><th>Status</th><th>Time (Pakistan)</th><th>Meeting</th></tr></thead><tbody>{consultations.map((consultation) => <tr key={consultation.id}><td>{consultation.topic}<small>{consultation.reference}</small></td><td><StatusBadge status={consultation.status}/></td><td>{pakistanDate(consultation.status === "REQUESTED" ? consultation.preferredAt : consultation.confirmedAt ?? consultation.preferredAt)}<small>{consultation.status === "REQUESTED" ? "Preferred time · awaiting confirmation" : consultation.status === "CANCELLED" ? "Session cancelled" : "Confirmed time"}</small></td><td>{safeMeetingUrl(consultation.meetingUrl) && consultation.status === "CONFIRMED" ? <a href={safeMeetingUrl(consultation.meetingUrl)!} target="_blank" rel="noopener noreferrer">Join session ↗</a> : "—"}</td></tr>)}</tbody></table></div> : <div className={styles.empty}><CalendarDays size={26}/><p>No session requests yet. A conversation can help you work through unfamiliar investing concepts.</p></div>}
    </>}
  </AccessGate></div>;
}
