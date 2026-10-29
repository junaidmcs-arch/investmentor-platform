import { api } from "@/lib/server/http";
import { getPublishedContents } from "@/lib/server/content";
export const GET=api(async()=>({contents:await getPublishedContents()}));
