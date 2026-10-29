import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowRight } from "lucide-react";
import { getPublishedContents } from "@/lib/server/content";
import { ContentLibrary } from "./_components/content-library";
import styles from "./learning.module.css";

export const metadata: Metadata = { title: "Learn about PSX investing", description: "A free five-level learning path for Pakistani investors: PSX basics, financial statements, valuation, risk, and market context." };
export const dynamic = "force-dynamic";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ level?: string | string[]; q?: string | string[] }> }) {
  const [entries, faqs, query] = await Promise.all([getPublishedContents("lesson"), getPublishedContents("faq"), searchParams]);
  const parsedLevel = Number(Array.isArray(query.level) ? query.level[0] : query.level);
  const initialQuery = (Array.isArray(query.q) ? query.q[0] : query.q ?? "").slice(0, 200);
  const initialLevel = Number.isInteger(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 5 ? parsedLevel : 0;
  return <div className="container">
    <header className={styles.intro}><div><span className="eyebrow">The learning library</span><h1>Build your understanding.<br />One idea at a time.</h1><p>A practical path from your first questions about PSX to understanding businesses, valuation, and risk. Begin where you are.</p></div><aside className={styles.introAside}><strong>Five levels. Your own pace.</strong>Every lesson connects a financial idea to questions you can ask. Risk awareness is part of the journey from day one.</aside></header>
    <ContentLibrary key={`${initialLevel}:${initialQuery}`} entries={entries} showLevels initialLevel={initialLevel} initialQuery={initialQuery} />
    <section className={styles.callout}><div><h2>Make the numbers mean something.</h2><p>Explore a hypothetical P/E valuation and see how changing assumptions changes the result.</p></div><Link href="/tools/valuation" className="button button-primary">Open valuation lab <ArrowRight size={16} /></Link></section>
    {faqs.length > 0 && <section className={styles.faqSection} id="faq" aria-labelledby="faq-heading"><div><span className="eyebrow">USEFUL FIRST QUESTIONS</span><h2 id="faq-heading">A little more clarity.</h2><p>How to learn, ask questions, and understand the scope of this first release.</p></div><div>{faqs.map(faq => <details key={faq.id} id={faq.slug} className={styles.faq}><summary>{faq.title}<span aria-hidden="true">+</span></summary><div><ReactMarkdown>{faq.body}</ReactMarkdown></div></details>)}</div></section>}
  </div>;
}
