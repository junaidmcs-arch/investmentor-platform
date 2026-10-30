import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteChrome } from "@/components/site-chrome";
import { site } from "@/lib/site";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "InvestMentor — Learn. Analyze. Invest smarter.", template: "%s | InvestMentor" },
  description: site.description,
  openGraph: { title: "InvestMentor by Validacore", description: site.description, type: "website", locale: "en_PK" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">Skip to content</a><SiteChrome header={<SiteHeader/>} footer={<SiteFooter/>}>{children}</SiteChrome></body></html>;
}
