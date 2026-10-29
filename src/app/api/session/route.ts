import { getCurrentUser, isAuthConfigured } from "@/lib/server/auth";
import { api } from "@/lib/server/http";
export const GET=api(async()=>({user:await getCurrentUser(),configured:isAuthConfigured()}));
