import { api,jsonInput,requireUser } from "@/lib/server/http";
import { updateUser } from "@/lib/server/ecosystem";
import { idInput,userUpdateInput } from "@/lib/server/validation";
export const PATCH=api(async(request,context:{params:Promise<{id:string}>})=>updateUser(idInput.parse((await context.params).id),userUpdateInput.parse(await jsonInput(request)),await requireUser()));
