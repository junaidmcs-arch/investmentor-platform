import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, isAuthConfigured, isStaff } from "./auth";
import { isDatabaseConfigured } from "./db";

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.AUTH_URL ? new URL(process.env.AUTH_URL).origin : new URL(request.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, "Request origin is not allowed.");
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Cross-site requests are not allowed.");
}
export async function readLimitedText(request: Request, maximumBytes = 100000) {
  if (Number(request.headers.get("content-length") ?? 0) > maximumBytes) throw new HttpError(413, "Request is too large.");
  // Bound the actual streamed payload, including chunked requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "A request body is required.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) { await reader.cancel(); throw new HttpError(413, "Request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const buffer = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(buffer);
}
export async function jsonInput(request: Request) {
  assertOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Send a JSON request.");
  const body = await readLimitedText(request);
  try { return JSON.parse(body); } catch { throw new HttpError(400, "Invalid JSON request."); }
}
export function requireServices() {
  if (!isDatabaseConfigured() || !isAuthConfigured()) throw new HttpError(503, "Online submissions are not enabled yet. The service needs its database and email configuration.");
}
export async function requireUser(staff = false) {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  if (staff && !isStaff(user)) throw new HttpError(403, "Consultant access is required.");
  return user;
}
export function api<T extends unknown[]>(handler: (request: Request, ...args: T) => Promise<unknown>) {
  return async (request: Request, ...args: T) => {
    try {
      const value = await handler(request, ...args);
      if (value instanceof Response) return value;
      return NextResponse.json(value, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
      if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
      if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Please check your input." }, { status: 400 });
      const code = (error as { code?: string })?.code;
      if (code === "23505") return NextResponse.json({ error: "A record with those details already exists." }, { status: 409 });
      if (code === "22P02") return NextResponse.json({ error: "Invalid record identifier." }, { status: 400 });
      console.error("API request failed", { code: code ?? "INTERNAL_ERROR" });
      return NextResponse.json({ error: "The service is temporarily unavailable. Please try again later." }, { status: 503 });
    }
  };
}
