import { api,requireUser } from "@/lib/server/http";
import { adminOverview } from "@/lib/server/services";
export const GET=api(async()=>adminOverview(await requireUser(true)));
