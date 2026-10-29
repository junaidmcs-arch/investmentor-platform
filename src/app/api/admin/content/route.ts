import { api,jsonInput,requireUser } from "@/lib/server/http";
import { contentInput } from "@/lib/server/validation";
import { listAdminContent,saveContent } from "@/lib/server/services";
export const GET=api(async()=>({contents:await listAdminContent(await requireUser(true))}));
export const POST=api(async request=>{
  const user=await requireUser(true);return saveContent(contentInput.parse(await jsonInput(request)),user);
});
