import { getCurrentUser } from "@/lib/server/auth";
import { api,jsonInput,requireServices,requireUser } from "@/lib/server/http";
import { consultationInput } from "@/lib/server/validation";
import { limitSubmission } from "@/lib/server/rate-limit";
import { createConsultation,listConsultations } from "@/lib/server/services";
export const GET=api(async()=>({consultations:await listConsultations(await requireUser())}));
export const POST=api(async request=>{
  requireServices();
  const data=consultationInput.parse(await jsonInput(request));
  await limitSubmission(request,data.email,"consultation");
  return createConsultation(data,await getCurrentUser());
});
