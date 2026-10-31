"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send, Save } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiRequest, displayLabel, pakistanDate, pakistanToday, type QuestionDetail, usePortalSession } from "@/components/forms/portal-client";
import { AccessGate, ErrorMessage, Field, StatusBadge } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function ReviewQuestionPage() {
  const params = useParams<{ id: string }>();
  const session = usePortalSession();
  const [data, setData] = useState<QuestionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("NEW");
  const [revision, setRevision] = useState(0);
  const hydratedQuestion = useRef<string | null>(null);
  const [draft, setDraft] = useState({ body: "", sources: "", risks: "", assumptions: "", analysisDate: pakistanToday() });
  const staff = session.user && ["ADMIN", "CONSULTANT"].includes(session.user.role);
  useEffect(() => {
    if (!staff) return;
    let active = true; setError(null);
    const isNewQuestion = hydratedQuestion.current !== params.id;
    if (isNewQuestion) {
      setData(null);
      setDraft({ body: "", sources: "", risks: "", assumptions: "", analysisDate: pakistanToday() });
    }
    apiRequest<QuestionDetail>(`/api/questions/${encodeURIComponent(params.id)}`).then((result) => {
      if (!active) return; setData(result); setStatus(result.question.status);
      if (isNewQuestion) {
        const savedDraft = result.responses.find((response) => !response.publishedAt && response.consultantId === session.user?.id);
        if (savedDraft) setDraft({ body: savedDraft.body ?? "", sources: savedDraft.sources ?? "", risks: savedDraft.risks ?? "", assumptions: savedDraft.assumptions ?? "", analysisDate: savedDraft.analysisDate?.slice(0, 10) ?? pakistanToday() });
        hydratedQuestion.current = params.id;
      }
    }).catch((problem: Error) => { if (active) setError(problem.message); });
    return () => { active = false; };
  }, [params.id, staff, revision]);
  async function changeStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null); setSuccess(null);
    try { await apiRequest(`/api/admin/questions/${encodeURIComponent(params.id)}`, { method: "PATCH", body: JSON.stringify({ status }) }); setSuccess("Question status updated."); setRevision((value) => value + 1); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Could not update status."); }
    finally { setBusy(false); }
  }
  async function saveResponse(publish: boolean) {
    setBusy(true); setError(null); setSuccess(null);
    try {
      await apiRequest(`/api/admin/questions/${encodeURIComponent(params.id)}/response`, { method: "POST", body: JSON.stringify({ ...draft, publish }) });
      setSuccess(publish ? "Response published. The question has been marked answered and its notification queued where an email is available." : "Draft saved. It remains visible only to the consultant team.");
      if (publish) setDraft({ body: "", sources: "", risks: "", assumptions: "", analysisDate: pakistanToday() });
      setRevision((value) => value + 1);
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not save the response."); }
    finally { setBusy(false); }
  }
  return <div className={`container ${styles.workspace}`}><header className="page-intro"><Link className="text-link" href="/dashboard"><ArrowLeft size={15}/>Question inbox</Link><h1>Consider the question.</h1></header><AccessGate session={session} staff><ErrorMessage message={error}/>{success && <div className={styles.success} role="status"><CheckCircle2 size={18}/>{success}</div>}{!data && !error ? <p className={styles.loading} role="status">Loading the conversation…</p> : data && <div className={styles.detailGrid} style={{ marginTop: 24 }}><div>
    <section className={styles.formPanel}><div className={styles.inline}><span className={styles.meta}>{data.question.reference}</span><StatusBadge status={data.question.status}/></div><h2>{data.question.subject}</h2><p className={styles.meta}>{data.question.name} · {data.question.email || "WhatsApp contact"}<br/>{displayLabel(data.question.category)} · {pakistanDate(data.question.createdAt)}</p>{data.question.whatsapp && <p><a className="text-link" href={`https://wa.me/${data.question.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp: {data.question.whatsapp} ↗</a></p>}<p className={styles.message}>{data.question.body}</p></section>
    <section className={styles.response}><h2>Prepare a response</h2><p className={styles.meta}>Drafts remain private. A published response needs an explanation, risks, assumptions, and an analysis date.</p><form className={styles.stack} onSubmit={(event) => { event.preventDefault(); void saveResponse(true); }}>
      <Field id="answer" label="Explanation *"><textarea className="textarea" id="answer" rows={9} value={draft.body} required minLength={20} maxLength={20000} onChange={(event) => setDraft({ ...draft, body: event.target.value })}/></Field>
      <Field id="sources" label="Sources and supporting research"><textarea className="textarea" id="sources" rows={3} value={draft.sources} maxLength={5000} onChange={(event) => setDraft({ ...draft, sources: event.target.value })} placeholder="Source title, URL, reporting period, and relevant context"/></Field>
      <Field id="risks" label="Risks *"><textarea className="textarea" id="risks" rows={3} value={draft.risks} required minLength={10} maxLength={5000} onChange={(event) => setDraft({ ...draft, risks: event.target.value })}/></Field>
      <Field id="assumptions" label="Assumptions *"><textarea className="textarea" id="assumptions" rows={3} value={draft.assumptions} required minLength={10} maxLength={5000} onChange={(event) => setDraft({ ...draft, assumptions: event.target.value })}/></Field>
      <Field id="analysis-date" label="Analysis date *"><input className="input" id="analysis-date" type="date" value={draft.analysisDate} required onChange={(event) => setDraft({ ...draft, analysisDate: event.target.value })}/></Field>
      <div className={styles.inline}><button className="button button-secondary" type="button" disabled={busy} onClick={() => saveResponse(false)}><Save size={16}/>{busy ? "Saving…" : "Save private draft"}</button><button className="button button-primary" type="submit" disabled={busy}><Send size={15}/>Publish response</button></div>
    </form></section>
    {data.responses.filter((response) => response.publishedAt).map((response) => <section className={styles.response} key={response.id}><span className="eyebrow">Published response</span><p className={styles.meta}>Analysis: {pakistanDate(response.analysisDate, false)} · Published: {pakistanDate(response.publishedAt)}</p><div className={styles.message}>{response.body}</div><h3>Risks</h3><div className={styles.message}>{response.risks}</div><h3>Assumptions</h3><div className={styles.message}>{response.assumptions}</div></section>)}
    </div><aside className={styles.formPanel}><h2>Manage question</h2><form className={styles.stack} onSubmit={changeStatus}><Field id="question-status" label="Status"><select className="select" id="question-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option>{data.question.status === "ANSWERED" && <option value="ANSWERED">Answered</option>}<option value="DECLINED">Declined</option></select></Field><button className="button button-secondary button-small" type="submit" disabled={busy}>Update status</button><p className={styles.help}>Publishing a response marks the question answered automatically.</p></form><h2 style={{ marginTop: 36 }}>History</h2><ol className={styles.timeline}>{data.events.map((event) => <li key={event.id}><strong>{displayLabel(event.toStatus ?? event.status ?? event.type ?? "Updated")}</strong><span className={styles.meta}>{pakistanDate(event.createdAt)}</span></li>)}</ol></aside>
  </div>}</AccessGate></div>;
}
