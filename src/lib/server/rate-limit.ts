import { createHash } from "node:crypto";
import { query } from "./db";
import { HttpError } from "./http";

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const keyHash = createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${key}`).digest("hex");
  const result = await query<{ count: number }>(`INSERT INTO rate_limits (key_hash, count, expires_at) VALUES ($1, 1, now() + $2 * interval '1 second')
    ON CONFLICT (key_hash) DO UPDATE SET count = CASE WHEN rate_limits.expires_at < now() THEN 1 ELSE rate_limits.count + 1 END,
    expires_at = CASE WHEN rate_limits.expires_at < now() THEN now() + $2 * interval '1 second' ELSE rate_limits.expires_at END RETURNING count`, [keyHash, windowSeconds]);
  if (result.rows[0].count > limit) throw new HttpError(429, "Too many requests. Please wait before trying again.");
}
export async function limitSubmission(request: Request, email: string, bucket: string) {
  // Only enable TRUST_PROXY when Nginx overwrites the forwarding header.
  const ip = process.env.TRUST_PROXY === "true" ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown") : "local";
  await consumeRateLimit(`${bucket}:ip:${ip}`, 30, 600);
  await consumeRateLimit(`${bucket}:email:${email.toLowerCase()}`, 5, 3600);
}
