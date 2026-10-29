import { NextRequest, NextResponse } from "next/server";
import { handlers, isAuthConfigured } from "@/lib/server/auth";
import { assertOrigin, HttpError, readLimitedText } from "@/lib/server/http";
import { limitSubmission } from "@/lib/server/rate-limit";
import { emailInput } from "@/lib/server/validation";
import { ZodError } from "zod";
export const runtime = "nodejs";
function authErrorResponse(code: string, status: number, message: string) {
  // next-auth/react parses data.url even with redirect:false. Preserve that
  // contract for validation/rate-limit errors intercepted before Auth.js runs.
  const url=new URL("/sign-in",process.env.AUTH_URL || "http://localhost:3000");
  url.searchParams.set("error",code);
  return NextResponse.json({error:message,url:url.toString()},{status,headers:{"Cache-Control":"no-store"}});
}
export async function GET(request: NextRequest) {
  if (!isAuthConfigured()) return authErrorResponse("ServiceUnavailable",503,"Sign-in is not configured yet.");
  return handlers.GET(request);
}
export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return authErrorResponse("ServiceUnavailable",503,"Sign-in is not configured yet.");
  try {
    assertOrigin(request);
    if (request.nextUrl.pathname.endsWith("/signin/nodemailer")) {
      if (!request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) throw new HttpError(415,"Use the sign-in form.");
      const form=new URLSearchParams(await readLimitedText(request.clone(),4096));
      // Auth.js reads the last duplicate value; validate exactly one recipient
      // so the address being rate-limited is the address receiving the link.
      if (form.getAll("email").length !== 1) throw new HttpError(400,"Provide exactly one email address.");
      const email=emailInput.parse(form.get("email"));
      await limitSubmission(request,email,"sign-in");
    }
    return await handlers.POST(request);
  } catch(error) {
    if(error instanceof ZodError) return authErrorResponse("InvalidEmail",400,"Enter a valid email address.");
    return authErrorResponse(error instanceof HttpError && error.status===429 ? "RateLimit" : "ServiceUnavailable",error instanceof HttpError?error.status:503,error instanceof HttpError?error.message:"Sign-in is temporarily unavailable.");
  }
}
