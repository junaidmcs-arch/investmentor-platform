import { api,requireUser } from "@/lib/server/http";
import { listNotifications } from "@/lib/server/ecosystem";
import { pageNumber } from "@/lib/server/pagination";
export const GET=api(async request=>listNotifications(await requireUser(),pageNumber(request)));
