"use client";

import { Eye, FileText, Plus, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { apiRequest, type ManagedContent, usePortalSession } from "@/components/forms/portal-client";
import { AccessGate, ErrorMessage, Field, StatusBadge } from "@/components/forms/portal-ui";
import styles from "@/components/forms/portal.module.css";

type ContentDraft = { title: string; slug: string; kind: ManagedContent["kind"]; excerpt: string; body: string; level: string; category: string; readMinutes: string; author: string; status: ManagedContent["status"]; featured: boolean };
const blankDraft = (): ContentDraft => ({ title: "", slug: "", kind: "lesson", excerpt: "", body: "", level: "1", category: "Getting started", readMinutes: "5", author: "InvestMentor editorial", status: "DRAFT", featured: false });

export default function ContentManagerPage() {
  const session = usePortalSession();
  const [contents, setContents] = useState<ManagedContent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContentDraft>(blankDraft);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const staff = session.user && ["ADMIN", "CONSULTANT"].includes(session.user.role);
  useEffect(() => {
    if (!staff) return;
    let active = true; setLoading(true);
    apiRequest<{ contents?: ManagedContent[]; content?: ManagedContent[] }>("/api/admin/content").then((result) => { if (active) setContents(result.contents ?? result.content ?? []); }).catch((problem: Error) => { if (active) setError(problem.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [staff, revision]);
  function select(content: ManagedContent) {
    setSelectedId(content.id); setPreview(false); setError(null); setSuccess(null);
    setDraft({ title: content.title, slug: content.slug, kind: content.kind, excerpt: content.excerpt, body: content.body, level: String(content.level ?? 1), category: content.category, readMinutes: String(content.readMinutes), author: content.author, status: content.status, featured: Boolean(content.featured) });
  }
  function createNew() { setSelectedId(null); setDraft(blankDraft()); setPreview(false); setError(null); setSuccess(null); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null); setSuccess(null);
    try {
      const result = await apiRequest<{ content?: ManagedContent; id?: string }>(selectedId ? `/api/admin/content/${selectedId}` : "/api/admin/content", { method: selectedId ? "PATCH" : "POST", body: JSON.stringify({ ...draft, level: draft.kind === "lesson" ? Number(draft.level) : undefined, readMinutes: Number(draft.readMinutes) }) });
      if (result.content?.id || result.id) setSelectedId(result.content?.id ?? result.id ?? null);
      setSuccess(draft.status === "PUBLISHED" ? "Content published to the public library." : "Draft saved. It is not visible in the public library."); setRevision((value) => value + 1);
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not save content."); }
    finally { setBusy(false); }
  }
  return <div className={`container ${styles.workspace}`}><header className="page-intro"><span className="eyebrow">Consultant workspace</span><h1>Build a library<br/>worth returning to.</h1><p className="muted">Publish clear lessons, documented case studies, and useful market explainers.</p></header><AccessGate session={session} staff>
    <div className={styles.editorLayout}><aside><button className="button button-primary" onClick={createNew} disabled={busy} style={{ width: "100%", marginBottom: 18 }}><Plus size={16}/>New content</button>{loading && <p className={styles.meta} role="status">Loading library…</p>}<div className={styles.contentList}>{contents.map((content) => <button className={styles.contentChoice} key={content.id} aria-pressed={selectedId === content.id} disabled={busy} onClick={() => select(content)}>{content.title}<span>{content.kind} · {content.status.toLowerCase()}</span></button>)}{!loading && !contents.length && <div className={styles.empty}><FileText size={24}/><p>Your content library is ready for its first draft.</p></div>}</div></aside>
    <section className={styles.formPanel}><div className={styles.inline} style={{ justifyContent: "space-between", marginBottom: 25 }}><h2 style={{ margin: 0 }}>{selectedId ? "Edit content" : "Create content"}</h2><StatusBadge status={draft.status}/></div><form className={styles.stack} onSubmit={submit}>
      <Field id="content-title" label="Title *"><input className="input" id="content-title" required minLength={5} maxLength={180} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })}/></Field>
      <div className={styles.split}><Field id="content-slug" label="URL slug *" hint="Use lowercase letters, numbers, and hyphens."><input className="input" id="content-slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} placeholder="understanding-company-earnings" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })}/></Field><Field id="content-kind" label="Content type"><select className="select" id="content-kind" value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as ContentDraft["kind"] })}><option value="lesson">Lesson</option><option value="study">Company study</option><option value="market">Market note</option><option value="faq">FAQ</option></select></Field></div>
      <Field id="content-excerpt" label="Short introduction *"><textarea className="textarea" id="content-excerpt" rows={3} required minLength={15} maxLength={500} value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}/></Field>
      <div className={styles.split}><Field id="content-category" label="Category *"><input className="input" id="content-category" required minLength={2} maxLength={80} value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}/></Field>{draft.kind === "lesson" ? <Field id="content-level" label="Learning level"><select className="select" id="content-level" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })}><option value="1">1 · PSX basics</option><option value="2">2 · Company analysis</option><option value="3">3 · Valuation</option><option value="4">4 · Risk analysis</option><option value="5">5 · Market behavior</option></select></Field> : <div/>}</div>
      <div className={styles.split}><Field id="content-author" label="Author *"><input className="input" id="content-author" required minLength={2} maxLength={100} value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })}/></Field><Field id="content-minutes" label="Reading time (minutes)"><input className="input" id="content-minutes" type="number" min={1} max={120} required value={draft.readMinutes} onChange={(event) => setDraft({ ...draft, readMinutes: event.target.value })}/></Field></div>
      <Field id="content-body" label="Article body (Markdown) *" hint="Include source links, relevant dates, and assumptions. Raw HTML is not supported."><textarea className={`textarea ${styles.editorText}`} id="content-body" required minLength={30} maxLength={80000} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })}/></Field>
      <button className="button button-secondary button-small" type="button" onClick={() => setPreview((value) => !value)} aria-expanded={preview}><Eye size={15}/>{preview ? "Hide preview" : "Preview article"}</button>
      {preview && <div className={`prose ${styles.preview}`}><h2>{draft.title || "Untitled draft"}</h2><ReactMarkdown>{draft.body || "Your article preview will appear here."}</ReactMarkdown></div>}
      <div className={styles.split}><Field id="content-status" label="Publication status"><select className="select" id="content-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ContentDraft["status"] })}><option value="DRAFT">Private draft</option><option value="PUBLISHED">Published</option></select></Field><label className={styles.check} style={{ alignSelf: "center" }}><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}/><span>Feature this content in the library</span></label></div>
      <ErrorMessage message={error}/>{success && <div className={styles.success} role="status">{success}</div>}<button className="button button-primary" type="submit" disabled={busy}><Save size={16}/>{busy ? "Saving…" : draft.status === "PUBLISHED" ? "Save and publish" : "Save private draft"}</button>
    </form></section></div>
  </AccessGate></div>;
}
