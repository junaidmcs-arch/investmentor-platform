import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Building2, ChartNoAxesCombined, Check, Compass, MessageCircle, Scale, ShieldCheck, Sprout } from "lucide-react";
import { getPublishedContents } from "@/lib/server/content";
import { whatsappUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
const levels = [
  { icon: Compass, title: "Build your foundation", text: "Understand PSX, accounts, and the language of investing." },
  { icon: Building2, title: "Know the business", text: "Read financial statements. Look beyond the share price." },
  { icon: Scale, title: "Explore its value", text: "Understand valuation methods and the assumptions behind them." },
  { icon: ShieldCheck, title: "Recognize the risks", text: "Consider what could go wrong before deciding what comes next." },
  { icon: ChartNoAxesCombined, title: "See the bigger picture", text: "Connect market behavior with the economy around it." }
];

export default async function Home() {
  const lessons = (await getPublishedContents("lesson")).slice(0, 3);
  const whatsapp = whatsappUrl();
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="status-dot"/>A CLEARER PATH TO PSX INVESTING</div>
        <h1>Learn. Analyze.<br/>Invest <em>smarter.</em></h1>
        <p className="hero-description">Understand the business behind the stock.<br className="desktop-break"/> Build your knowledge, explore valuations, and make risk part of every investment conversation.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/learn">Start your learning journey <ArrowUpRight size={18}/></Link><Link className="button button-plain" href="/company-studies">Explore company studies <ArrowRight size={17}/></Link></div>
        <div className="hero-proof"><span><Check size={15}/> Free educational resources</span><span><Check size={15}/> Built for Pakistani investors</span></div>
      </div>
      <div className="hero-visual" aria-label="An illustrative valuation notebook">
        <div className="notebook"><div className="notebook-top"><span className="notebook-mark"><Sprout size={16}/> THE INVESTOR’S NOTEBOOK</span><span className="notebook-issue">NO. 001</span></div>
          <div className="notebook-body"><span className="tiny-label">A DIFFERENT WAY TO LOOK AT A STOCK</span><h2>Price is a number.<br/>Value is a question.</h2><p>What assumptions sit behind an estimate?</p>
            <div className="notebook-chart"><div className="chart-lines"><i/><i/><i/></div><div className="notebook-bar-group"><div className="bar-value">PKR 120</div><div className="notebook-bar price-bar"/><span>Example price</span></div><div className="notebook-bar-group"><div className="bar-value green-text">PKR 160<span className="estimate-tag">ESTIMATE</span></div><div className="notebook-bar estimate-bar"/><span>Assumed value</span></div></div>
            <div className="notebook-equation"><span>EPS <strong>20</strong></span><span className="muted">×</span><span>Assumed P/E <strong>8</strong></span><span className="muted">=</span><strong>PKR 160</strong></div><div className="notebook-footnote">Hypothetical inputs. Change the assumptions, change the answer.</div>
          </div>
        </div>
        <Link href="/tools/valuation" className="notebook-sticky"><span className="sticky-icon"><Scale size={19}/></span><span>Try the valuation lab<small>Explore the “what if.”</small></span><ArrowUpRight size={20}/></Link>
        <span className="visual-caption">KNOWLEDGE FIRST. PERSPECTIVE ALWAYS.</span>
      </div>
    </div></section>
    <section className="principle-strip"><div className="container principle-inner"><span>Good investing begins with<br/><strong>better questions.</strong></span><div><BookOpen size={20}/><span>Understand<br/><b>the fundamentals</b></span></div><div><Scale size={20}/><span>Question<br/><b>the valuation</b></span></div><div><ShieldCheck size={20}/><span>Consider<br/><b>the downside</b></span></div><div className="principle-urdu" lang="ur" dir="rtl">سمجھ کر سرمایہ کاری کریں</div></div></section>
    <section className="section learning-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">YOUR LEARNING ROADMAP</span><h2>A framework for<br/>independent thinking.</h2></div><p>Start with the basics. Build your understanding one step at a time, with risk awareness throughout.</p></div><div className="level-grid">{levels.map((level, index) => <Link href={`/learn?level=${index + 1}`} className={`level-card ${index === 0 ? "level-first" : ""}`} key={level.title}><div className="level-top"><level.icon size={23} strokeWidth={1.5}/><span>0{index + 1}</span></div><h3>{level.title}</h3><p>{level.text}</p><div className="level-bottom"><span>{index === 0 ? "START HERE" : `LEVEL ${index + 1}`}</span><ArrowUpRight size={19}/></div></Link>)}</div></div></section>
    <section className="section latest-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">FROM THE LEARNING LIBRARY</span><h2>Make the next concept click.</h2></div><Link className="text-link" href="/learn">View all lessons <ArrowRight size={17}/></Link></div><div className="lesson-preview-grid">{lessons.map((lesson, index) => <Link className="lesson-preview" key={lesson.id} href={`/learn/${lesson.slug}`}><div className={`lesson-art lesson-art-${index}`} aria-hidden="true">{index === 0 ? <><span className="art-exchange">PSX</span><span className="art-caption">START WITH THE BIG PICTURE</span><div className="art-grid"/></> : index === 1 ? <><div className="art-ledger"><span>THE BUSINESS</span><i/><i/><i/><strong>Behind every share,<br/>a story.</strong></div><Building2 size={72} strokeWidth={.7}/></> : <><div className="art-risk-circles"><span/><span/><span/></div><ShieldCheck size={68} strokeWidth={1}/><span className="art-caption">KNOW WHAT YOU OWN</span></>}</div><div className="lesson-preview-body"><div className="article-meta"><span>{lesson.category}</span><span>{lesson.readMinutes} min read</span></div><h3>{lesson.title}</h3><p>{lesson.excerpt}</p><span className="text-link">Read the lesson <ArrowUpRight size={17}/></span></div></Link>)}</div></div></section>
    <section className="section approach-section"><div className="container approach-grid"><div><span className="eyebrow">THE INVESTMENTOR APPROACH</span><h2>Follow the evidence.<br/><em>Understand the uncertainty.</em></h2><p>Every company study is a chance to learn a method. Look at the business, examine the numbers, and ask what could change the picture.</p><Link href="/company-studies" className="button button-secondary">Explore the studies <ArrowUpRight size={17}/></Link></div><div className="approach-list">{[{n:"01",title:"Start with the business",text:"Understand how a company earns, spends, and grows."},{n:"02",title:"Make assumptions visible",text:"See the inputs and sources behind the analysis."},{n:"03",title:"Give risk a seat at the table",text:"Explore the downside alongside the possibilities."}].map(item=><div key={item.n}><span>{item.n}</span><section><h3>{item.title}</h3><p>{item.text}</p></section><ArrowUpRight size={20}/></div>)}</div></div></section>
    <section className="section"><div className="container"><div className="conversation-panel"><div className="conversation-icon"><MessageCircle size={29} strokeWidth={1.3}/></div><div><span className="eyebrow">LEARNING IS A CONVERSATION</span><h2>A question is a good place to start.</h2><p>Ask about a concept, a financial statement, or a valuation method.<br/>English, Urdu, or Roman Urdu — whichever feels natural.</p></div><div className="conversation-actions"><Link className="button button-light" href="/ask">Ask a question <ArrowUpRight size={18}/></Link>{whatsapp ? <a className="conversation-secondary" href={whatsapp} target="_blank" rel="noopener noreferrer">Or connect on WhatsApp <ArrowUpRight size={15}/></a> : <Link className="conversation-secondary" href="/sessions">Request a learning session <ArrowUpRight size={15}/></Link>}</div></div></div></section>
  </>;
}
