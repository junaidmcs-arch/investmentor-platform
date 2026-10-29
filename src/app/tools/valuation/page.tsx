import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react";
import { ValuationCalculator } from "@/components/valuation-calculator";
import styles from "./valuation.module.css";

export const metadata: Metadata = {
  title: "Valuation lab",
  description: "Explore a hypothetical P/E valuation. Change earnings and valuation assumptions to understand the sensitivity of an estimated value."
};

export default function ValuationPage() {
  return <div className="container">
    <header className={styles.intro}>
      <div><span className="eyebrow">THE VALUATION LAB</span><h1>Change the assumptions.<br/><em>Question the answer.</em></h1><p>A simple P/E exercise to explore the relationship between earnings, a valuation multiple, and an estimated value per share.</p></div>
      <aside><span className={styles.exampleLabel}>HYPOTHETICAL EXERCISE</span><p>No ticker. No live price feed.<br/>Just the method, with its assumptions in view.</p></aside>
    </header>
    <ValuationCalculator/>
    <section className={styles.contextGrid}>
      <article><BookOpen size={22} strokeWidth={1.5}/><h2>Why this multiple?</h2><p>An assumed multiple needs a reason. Business quality, growth expectations, cyclicality, and comparable companies may inform it. The calculator cannot decide which assumption is appropriate.</p><Link href="/learn/pe-valuation-and-assumptions" className="text-link">Read the P/E lesson <ArrowUpRight size={15}/></Link></article>
      <article><ShieldCheck size={22} strokeWidth={1.5}/><h2>Know the limits.</h2><p>Use earnings from a consistent annual period and label them as historical, forecast, or adjusted. A simple P/E exercise is unsuitable for zero or negative earnings and may mislead when earnings are unstable.</p><Link href="/learn/discounted-cash-flow-basics" className="text-link">Explore another method: DCF <ArrowUpRight size={15}/></Link></article>
    </section>
    <p className={styles.disclaimer}>Educational illustration only. A valuation gap is not an expected return, a price target, or a recommendation to buy, sell, or hold. These figures are not saved. <Link href="/disclaimer">Read the investment disclaimer.</Link></p>
  </div>;
}
