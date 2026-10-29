import { getCurrentUser } from "@/lib/server/auth";
import { api,jsonInput,requireServices,requireUser } from "@/lib/server/http";
import { questionInput } from "@/lib/server/validation";
import { limitSubmission } from "@/lib/server/rate-limit";
import { createQuestion,listQuestions } from "@/lib/server/services";
export const GET=api(async()=>({questions:await listQuestions(await requireUser())}));
export const POST=api(async request=>{
  requireServices();
  const data=questionInput.parse(await jsonInput(request));
  await limitSubmission(request,data.email,"question");
  return createQuestion(data,await getCurrentUser());
});
