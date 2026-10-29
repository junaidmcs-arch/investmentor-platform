"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, displayLabel, pakistanDate, type QuestionDetail, usePortalSession } from "@/components/forms/portal-client";
import { AccessGate, ErrorMessage, StatusBadge } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const session = usePortalSession();
  const [data, setData] = useState<QuestionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session.user) return;
    let active = true; setData(null); setError(null);
    apiRequest<QuestionDetail>(`/api/questions/${encodeURIComponent(params.id)}`).then((result) => { if (active) setData(result); }).catch((problem: Error) => { if (active) setError(problem.message); });
    return () => { active = false; };
  }, [params.id, session.user]);
  return <div className={`container ${styles.workspace}`}><header className="page-intro"><Link className="text-link" href="/my-questions"><ArrowLeft size={15}/>My questions</Link><h1>Your conversation.</h1></header><AccessGate session={session}><ErrorMessage message={error}/>{!data && !error ? <p role="status" className={styles.loading}>Loading your question…</p> : data && <div className={styles.detailGrid}>
    <div><section className={styles.formPanel}><div className={styles.inline}><span className={styles.meta}>{data.question.reference}</span><StatusBadge status={data.question.status}/></div><h2>{data.question.subject}</h2><p className={styles.meta}>{displayLabel(data.question.category)} · {pakistanDate(data.question.createdAt)}</p><p className={styles.message}>{data.question.body}</p></section>
      {data.responses.some(response => response.publishedAt) ? data.responses.filter((response) => response.publishedAt).map((response) => <section className={styles.response} key={response.id}><span className="eyebrow">Consultant response</span><h2>An explanation to build on.</h2><p className={styles.meta}>Analysis dated {pakistanDate(response.analysisDate, false)}</p><div className={styles.message}>{response.body}</div>{response.sources && <><h3>Sources and supporting material</h3><div className={styles.message}>{response.sources}</div></>}<h3>Risks to consider</h3><div className={styles.message}>{response.risks}</div><h3>Assumptions</h3><div className={styles.message}>{response.assumptions}</div></section>) : <div className={styles.response}><Clock3 size={23}/><h2>Your question is awaiting a response.</h2><p className="muted">We’ll send an email notification when a response is published. Only completed, published responses appear here.</p></div>}
    </div><aside className={styles.formPanel}><h2>Question history</h2><ol className={styles.timeline}>{data.events.map((event) => <li key={event.id}><strong>{displayLabel(event.toStatus ?? event.status ?? event.type ?? "Updated")}</strong><span className={styles.meta}>{pakistanDate(event.createdAt)}</span>{event.note && <p className={styles.meta}>{event.note}</p>}</li>)}</ol><p className={styles.help}>This conversation is private. Reference numbers are for follow-up only.</p></aside>
  </div>}</AccessGate></div>;
}
