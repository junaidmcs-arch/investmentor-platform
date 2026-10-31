"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { apiRequest,usePortalSession,pakistanDate } from "@/components/forms/portal-client";
import { AccessGate,ErrorMessage } from "@/components/forms/portal-ui";
import { InvestorNavigation } from "@/components/forms/investor-navigation";
import styles from "@/components/forms/portal.module.css";
type Notice={id:string;title:string;createdAt:string;readAt:string|null};
type Feed={notifications:Notice[];unread:number;hasMore:boolean};
export default function NotificationsPage(){
 const session=usePortalSession();const [feed,setFeed]=useState<Feed|null>(null),[page,setPage]=useState(1),[revision,setRevision]=useState(0),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 useEffect(()=>{if(!session.user)return;let active=true;apiRequest<Feed>(`/api/notifications?page=${page}`).then(r=>{if(active)setFeed(r);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[session.user,page,revision]);
 async function read(id:string){setBusy(id);setError(null);try{await apiRequest(`/api/notifications/${id}`,{method:"PATCH",body:"{}"});setRevision(v=>v+1);}catch(e){setError((e as Error).message);}finally{setBusy(null);}}
 return <div className={`container ${styles.workspace}`}><header className="page-intro"><span className="eyebrow">Investor workspace</span><h1>Keep up with your questions.</h1><p>Updates about your inquiries, responses, and educational sessions.</p></header><AccessGate session={session}><InvestorNavigation/><ErrorMessage message={error}/>{feed?<><p>{feed.unread} unread update{feed.unread===1?"":"s"}</p>{feed.notifications.length?feed.notifications.map(n=><article className={styles.formPanel} key={n.id} style={{marginBottom:16}}><span className="eyebrow">{n.readAt?"Read":"Unread"}</span><h3>{n.title}</h3><p>{pakistanDate(n.createdAt)}</p><div className={styles.inline}><Link className="text-link" href="/my-questions">View my questions and sessions</Link>{!n.readAt&&<button className="button button-secondary button-small" disabled={busy===n.id} onClick={()=>read(n.id)}>Mark as read</button>}</div></article>):<p>No updates yet.</p>}<div className={styles.inline}><button className="button button-secondary button-small" disabled={page===1} onClick={()=>setPage(v=>v-1)}>Previous</button><span>Page {page}</span><button className="button button-secondary button-small" disabled={!feed.hasMore} onClick={()=>setPage(v=>v+1)}>Next</button></div></>:<p role="status">Loading updates…</p>}</AccessGate></div>;
}
