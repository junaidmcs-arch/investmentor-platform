import type { Metadata } from "next";
import { getPublishedContents } from "@/lib/server/content";
import { ContentLibrary } from "../learn/_components/content-library";
import styles from "../learn/learning.module.css";

export const metadata: Metadata = { title: "Market notes", description: "Understand economic context, interest rates, and currency exposures through clearly scoped educational explainers." };
export const dynamic = "force-dynamic";
export default async function MarketNotesPage() {
  const entries = await getPublishedContents("market");
  return <div className="container"><header className={styles.intro}><div><span className="eyebrow">Context before conclusions</span><h1>Understand what<br />moves the conversation.</h1><p>Explore how interest rates, currencies, and economic conditions can reach a business. Follow the mechanism and question the assumptions.</p></div><aside className={styles.introAside}><strong>Frameworks for reading the news.</strong>These are evergreen explainers, with original sources to explore. They do not report live market conditions or predict sector returns.</aside></header><ContentLibrary entries={entries} /></div>;
}
