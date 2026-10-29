import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowRight, ChevronRight, Clock3, CalendarDays, BookOpen } from "lucide-react";
import { type ContentEntry } from "@/lib/content";
import { ContentCard } from "./content-library";
import styles from "../learning.module.css";

export function ContentArticle({ entry, related = [] }: { entry: ContentEntry; related?: ContentEntry[] }) {
  const parent = entry.kind === "lesson" ? { href: "/learn", label: "Learn" } : entry.kind === "study" ? { href: "/company-studies", label: "Company studies" } : { href: "/market-notes", label: "Market notes" };
  const publishedDate = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(entry.publishedAt));
  return <div className="container">
    <header className={styles.articleHero}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={12} /><Link href={parent.href}>{parent.label}</Link><ChevronRight size={12} /><span>{entry.category}</span></nav>
      <span className="eyebrow">{entry.level ? `Level ${entry.level} · ` : entry.kind === "study" ? "Illustrative case study · " : "Evergreen explainer · "}{entry.category}</span>
      <h1>{entry.title}</h1>
      <p className={styles.articleExcerpt}>{entry.excerpt}</p>
      <div className={styles.articleMetadata}><span>{entry.author}</span><span><Clock3 size={14} />{entry.readMinutes} min read</span><span><CalendarDays size={14} />Published {publishedDate}</span></div>
    </header>
    <div className={styles.articleGrid}>
      <article className={styles.articleBody}>
        <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} {...(href?.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a> }}>{entry.body}</ReactMarkdown>
        <div className={styles.articleFooter}>Educational material. Examples explain methods and assumptions; they are not personalized investment recommendations. Check original sources and reporting periods. This page does not provide live market data.</div>
      </article>
      <aside className={styles.articleAside}><BookOpen size={24} strokeWidth={1.4} /><h3>A good question is a useful next step.</h3><p>Ask about a concept, calculation, or part of a financial statement you want to understand.</p><Link href={`/ask?topic=${encodeURIComponent(entry.title)}`} className="button button-primary button-small">Ask a question <ArrowRight size={15} /></Link><p>English, Urdu, and Roman Urdu welcome.</p><div className="divider" /><Link href="/learn" className="text-link">Explore the learning path <ArrowRight size={14} /></Link></aside>
    </div>
    {related.length > 0 && <section className={styles.related}><span className="eyebrow">Keep building your understanding</span><h2>Continue exploring</h2><div className={styles.grid}>{related.slice(0, 3).map(item => <ContentCard key={item.id} item={item} />)}</div></section>}
  </div>;
}
