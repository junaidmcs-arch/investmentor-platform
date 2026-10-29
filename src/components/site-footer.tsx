import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./site-header";
import { site, whatsappUrl } from "@/lib/site";

export function SiteFooter() {
  const whatsapp = whatsappUrl();
  return <footer className="site-footer"><div className="container">
    <div className="footer-main"><div className="footer-brand"><Brand/><p>Better questions.<br/>More informed investors.</p><span className="footer-location">Made for Pakistan. Built by Validacore.</span></div>
      <div><h3>Explore</h3><Link href="/learn">Learning library</Link><Link href="/company-studies">Company studies</Link><Link href="/market-notes">Market notes</Link><Link href="/tools/valuation">Valuation lab</Link></div>
      <div><h3>Connect</h3><Link href="/about">Our approach</Link><Link href="/ask">Ask a question</Link><Link href="/sessions">Request a learning session</Link>{whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={12}/></a>}{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}</div>
      <div><h3>Your account</h3><Link href="/my-questions">My questions</Link><Link href="/sign-in">Sign in</Link><Link href="/dashboard">Consultant workspace</Link></div>
    </div>
    <div className="footer-disclaimer"><span className="eyebrow">LEARNING WITH PERSPECTIVE</span><p>InvestMentor provides educational information. Examples and valuations depend on stated assumptions and do not guarantee returns. Investing involves risk, including loss of capital. Read our <Link href="/disclaimer">investment disclaimer</Link>.</p></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} InvestMentor by Validacore.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms of use</Link><Link href="/disclaimer">Disclaimer</Link></div></div>
  </div></footer>;
}
