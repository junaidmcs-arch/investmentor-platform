import type { PoolClient } from "pg";
export function appLink(path: string) {
  const base = process.env.AUTH_URL;
  if (!base) throw new Error("AUTH_URL is required to create notification links.");
  return new URL(path, base).toString();
}
export async function enqueueEmail(client: PoolClient, email: string | null, subject: string, body: string, key: string) {
  if (!email) return;
  await client.query("INSERT INTO notification_outbox(to_email,subject,body,dedupe_key) VALUES($1,$2,$3,$4) ON CONFLICT(dedupe_key) DO NOTHING", [email, subject, body, key]);
}
