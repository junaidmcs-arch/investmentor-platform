import { api,jsonInput,requireUser } from "@/lib/server/http";
import { idInput,questionStatusInput } from "@/lib/server/validation";
import { questionDetail,updateQuestionStatus } from "@/lib/server/services";
type Context={params:Promise<{id:string}>};
export const GET=api(async(_request,context:Context)=>questionDetail(idInput.parse((await context.params).id),await requireUser(true)));
export const PATCH=api(async(request,context:Context)=>{
  const user=await requireUser(true); const data=questionStatusInput.parse(await jsonInput(request));
  return updateQuestionStatus(idInput.parse((await context.params).id),data.status,user);
});
