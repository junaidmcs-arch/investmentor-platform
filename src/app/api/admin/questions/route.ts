import { api,jsonInput,requireServices,requireUser } from "@/lib/server/http";
import { createQuestion,listQuestions } from "@/lib/server/services";
import { offlineQuestionInput } from "@/lib/server/validation";
export const GET=api(async request=>{
  const user=await requireUser(true); const parameters=new URL(request.url).searchParams;
  return {questions:await listQuestions(user,true,parameters.get("status")?.slice(0,30)??"",parameters.get("search")?.slice(0,150)??"")};
});
export const POST=api(async request=>{
  requireServices(); const user=await requireUser(true);
  return createQuestion(offlineQuestionInput.parse(await jsonInput(request)),user,true);
});
