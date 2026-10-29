import { api,requireUser } from "@/lib/server/http";
import { listConsultations } from "@/lib/server/services";
export const GET=api(async()=>({consultations:await listConsultations(await requireUser(true),true)}));
