import { api,jsonInput,requireUser } from "@/lib/server/http";
import { setBookmark } from "@/lib/server/ecosystem";
import { idInput } from "@/lib/server/validation";
export const PUT=api(async(request,context:{params:Promise<{id:string}>})=>{await jsonInput(request);return setBookmark(idInput.parse((await context.params).id),true,await requireUser());});
export const DELETE=api(async(request,context:{params:Promise<{id:string}>})=>{await jsonInput(request);return setBookmark(idInput.parse((await context.params).id),false,await requireUser());});
