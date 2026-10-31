import type { PoolClient } from "pg";

export async function recordAudit(client: PoolClient, actorId: string, action: string, entityType: string, entityId: string | null, details: Record<string, unknown> = {}) {
  await client.query("INSERT INTO audit_events(actor_id,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)", [actorId,action,entityType,entityId,JSON.stringify(details)]);
}
