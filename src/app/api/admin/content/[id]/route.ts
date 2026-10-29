import { api,jsonInput,requireUser } from "@/lib/server/http";
import { contentInput,idInput } from "@/lib/server/validation";
import { saveContent } from "@/lib/server/services";
export const PATCH=api(async(request,context:{params:Promise<{id:string}>})=>{
  const user=await requireUser(true);return saveContent(contentInput.parse(await jsonInput(request)),user,idInput.parse((await context.params).id));
});
