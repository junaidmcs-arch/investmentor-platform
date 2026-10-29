import { query } from "./db";

export type EmailJob = { id: string; to_email: string; subject: string; body: string; attempts: number; lock_token: string };

/** Each worker leases only the message it is about to send, rather than a batch. */
export async function claimEmailJob(): Promise<EmailJob | null> {
  const result = await query<EmailJob>(`WITH selected AS (
    SELECT id FROM notification_outbox
    WHERE sent_at IS NULL AND attempts < 5 AND available_at <= now()
      AND (locked_until IS NULL OR locked_until < now())
    ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED
  ) UPDATE notification_outbox SET locked_until=now()+interval '5 minutes',
    lock_token=gen_random_uuid(), attempts=attempts+1
    FROM selected WHERE notification_outbox.id=selected.id
    RETURNING notification_outbox.id,to_email,subject,body,attempts,lock_token`);
  return result.rows[0] ?? null;
}

export async function markEmailDelivered(job: EmailJob) {
  await query("UPDATE notification_outbox SET sent_at=now(),locked_until=NULL,lock_token=NULL,last_error=NULL WHERE id=$1 AND lock_token=$2",[job.id,job.lock_token]);
}

export async function retryEmail(job: EmailJob) {
  await query(`UPDATE notification_outbox SET locked_until=NULL,lock_token=NULL,last_error='Email delivery failed',
    available_at=now()+$3*interval '1 second' WHERE id=$1 AND lock_token=$2`,
    [job.id,job.lock_token,Math.min(3600,30*2**job.attempts)]);
}
