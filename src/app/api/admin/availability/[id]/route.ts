import { api,jsonInput,requireUser } from "@/lib/server/http";
import { closeSlot } from "@/lib/server/ecosystem";
import { idInput } from "@/lib/server/validation";
export const DELETE=api(async(request,context:{params:Promise<{id:string}>})=>{await jsonInput(request);return closeSlot(idInput.parse((await context.params).id),await requireUser(true));});
