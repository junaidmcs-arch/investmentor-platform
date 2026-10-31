import { api,jsonInput,requireUser } from "@/lib/server/http";
import { listUsers,createConsultant } from "@/lib/server/ecosystem";
import { consultantCreateInput } from "@/lib/server/validation";
import { pageNumber } from "@/lib/server/pagination";
export const GET=api(async request=>{const url=new URL(request.url);return listUsers(await requireUser(),(url.searchParams.get("search")??"").slice(0,100),pageNumber(request));});
export const POST=api(async request=>createConsultant(consultantCreateInput.parse(await jsonInput(request)),await requireUser()));
