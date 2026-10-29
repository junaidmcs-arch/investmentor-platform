import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedContents } from "@/lib/server/content";
import { ContentLibrary } from "../learn/_components/content-library";
import styles from "../learn/learning.module.css";

export const metadata: Metadata = { title: "Company studies", description: "Illustrative company case studies that connect financial evidence, valuation assumptions, and risks." };
export const dynamic = "force-dynamic";
export default async function CompanyStudiesPage() {
  const entries = await getPublishedContents("study");
  return <div className="container"><header className={styles.intro}><div><span className="eyebrow">Put the framework to work</span><h1>Look beyond<br />the headline number.</h1><p>Follow a business story through its financial evidence, valuation assumptions, and risks. Learn which questions to ask next.</p></div><aside className={styles.introAside}><strong>Examples, with the assumptions visible.</strong>Our launch case studies use fictional businesses and clearly labeled hypothetical figures. They are learning exercises.</aside></header><ContentLibrary entries={entries} /><section className={styles.callout}><div><h2>Need the foundations first?</h2><p>Learn how the income statement, balance sheet, and cash-flow statement fit together.</p></div><Link href="/learn/reading-financial-statements" className="button button-primary">Read the lesson <ArrowRight size={16} /></Link></section></div>;
}
