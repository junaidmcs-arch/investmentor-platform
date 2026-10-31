import { api,jsonInput,requireUser } from "@/lib/server/http";
import { readNotification } from "@/lib/server/ecosystem";
import { idInput } from "@/lib/server/validation";
export const PATCH=api(async(request,context:{params:Promise<{id:string}>})=>{await jsonInput(request);return readNotification(idInput.parse((await context.params).id),await requireUser());});
