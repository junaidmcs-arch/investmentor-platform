import { api,jsonInput,requireUser } from "@/lib/server/http";
import { idInput,responseInput } from "@/lib/server/validation";
import { saveResponse } from "@/lib/server/services";
export const POST=api(async(request,context:{params:Promise<{id:string}>})=>{
  const user=await requireUser(true); const data=responseInput.parse(await jsonInput(request));
  return saveResponse(idInput.parse((await context.params).id),data,user);
});
