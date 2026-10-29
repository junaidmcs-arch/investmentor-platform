import { api,jsonInput,requireUser } from "@/lib/server/http";
import { consultationUpdateInput,idInput } from "@/lib/server/validation";
import { updateConsultation } from "@/lib/server/services";
export const PATCH=api(async(request,context:{params:Promise<{id:string}>})=>{
  const user=await requireUser(true);const data=consultationUpdateInput.parse(await jsonInput(request));
  return updateConsultation(idInput.parse((await context.params).id),data,user);
});
