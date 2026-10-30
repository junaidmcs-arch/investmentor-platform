"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/company-studies", label: "Company studies" },
  { href: "/market-notes", label: "Market notes" },
  { href: "/tools/valuation", label: "Valuation lab" },
  { href: "/research-method", label: "Our method" }
];

export function Brand() {
  return <Link href="/" className="brand" aria-label="InvestMentor home">
    <span className="brand-symbol" aria-hidden="true"><svg width="25" height="28" viewBox="0 0 25 28" fill="none"><path d="M3 22V12h5v10M10 22V7h5v15M17 22V2h5v20" stroke="currentColor" strokeWidth="2.3"/><path d="M2 26h22" stroke="currentColor" strokeWidth="2"/></svg></span>
    <span><span className="brand-name">Invest<span>Mentor</span><span className="brand-dot">.</span></span><span className="brand-byline">BY VALIDACORE</span></span>
  </Link>;
}

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} className={path.startsWith(link.href) ? "nav-link active" : "nav-link"} aria-current={path.startsWith(link.href) ? "page" : undefined}>{link.label}</Link>)}</nav>
      <div className="header-actions"><Link href="/my-questions" className="login-link">My questions</Link><Link href="/ask" className="button button-primary button-small">Ask a question <ArrowUpRight size={15} /></Link></div>
      <button className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation" onClick={() => setOpen(false)}>{links.map(link => <Link key={link.href} href={link.href} aria-current={path.startsWith(link.href) ? "page" : undefined}>{link.label}<ArrowUpRight size={16}/></Link>)}<Link href="/my-questions">My questions<ArrowUpRight size={16}/></Link><Link href="/ask">Ask a question<ArrowUpRight size={16}/></Link></nav>}
  </header>;
}
