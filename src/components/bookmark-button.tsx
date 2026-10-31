"use client";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";
import { apiRequest,usePortalSession } from "./forms/portal-client";
export function BookmarkButton({contentId}:{contentId:string}){
 const session=usePortalSession(),path=usePathname();
 const [saved,setSaved]=useState(false),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>{if(!session.user)return;let active=true;apiRequest<{bookmarks:{id:string}[]}>("/api/bookmarks").then(r=>{if(active){setSaved(r.bookmarks.some(b=>b.id===contentId));setReady(true);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[session.user,contentId]);
 async function toggle(){setBusy(true);setError(null);try{const result=await apiRequest<{saved:boolean}>(`/api/bookmarks/${contentId}`,{method:saved?"DELETE":"PUT",body:"{}"});setSaved(result.saved);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 if(session.loading||!session.configured)return null;
 return <div style={{marginTop:20}}>{session.user?<button className="button button-secondary button-small" type="button" disabled={busy||!ready} aria-pressed={saved} onClick={toggle}><Bookmark size={15}/>{busy?"Saving…":saved?"Saved · remove bookmark":"Save research"}</button>:<Link className="text-link" href={`/sign-in?next=${encodeURIComponent(path)}`}>Sign in to save this article <Bookmark size={15}/></Link>}{error&&<p role="alert">{error}</p>}</div>;
}
