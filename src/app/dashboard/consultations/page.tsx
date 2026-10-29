"use client";

import { CalendarDays, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, localPakistanInput, pakistanDate, pakistanInputToIso, type Consultation, usePortalSession } from "@/components/forms/portal-client";
import { AccessGate, ErrorMessage, Field, StatusBadge, WorkspaceNavigation } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

export default function ConsultationManagerPage() {
  const session = usePortalSession();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [editing, setEditing] = useState({ status: "REQUESTED", confirmedAt: "", meetingUrl: "", notes: "" });
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const staff = session.user && ["ADMIN", "CONSULTANT"].includes(session.user.role);
  useEffect(() => {
    if (!staff) return;
    let active = true; setLoading(true); setError(null);
    apiRequest<{ consultations: Consultation[] }>("/api/admin/consultations").then((result) => { if (active) setConsultations(result.consultations); }).catch((problem: Error) => { if (active) setError(problem.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [staff, revision]);
  function select(consultation: Consultation) {
    setSelected(consultation); setSuccess(null); setError(null);
    setEditing({ status: consultation.status, confirmedAt: localPakistanInput(consultation.confirmedAt ?? consultation.preferredAt), meetingUrl: consultation.meetingUrl ?? "", notes: consultation.notes ?? "" });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError(null); setSuccess(null);
    try {
      await apiRequest(`/api/admin/consultations/${selected.id}`, { method: "PATCH", body: JSON.stringify({ ...editing, confirmedAt: editing.status === "REQUESTED" ? null : pakistanInputToIso(editing.confirmedAt), meetingUrl: editing.meetingUrl }) });
      setSuccess("Session updated. An email update has been queued for the requester."); setRevision((value) => value + 1);
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not update the session."); }
    finally { setBusy(false); }
  }
  return <div className={`container ${styles.workspace}`}><header className="page-intro"><span className="eyebrow">Consultant workspace</span><h1>Time for a<br/>thoughtful conversation.</h1><p className="muted">Review educational session requests and confirm appointments in Pakistan time.</p></header><AccessGate session={session} staff><WorkspaceNavigation/><ErrorMessage message={error}/>
    {loading ? <p className={styles.loading} role="status">Loading session requests…</p> : consultations.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Requester</th><th>Topic</th><th>Preferred time</th><th>Status</th><th>Manage</th></tr></thead><tbody>{consultations.map((consultation) => <tr key={consultation.id}><td>{consultation.name ?? consultation.contactName}<small>{consultation.email ?? consultation.contactEmail}</small></td><td>{consultation.topic}<small>{consultation.reference}</small></td><td>{pakistanDate(consultation.preferredAt)}</td><td><StatusBadge status={consultation.status}/></td><td><button className="button button-secondary button-small" disabled={busy} onClick={() => select(consultation)}>Review</button></td></tr>)}</tbody></table></div> : !error && <div className={styles.empty}><CalendarDays size={30}/><h2>No session requests yet.</h2><p>Requests submitted through the educational session form will appear here for review.</p></div>}
    {selected && <section className={styles.formPanel} style={{ marginTop: 30 }}><span className="eyebrow">{selected.reference ?? "Session request"}</span><h2>{selected.topic}</h2><p className={styles.meta}>{selected.name} · {selected.email}<br/>Originally requested: {pakistanDate(selected.preferredAt)}</p>{selected.clientNotes && <div className={styles.response}><h3>What the requester wants to learn</h3><p className={styles.message}>{selected.clientNotes}</p></div>}<form className={styles.stack} onSubmit={submit}><div className={styles.split}><Field id="session-status" label="Status"><select className="select" id="session-status" value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}><option value="REQUESTED">Requested</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></Field><Field id="confirmed-at" label="Confirmed date and time (PKT)"><input className="input" id="confirmed-at" type="datetime-local" value={editing.confirmedAt} required={["CONFIRMED", "COMPLETED"].includes(editing.status)} onChange={(event) => setEditing({ ...editing, confirmedAt: event.target.value })}/></Field></div><Field id="meeting-url" label="Meeting link" hint="Create the meeting in your chosen calendar or meeting tool, then paste its HTTPS link."><input className="input" id="meeting-url" type="url" maxLength={1000} placeholder="https://meet.google.com/…" value={editing.meetingUrl} onChange={(event) => setEditing({ ...editing, meetingUrl: event.target.value })}/></Field><Field id="session-notes" label="Private staff notes" hint="Only the consultant team can see these notes."><textarea className="textarea" id="session-notes" rows={4} maxLength={5000} value={editing.notes} onChange={(event) => setEditing({ ...editing, notes: event.target.value })}/></Field>{success && <div className={styles.success} role="status">{success}</div>}<div className={styles.inline}><button className="button button-primary" type="submit" disabled={busy}><Save size={16}/>{busy ? "Saving…" : "Save session"}</button><button className="button button-secondary" type="button" disabled={busy} onClick={() => setSelected(null)}>Close</button></div></form></section>}
  </AccessGate></div>;
}
