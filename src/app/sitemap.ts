import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getPublishedContents } from "@/lib/server/content";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const content=await getPublishedContents();return [{url:site.url,changeFrequency:"weekly",priority:1},...["learn","company-studies","market-notes","tools/valuation","about"].map(path=>({url:`${site.url}/${path}`,changeFrequency:"weekly" as const,priority:.7})),...content.filter(item=>item.kind!=="faq").map(item=>({url:`${site.url}/${item.kind==="lesson"?"learn":item.kind==="study"?"company-studies":"market-notes"}/${item.slug}`,lastModified:new Date(item.publishedAt),priority:.6}))];}
