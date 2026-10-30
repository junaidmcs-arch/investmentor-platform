import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Scale, ShieldCheck, ArrowRight, ArrowUpRight } from "lucide-react";
export const metadata: Metadata = { title: "Our approach" };

const principles = [
  { icon: BookOpen, title: "Understand the business", text: "Learn how companies earn money, read financial statements, and distinguish reported facts from forward-looking assumptions." },
  { icon: Scale, title: "Explore the assumptions", text: "Valuation is a method of reasoning. We explain its inputs, limitations, and sensitivity to change." },
  { icon: ShieldCheck, title: "Keep risk in view", text: "Company, sector, market, and portfolio risks belong in every investment conversation." },
];

export default function About() {
  return (
    <div className="container">
      <div className="page-intro about-intro">
        <span className="eyebrow">OUR APPROACH</span>
        <h1>Knowledge that helps you<br />ask better questions.</h1>
        <p>InvestMentor is a PSX education and inquiry platform by Validacore, created for Pakistani investors who want to understand how investment decisions are made.</p>
      </div>
      <div className="about-grid">
        {principles.map(item => (
          <section className="card" key={item.title}>
            <item.icon size={30} strokeWidth={1.4} />
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </section>
        ))}
      </div>
      <div className="prose legal-content">
        <h2>Built around learning</h2>
        <p>Our first release focuses on free learning resources, educational case studies, transparent calculation exercises, and questions answered by a human. We welcome questions in English, Urdu, and Roman Urdu.</p>
        <p>Study examples are labeled with their context and assumptions. Fictional companies and hypothetical numbers are used to explain methods. A calculation is an illustration, not a promise about a share price.</p>
        <h2>Trust through explanation</h2>
        <p>Our research framework starts with the business, traces the evidence, makes valuation assumptions visible, and considers what could go wrong. It ends with the questions that remain open. The aim is to help you examine the reasoning and recognize its limits.</p>
        <p>Check an article’s attribution, publication date, sources, and reporting periods. An editorial label does not establish professional credentials, and a published example does not become current market data.</p>
        <Link href="/research-method" className="text-link">Explore our research method <ArrowRight size={16} /></Link>
        <h2>A conversation with context</h2>
        <p>You can ask a question without creating an account first. Verified email access protects your private question history. You can also request a learning session; your preferred time becomes an appointment only after confirmation.</p>
        <p>Questions and sessions focus on understanding concepts and methods. They do not involve managing your funds, accessing your brokerage account, or providing a signal subscription.</p>
        <Link href="/ask" className="button button-primary">Ask your first question <ArrowUpRight size={17} /></Link>
      </div>
    </div>
  );
}
