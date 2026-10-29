import { api,requireUser } from "@/lib/server/http";
import { idInput } from "@/lib/server/validation";
import { questionDetail } from "@/lib/server/services";
export const GET=api(async(_request,context:{params:Promise<{id:string}>})=>questionDetail(idInput.parse((await context.params).id),await requireUser()));
