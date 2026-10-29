"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesCombined, ChartPie, Landmark, Search, ShieldCheck } from "lucide-react";
import { contentPath, learningLevels, type ContentEntry } from "@/lib/content";
import styles from "../learning.module.css";

const icons = [Landmark, BookOpen, ChartNoAxesCombined, ShieldCheck, ChartPie];

export function ContentCard({ item }: { item: ContentEntry }) {
  const level = item.level ?? (item.kind === "study" ? 3 : 5);
  const Icon = icons[(level - 1) % icons.length];
  return <article className={styles.contentCard}>
    <div className={styles.cardTop} data-level={level} aria-hidden="true">
      <Icon size={34} strokeWidth={1.3} />
      <span className={styles.levelNumber}>{item.level ? String(item.level).padStart(2, "0") : item.kind === "study" ? "Aa" : "↗"}</span>
    </div>
    <div className={styles.cardBody}>
      <div className={styles.cardMeta}><span>{item.category}</span><span>·</span><span>{item.readMinutes} min read</span>{item.featured && <span>· Featured</span>}</div>
      <h2><Link href={contentPath(item)}>{item.title}</Link></h2>
      <p>{item.excerpt}</p>
      <Link className={styles.cardLink} href={contentPath(item)}><span>{item.kind === "lesson" ? "Read lesson" : item.kind === "study" ? "Explore case study" : "Read explainer"}</span><ArrowRight size={16} /></Link>
    </div>
  </article>;
}

export function ContentLibrary({ entries, showLevels = false, initialLevel = 0, initialQuery = "" }: { entries: ContentEntry[]; showLevels?: boolean; initialLevel?: number; initialQuery?: string }) {
  const [level, setLevel] = useState(initialLevel);
  const [query, setQuery] = useState(initialQuery);
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = entries.filter(item => (!level || item.level === level) && (!normalized || `${item.title} ${item.excerpt} ${item.category}`.toLocaleLowerCase().includes(normalized)));
  const selectedLevel = learningLevels.find(item => item.number === level);
  return <>
    <div className={styles.toolbar}>
      <div className={styles.filters} aria-label="Filter by learning level">
        {showLevels ? <>
          <button type="button" onClick={() => setLevel(0)} aria-pressed={level === 0} className={`${styles.filter} ${!level ? styles.active : ""}`}>All levels</button>
          {learningLevels.map(item => <button type="button" key={item.number} title={item.title} onClick={() => setLevel(item.number)} aria-pressed={level === item.number} className={`${styles.filter} ${level === item.number ? styles.active : ""}`}>Level {item.number}</button>)}
        </> : <span className={styles.stepNote}><BookOpen size={16} /> Read at your own pace</span>}
      </div>
      <label className={styles.search}><Search size={17} aria-hidden="true" /><span className="sr-only">Search educational content</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a topic or question…" type="search" /></label>
    </div>
    <div className={styles.results} aria-live="polite"><span>{filtered.length} {filtered.length === 1 ? "resource" : "resources"}{selectedLevel ? ` · ${selectedLevel.title}` : " to explore"}</span><span>Free to read · No account needed</span></div>
    {filtered.length ? <div className={styles.grid}>{filtered.map(item => <ContentCard key={item.id} item={item} />)}</div> : <div className={styles.zero}><Search size={28} aria-hidden="true" /><h2>No matching resources</h2><p>Try another topic or explore all learning levels.</p><button type="button" className="button button-secondary" onClick={() => { setQuery(""); setLevel(0); }}>Clear filters</button></div>}
  </>;
}
