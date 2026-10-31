import { api,jsonInput,requireUser } from "@/lib/server/http";
import { moderateContent } from "@/lib/server/ecosystem";
import { idInput,moderationInput } from "@/lib/server/validation";
export const PATCH=api(async(request,context:{params:Promise<{id:string}>})=>moderateContent(idInput.parse((await context.params).id),moderationInput.parse(await jsonInput(request)),await requireUser()));
