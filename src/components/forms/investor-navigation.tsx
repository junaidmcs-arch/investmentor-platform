"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./portal.module.css";
export function InvestorNavigation(){
 const path=usePathname();
 return <nav className={styles.investorNav} aria-label="Investor workspace">{[{href:"/my-questions",label:"Questions & sessions"},{href:"/my-questions/bookmarks",label:"Saved research"},{href:"/my-questions/notifications",label:"Notifications"},{href:"/sessions/book",label:"Reserve a time"}].map(link=><Link key={link.href} href={link.href} aria-current={path===link.href?"page":undefined}>{link.label}</Link>)}</nav>;
}
export function contentUrl(item:{kind:string;slug:string}){return `${item.kind==="lesson"?"/learn":item.kind==="study"?"/company-studies":"/market-notes"}/${item.slug}`;}
