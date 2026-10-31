import type { PoolClient } from "pg";
import type { z } from "zod";
import { type CurrentUser, isStaff } from "./auth";
import { query, transaction } from "./db";
import { HttpError } from "./http";
import { configuredAdmin } from "./roles";
import { recordAudit } from "./audit";
import { appLink, enqueueEmail } from "./notifications";
import { consultantCreateInput, userUpdateInput, moderationInput, slotInput, slotBookingInput } from "./validation";

export function requireAdminRole(user: CurrentUser) {
  if (user.role !== "ADMIN") throw new HttpError(403,"Administrator access is required.");
}
async function liveAdmin(client: PoolClient, user: CurrentUser) {
  requireAdminRole(user);
  await client.query("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
  const result = await client.query('SELECT email,role,"emailVerified",suspended_at FROM users WHERE id=$1',[user.id]);
  const actor = result.rows[0];
  if (!actor?.emailVerified || actor.suspended_at || (actor.role !== "ADMIN" && !configuredAdmin(actor.email))) throw new HttpError(403,"Administrator access is required.");
}
export async function listUsers(user: CurrentUser, search = "", page = 1) {
  requireAdminRole(user);
  const pattern = `%${search.replace(/[%_\\]/g,"\\$&")}%`;
  const result = await query('SELECT id,name,email,role,"emailVerified",suspended_at AS "suspendedAt",created_at AS "createdAt" FROM users WHERE email ILIKE $1 OR name ILIKE $1 ORDER BY created_at DESC,id LIMIT 51 OFFSET $2',[pattern,(page-1)*50]);
  return { users: result.rows.slice(0,50).map(row => ({...row,role:configuredAdmin(row.email) ? "ADMIN" : row.role,protected:configuredAdmin(row.email) || row.id === user.id})), hasMore:result.rows.length>50 };
}
export async function createConsultant(data: z.infer<typeof consultantCreateInput>, user: CurrentUser) {
  return transaction(async client => {
    await liveAdmin(client,user);
    const result = await client.query("INSERT INTO users(name,email,role) VALUES($1,$2,'CONSULTANT') RETURNING id",[data.name,data.email]);
    await recordAudit(client,user.id,"consultant.created","user",result.rows[0].id,{role:"CONSULTANT"});
    await enqueueEmail(client,data.email,"Your InvestMentor consultant workspace",`You have been invited to the consultant workspace. Verify your email through the normal sign-in page: ${appLink('/sign-in?next=%2Fdashboard')}\n\nA consultant account requires email verification before access.`,`consultant-invitation:${result.rows[0].id}`);
    return {message:"Consultant added. Sign-in instructions have been queued by email."};
  });
}
export async function updateUser(id: string, data: z.infer<typeof userUpdateInput>, user: CurrentUser) {
  return transaction(async client => {
    await liveAdmin(client,user);
    const target = (await client.query("SELECT email,role,suspended_at FROM users WHERE id=$1 FOR UPDATE",[id])).rows[0];
    if (!target) throw new HttpError(404,"User not found.");
    if (id === user.id || configuredAdmin(target.email)) throw new HttpError(400,"Your own account and configured administrator accounts cannot be changed here.");
    await client.query("UPDATE users SET role=$2,suspended_at=CASE WHEN $3 THEN COALESCE(suspended_at,now()) ELSE NULL END WHERE id=$1",[id,data.role,data.suspended]);
    await client.query('DELETE FROM sessions WHERE "userId"=$1',[id]);
    // Remove future availability when a consultant no longer has staff access.
    if (data.suspended || data.role === "CLIENT") await client.query("UPDATE appointment_slots SET closed=true WHERE consultant_id=$1 AND starts_at>now()",[id]);
    await recordAudit(client,user.id,"user.access_changed","user",id,{fromRole:target.role,toRole:data.role,suspended:data.suspended});
    return {message:"Access updated. Existing sessions have been revoked."};
  });
}
export async function moderateContent(id: string, data: z.infer<typeof moderationInput>, user: CurrentUser) {
  return transaction(async client => {
    await liveAdmin(client,user);
    const before = (await client.query("SELECT * FROM contents WHERE id=$1 FOR UPDATE",[id])).rows[0];
    if (!before) throw new HttpError(404,"Content not found.");
    await client.query("INSERT INTO content_revisions(content_id,actor_id,snapshot) VALUES($1,$2,$3)",[id,user.id,JSON.stringify(before)]);
    await client.query("UPDATE contents SET moderation_hold=$2,moderation_note=$3,status='DRAFT',published_at=NULL,updated_at=now() WHERE id=$1",[id,data.hold,data.note]);
    await recordAudit(client,user.id,data.hold ? "content.held" : "content.released","content",id,{note:data.note});
    return {message:data.hold ? "Content removed from public view and held for review." : "Hold released. The content remains a draft until published."};
  });
}
export async function adminAnalytics(user: CurrentUser) {
  requireAdminRole(user);
  const [users,questions,content,sessions] = await Promise.all([
    query("SELECT count(*)::int AS total,count(*) FILTER(WHERE suspended_at IS NOT NULL)::int AS suspended FROM users"),
    query("SELECT count(*)::int AS total,count(*) FILTER(WHERE created_at>=now()-interval '30 days')::int AS recent,count(*) FILTER(WHERE status='ANSWERED')::int AS answered FROM questions"),
    query("SELECT count(*) FILTER(WHERE status='PUBLISHED' AND NOT moderation_hold)::int AS published,count(*) FILTER(WHERE moderation_hold)::int AS held FROM contents"),
    query("SELECT count(*) FILTER(WHERE status='REQUESTED')::int AS requested,count(*) FILTER(WHERE status='COMPLETED')::int AS completed FROM consultations"),
  ]);
  const responseTime = await query("SELECT round(avg(extract(epoch from (r.first_reply-q.created_at))/3600)::numeric,1) AS hours FROM questions q JOIN (SELECT question_id,min(published_at) AS first_reply FROM responses WHERE published_at IS NOT NULL GROUP BY question_id) r ON r.question_id=q.id");
  return {users:users.rows[0],questions:questions.rows[0],content:content.rows[0],sessions:sessions.rows[0],averageFirstResponseHours:responseTime.rows[0].hours};
}
export async function auditHistory(user: CurrentUser, page = 1) {
  requireAdminRole(user);
  const result = await query('SELECT a.id,a.action,a.entity_type AS "entityType",a.entity_id AS "entityId",a.details,a.created_at AS "createdAt",u.email AS actor FROM audit_events a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC,a.id LIMIT 51 OFFSET $1',[(page-1)*50]);
  return {events:result.rows.slice(0,50),hasMore:result.rows.length>50};
}
export async function listBookmarks(user: CurrentUser) {
  return (await query('SELECT c.id,c.slug,c.kind,c.title,c.excerpt,b.created_at AS "savedAt" FROM bookmarks b JOIN contents c ON c.id=b.content_id WHERE b.user_id=$1 AND c.status=\'PUBLISHED\' AND NOT c.moderation_hold ORDER BY b.created_at DESC',[user.id])).rows;
}
export async function setBookmark(id: string, saved: boolean, user: CurrentUser) {
  if (!saved) { await query("DELETE FROM bookmarks WHERE user_id=$1 AND content_id=$2",[user.id,id]); return {saved:false}; }
  const result = await query("INSERT INTO bookmarks(user_id,content_id) SELECT $1,id FROM contents WHERE id=$2 AND status='PUBLISHED' AND NOT moderation_hold ON CONFLICT DO NOTHING RETURNING content_id",[user.id,id]);
  if (!result.rowCount && !(await query("SELECT id FROM contents WHERE id=$1 AND status='PUBLISHED' AND NOT moderation_hold",[id])).rowCount) throw new HttpError(404,"Published content not found.");
  return {saved:true};
}
export async function listNotifications(user: CurrentUser, page = 1) {
  const result = await query('SELECT id,title,read_at AS "readAt",created_at AS "createdAt" FROM investor_notifications WHERE lower(audience_email)=$1 ORDER BY created_at DESC,id LIMIT 51 OFFSET $2',[user.email.toLowerCase(),(page-1)*50]);
  const count = await query("SELECT count(*)::int AS unread FROM investor_notifications WHERE lower(audience_email)=$1 AND read_at IS NULL",[user.email.toLowerCase()]);
  return {notifications:result.rows.slice(0,50),hasMore:result.rows.length>50,unread:count.rows[0].unread};
}
export async function readNotification(id: string, user: CurrentUser) {
  const result=await query("UPDATE investor_notifications SET read_at=COALESCE(read_at,now()) WHERE id=$1 AND lower(audience_email)=$2 RETURNING id",[id,user.email.toLowerCase()]);
  if (!result.rowCount) throw new HttpError(404,"Notification not found.");
  return {message:"Marked as read."};
}

function requireStaffRole(user: CurrentUser) { if (!isStaff(user)) throw new HttpError(403,"Consultant access is required."); }
export async function listSlots(user: CurrentUser, manage = false) {
  if (manage) requireStaffRole(user);
  const result = await query(`SELECT s.id,s.consultant_id AS "consultantId",s.starts_at AS "startsAt",s.ends_at AS "endsAt",s.closed,u.name AS consultant,
    EXISTS(SELECT 1 FROM consultations a WHERE a.slot_id=s.id AND a.status<>'CANCELLED') AS reserved
    FROM appointment_slots s JOIN users u ON u.id=s.consultant_id WHERE s.starts_at>now()
    ${manage ? "AND s.consultant_id=$1" : "AND NOT s.closed AND u.suspended_at IS NULL AND u.\"emailVerified\" IS NOT NULL AND (u.role IN ('CONSULTANT','ADMIN') OR lower(u.email)=ANY($1::text[])) AND NOT EXISTS(SELECT 1 FROM consultations a WHERE a.slot_id=s.id AND a.status<>'CANCELLED')"}
    ORDER BY s.starts_at LIMIT 200`,manage ? [user.id] : [configuredAdminEmails()]);
  return result.rows;
}
export async function createSlot(data:z.infer<typeof slotInput>,user:CurrentUser) {
  requireStaffRole(user);
  return transaction(async client => {
    const actor=(await client.query('SELECT email,role,suspended_at,"emailVerified" FROM users WHERE id=$1 FOR UPDATE',[user.id])).rows[0];
    if(!actor?.emailVerified || actor.suspended_at || (!configuredAdmin(actor.email) && !["CONSULTANT","ADMIN"].includes(actor.role))) throw new HttpError(403,"Consultant access is required.");
    const clash=await client.query("SELECT s.id FROM appointment_slots s WHERE consultant_id=$1 AND starts_at<$3 AND ends_at>$2 AND (NOT closed OR EXISTS(SELECT 1 FROM consultations a WHERE a.slot_id=s.id AND a.status<>'CANCELLED'))",[user.id,data.startsAt,data.endsAt]);
    if(clash.rowCount) throw new HttpError(409,"This time overlaps an existing open or reserved slot.");
    const result=await client.query("INSERT INTO appointment_slots(consultant_id,starts_at,ends_at) VALUES($1,$2,$3) RETURNING id",[user.id,data.startsAt,data.endsAt]);
    await recordAudit(client,user.id,"slot.created","slot",result.rows[0].id,{startsAt:data.startsAt,endsAt:data.endsAt});
    return {message:"Availability published."};
  });
}
export async function closeSlot(id:string,user:CurrentUser) {
  requireStaffRole(user);
  return transaction(async client=>{
    const slot=(await client.query("SELECT consultant_id FROM appointment_slots WHERE id=$1 FOR UPDATE",[id])).rows[0];
    if(!slot || (slot.consultant_id !== user.id && user.role !== "ADMIN")) throw new HttpError(404,"Slot not found.");
    if((await client.query("SELECT id FROM consultations WHERE slot_id=$1 AND status<>'CANCELLED'",[id])).rowCount) throw new HttpError(409,"Cancel the linked session before closing its slot.");
    await client.query("UPDATE appointment_slots SET closed=true WHERE id=$1",[id]);
    await recordAudit(client,user.id,"slot.closed","slot",id);
    return {message:"Availability closed."};
  });
}
export async function bookingLinks() {
  return (await query('SELECT p.user_id AS id,u.name,p.booking_url AS url FROM consultant_profiles p JOIN users u ON u.id=p.user_id WHERE p.booking_url<>\'\' AND u.suspended_at IS NULL AND u."emailVerified" IS NOT NULL AND (u.role IN (\'CONSULTANT\',\'ADMIN\') OR lower(u.email)=ANY($1::text[])) ORDER BY u.name',[configuredAdminEmails()])).rows;
}
export async function saveBookingLink(url:string,user:CurrentUser) {
  requireStaffRole(user);
  return transaction(async client=>{
    await client.query("INSERT INTO consultant_profiles(user_id,booking_url) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET booking_url=$2,updated_at=now()",[user.id,url]);
    await recordAudit(client,user.id,"booking_link.updated","user",user.id);
    return {message:"Booking link saved."};
  });
}
export async function bookSlot(data:z.infer<typeof slotBookingInput>,user:CurrentUser) {
  return transaction(async client=>{
    const slot=(await client.query('SELECT s.*,u.suspended_at,u.role,u.email,u."emailVerified" FROM appointment_slots s JOIN users u ON u.id=s.consultant_id WHERE s.id=$1 FOR UPDATE OF s',[data.slotId])).rows[0];
    if(!slot || slot.closed || slot.suspended_at || !slot.emailVerified || (!configuredAdmin(slot.email) && !["ADMIN","CONSULTANT"].includes(slot.role)) || new Date(slot.starts_at)<=new Date()) throw new HttpError(409,"This slot is no longer available. Choose another time.");
    if((await client.query("SELECT id FROM consultations WHERE slot_id=$1 AND status<>'CANCELLED'",[data.slotId])).rowCount) throw new HttpError(409,"This slot has just been reserved. Choose another time.");
    const contact=await client.query("INSERT INTO contacts(name,email,user_id,verified_at) VALUES($1,$2,$3,now()) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,user_id=$3,verified_at=now() RETURNING id",[data.name,user.email,user.id]);
    const seq=await client.query("SELECT nextval('consultation_reference_seq') AS number");
    const year=new Intl.DateTimeFormat("en",{year:"numeric",timeZone:"Asia/Karachi"}).format(new Date());
    const reference=`SESSION-${year}-${String(seq.rows[0].number).padStart(5,"0")}`;
    const result=await client.query("INSERT INTO consultations(reference,contact_id,topic,client_notes,preferred_at,slot_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",[reference,contact.rows[0].id,data.topic,data.notes,slot.starts_at,data.slotId]);
    await enqueueEmail(client,user.email,`${reference}: time reserved, awaiting confirmation`,`Your chosen time is reserved pending consultant confirmation. View your session: ${appLink('/my-questions')}`,`consultation-received:${result.rows[0].id}`);
    await recordAudit(client,user.id,"slot.reserved","consultation",result.rows[0].id,{slotId:data.slotId});
    return {reference,message:"Time reserved. Your consultant will confirm the session and meeting details."};
  });
}
function configuredAdminEmails() { return (process.env.ADMIN_EMAILS ?? "").split(",").map(email=>email.trim().toLowerCase()).filter(Boolean); }
