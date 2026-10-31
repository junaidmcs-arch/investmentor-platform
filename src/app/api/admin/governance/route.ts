import { api,requireUser } from "@/lib/server/http";
import { adminAnalytics,auditHistory } from "@/lib/server/ecosystem";
import { pageNumber } from "@/lib/server/pagination";
export const GET=api(async request=>{const user=await requireUser();return {analytics:await adminAnalytics(user),...await auditHistory(user,pageNumber(request))};});
