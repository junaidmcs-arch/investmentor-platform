"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { apiRequest,usePortalSession } from "@/components/forms/portal-client";
import { AccessGate,ErrorMessage } from "@/components/forms/portal-ui";
import { InvestorNavigation,contentUrl } from "@/components/forms/investor-navigation";
import styles from "@/components/forms/portal.module.css";
type Saved={id:string;title:string;excerpt:string;kind:string;slug:string};
export default function BookmarksPage(){
 const session=usePortalSession();const [items,setItems]=useState<Saved[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 useEffect(()=>{if(!session.user)return;let active=true;apiRequest<{bookmarks:Saved[]}>("/api/bookmarks").then(r=>{if(active)setItems(r.bookmarks);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[session.user]);
 async function remove(id:string){setBusy(id);setError(null);try{await apiRequest(`/api/bookmarks/${id}`,{method:"DELETE",body:"{}"});setItems(items=>items.filter(item=>item.id!==id));}catch(e){setError((e as Error).message);}finally{setBusy(null);}}
 return <div className={`container ${styles.workspace}`}><header className="page-intro"><span className="eyebrow">Investor workspace</span><h1>Research to return to.</h1><p>Your saved lessons, company studies, and market notes.</p></header><AccessGate session={session}><InvestorNavigation/><ErrorMessage message={error}/>{loading?<p role="status">Loading saved research…</p>:items.length?<div className="card-grid">{items.map(item=><article className="card" key={item.id}><h3><Link href={contentUrl(item)}>{item.title}</Link></h3><p>{item.excerpt}</p><div className={styles.inline}><Link className="text-link" href={contentUrl(item)}>Read article</Link><button className="button button-secondary button-small" disabled={busy===item.id} onClick={()=>remove(item.id)}>Remove bookmark</button></div></article>)}</div>:<div className={styles.empty}><h2>Build your reading list.</h2><p>Use “Save research” on an article to keep it here. Articles removed from publication no longer appear.</p><Link href="/learn" className="button button-primary">Explore the library</Link></div>}</AccessGate></div>;
}
