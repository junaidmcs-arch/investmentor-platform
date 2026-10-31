import { api,requireUser } from "@/lib/server/http";
import { listBookmarks } from "@/lib/server/ecosystem";
export const GET=api(async()=>({bookmarks:await listBookmarks(await requireUser())}));
