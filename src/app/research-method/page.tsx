import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, FileSearch } from "lucide-react";
import styles from "./method.module.css";

export const metadata: Metadata = {
  title: "Our research method",
  description: "Learn how to study a business, trace the evidence, challenge valuation assumptions, and consider risk with InvestMentor's educational research framework.",
};

const steps = [
  {
    title: "Understand the business",
    question: "How does this company earn its money?",
    explanation: "Start with products, customers, costs, and competition. Connect revenue and profit to the activities behind them, and consider which parts of the business depend on policy, commodity prices, or a small number of customers.",
    output: "A plain-language explanation of the business and its main dependencies.",
    href: "/learn/reading-financial-statements",
    link: "Connect the three financial statements",
  },
  {
    title: "Trace the evidence",
    question: "Where did each important figure come from?",
    explanation: "Go back to the relevant financial statement, company disclosure, or original data release. Note the reporting period, currency, and whether figures are consolidated or standalone. Keep a reported fact separate from management's outlook and your own interpretation.",
    output: "A source trail, consistent reporting periods, and a list of missing information.",
    href: "/learn/financial-ratios-in-context",
    link: "Put financial ratios in context",
  },
  {
    title: "Make the assumptions visible",
    question: "What has to be true for this valuation to make sense?",
    explanation: "Choose a method that fits the business and the available evidence. Explain the earnings, growth, cash-flow, or valuation-multiple assumptions it uses. Change the inputs to see how much the result depends on them.",
    output: "An assumption-dependent estimate with sensitivity to change, rather than a promised outcome.",
    href: "/tools/valuation",
    link: "Explore assumptions in the valuation lab",
  },
  {
    title: "Consider the downside",
    question: "What could weaken the business or invalidate the assumptions?",
    explanation: "Examine cash needs, borrowing, governance, and sector exposures alongside possible growth. Consider how a change in demand, interest rates, exchange rates, or policy could affect the reasoning. Several holdings can still share the same risk.",
    output: "Specific risk questions and conditions under which the initial view would change.",
    href: "/learn/company-and-sector-risk",
    link: "Build a company and sector risk checklist",
  },
  {
    title: "Review what remains uncertain",
    question: "What do we still need to learn?",
    explanation: "Bring the evidence, assumptions, and risks together. Record what is unknown and which future disclosures would help resolve it. Revisit the reasoning when the evidence changes; an old analysis date is not evidence of current conditions.",
    output: "A dated explanation, its limitations, and questions for the next review.",
    href: "/learn/sentiment-and-market-evidence",
    link: "Separate a narrative from its evidence",
  },
];

export default function ResearchMethod() {
  return (
    <div className="container">
      <header className={`page-intro ${styles.intro}`}>
        <span className="eyebrow">THE RESEARCH METHOD</span>
        <h1>Understand the reasoning.<br />See the limits.</h1>
        <p>A repeatable way to study a business, question a valuation, and keep risk in view. Follow the evidence from the first question to the final explanation.</p>
        <div className={styles.introNote}><BookOpen size={17} /><span>An educational framework for Pakistani investors.</span></div>
      </header>

      <div className={styles.methodLayout}>
        <section aria-labelledby="method-steps-heading">
          <h2 id="method-steps-heading" className="sr-only">Five steps to a more considered analysis</h2>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                <div>
                  <h2>{step.title}</h2>
                  <p className={styles.question}>{step.question}</p>
                  <p>{step.explanation}</p>
                  <p className={styles.output}><strong>What to take away</strong>{step.output}</p>
                  <Link className="text-link" href={step.href}>{step.link}<ArrowUpRight size={16} /></Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className={styles.example} aria-labelledby="example-heading">
          <div className={styles.exampleHeading}><FileSearch size={22} /><span className="eyebrow">READ THE LABELS</span></div>
          <h2 id="example-heading">One number.<br />Different meanings.</h2>
          <p>Before using a figure, establish what kind of information it represents.</p>
          <dl className={styles.distinctions}>
            <div><dt>Reported fact</dt><dd>A figure attributable to a named source and reporting period. It still needs context.</dd></div>
            <div><dt>Assumption</dt><dd>An input chosen for an exercise or forecast. Explain why it was chosen and what could change it.</dd></div>
            <div><dt>Calculated estimate</dt><dd>The result of a method and its inputs. Its precision does not remove uncertainty.</dd></div>
          </dl>
          <div className={styles.illustration}>
            <span className="eyebrow">HYPOTHETICAL EXAMPLE</span>
            <p>Assumed annual EPS <strong>PKR 20</strong><br />Assumed P/E <strong>8×</strong></p>
            <p className={styles.exampleResult}>Estimated value: <strong>PKR 160</strong></p>
            <p>Both inputs here are invented for learning. The result is not a current company valuation or an expected return.</p>
          </div>
          <Link className="text-link" href="/company-studies/valuation-sensitive-to-assumptions">Read the illustrative case<ArrowRight size={16} /></Link>
        </aside>
      </div>

      <section className={styles.provenance} aria-labelledby="provenance-heading">
        <div>
          <span className="eyebrow">A BASIS FOR TRUST</span>
          <h2 id="provenance-heading">Make the work<br />easy to question.</h2>
          <p>Trust grows when you can identify who wrote something, inspect its sources, and understand its limits.</p>
        </div>
        <dl className={styles.provenanceList}>
          <div><dt>Authorship</dt><dd>The author label identifies the writer or editorial attribution. It does not by itself establish professional credentials or independent review.</dd></div>
          <div><dt>Dates and periods</dt><dd>A publication date tells you when a page was published. Check the reporting period and analysis date separately; publishing a page does not make its figures live.</dd></div>
          <div><dt>Sources and interpretation</dt><dd>Follow cited sources to the original material where possible. A source supports the facts attributed to it, not every conclusion drawn from them.</dd></div>
          <div><dt>Illustrations and corrections</dt><dd>Our starter company studies use fictional businesses and hypothetical figures. If a source, calculation, or explanation is unclear, include the page title when you <Link href="/ask?topic=Question%20about%20the%20research%20method">ask us a question</Link>.</dd></div>
        </dl>
      </section>

      <section className={styles.nextStep} aria-labelledby="scope-heading">
        <div>
          <span className="eyebrow">LEARN THE PROCESS</span>
          <h2 id="scope-heading">Put the framework into practice.</h2>
          <p>The first release offers lessons, illustrative studies, calculation exercises, and educational questions. These help explain a method; they do not establish whether a security is suitable for you or instruct you to buy, sell, or hold it.</p>
          <Link className="text-link" href="/disclaimer">Read the investment disclaimer<ArrowRight size={16} /></Link>
        </div>
        <Link className="button button-primary" href="/company-studies">Explore company studies<ArrowUpRight size={17} /></Link>
      </section>
    </div>
  );
}
