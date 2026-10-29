import type { PoolClient } from "pg";
import type { z } from "zod";
import { type CurrentUser, isStaff } from "./auth";
import { query, transaction } from "./db";
import { HttpError } from "./http";
import { appLink, enqueueEmail } from "./notifications";
import { contentColumns, mapContent } from "./content";
import { contentInput, consultationInput, consultationUpdateInput, questionInput, offlineQuestionInput, responseInput } from "./validation";

const questionColumns = `q.id,q.reference,q.category,q.subject,q.body,q.status,q.source,q.created_at AS "createdAt",q.updated_at AS "updatedAt",c.name,c.email,c.whatsapp,c.user_id AS "userId"`;
const consultationColumns = `a.id,a.reference,a.topic,a.client_notes AS "clientNotes",a.preferred_at AS "preferredAt",a.confirmed_at AS "confirmedAt",a.meeting_url AS "meetingUrl",a.status,a.created_at AS "createdAt",a.updated_at AS "updatedAt",c.name,c.email,c.whatsapp`;
type ContactData = { name: string; email?: string | null; whatsapp?: string };

export function canReadContact(user: CurrentUser, contact: { userId?: string | null; email?: string | null }) {
  return isStaff(user) || contact.userId === user.id || Boolean(contact.email && contact.email.toLowerCase() === user.email.toLowerCase());
}
export function responseVisible(user: CurrentUser, response: { publishedAt: unknown }) {
  return isStaff(user) || Boolean(response.publishedAt);
}
function requireStaff(user: CurrentUser) {
  if (!isStaff(user)) throw new HttpError(403, "Consultant access is required.");
}
async function upsertContact(client: PoolClient, data: ContactData, user: CurrentUser | null) {
  if (user && data.email && data.email.toLowerCase() !== user.email.toLowerCase()) throw new HttpError(400, "Use the email address belonging to your signed-in account.");
  if (!data.email) {
    const result = await client.query("INSERT INTO contacts(name,whatsapp) VALUES($1,$2) RETURNING id", [data.name,data.whatsapp || null]);
    return result.rows[0].id;
  }
  // Guests cannot overwrite an existing contact's details or attach it to an account.
  const result = await client.query(`INSERT INTO contacts(name,email,whatsapp,user_id,verified_at) VALUES($1,$2,$3,$4,CASE WHEN $4::uuid IS NOT NULL THEN now() END)
    ON CONFLICT(email) DO UPDATE SET user_id=CASE WHEN $4::uuid IS NOT NULL THEN $4::uuid ELSE contacts.user_id END,
    name=CASE WHEN $4::uuid IS NOT NULL THEN EXCLUDED.name ELSE contacts.name END,
    whatsapp=CASE WHEN $4::uuid IS NOT NULL THEN EXCLUDED.whatsapp ELSE contacts.whatsapp END,
    verified_at=CASE WHEN $4::uuid IS NOT NULL THEN now() ELSE contacts.verified_at END RETURNING id`, [data.name,data.email.toLowerCase(),data.whatsapp || null,user?.id ?? null]);
  return result.rows[0].id;
}
export async function createQuestion(data: z.infer<typeof questionInput> | z.infer<typeof offlineQuestionInput>, user: CurrentUser | null, offline = false) {
  if (offline && !isStaff(user)) throw new HttpError(403, "Consultant access is required.");
  return transaction(async client => {
    const contactId = await upsertContact(client,data,offline ? null : user);
    const sequence = await client.query("SELECT nextval('question_reference_seq') AS number");
    const year = new Intl.DateTimeFormat("en",{year:"numeric",timeZone:"Asia/Karachi"}).format(new Date());
    const reference = `PSX-${year}-${String(sequence.rows[0].number).padStart(5,"0")}`;
    const result = await client.query("INSERT INTO questions(reference,contact_id,category,subject,body,source) VALUES($1,$2,$3,$4,$5,$6) RETURNING id", [reference,contactId,data.category,data.subject,data.body,offline ? "WHATSAPP" : "WEBSITE"]);
    await client.query("INSERT INTO question_events(question_id,actor_id,to_status,note) VALUES($1,$2,'NEW','Question received')", [result.rows[0].id,user?.id ?? null]);
    await enqueueEmail(client,data.email || null,`${reference}: your question was received`, `We received your question. A consultant will review it.\n\nUse your verified email to access your private history:\n${appLink("/my-questions")}\n\nYour reference: ${reference}\nThis acknowledgement is not investment advice.`, `question-received:${result.rows[0].id}`);
    return { id: result.rows[0].id, reference, message: "Your question has been received. Sign in with your email to view its progress." };
  });
}
export async function listQuestions(user: CurrentUser, admin = false, status = "", search = "") {
  if (admin) requireStaff(user);
  const conditions: string[] = []; const values: unknown[] = [];
  if (!admin) { conditions.push("(c.user_id=$1 OR lower(c.email)=$2)"); values.push(user.id,user.email.toLowerCase()); }
  if (status) { values.push(status); conditions.push(`q.status=$${values.length}`); }
  if (search) { values.push(`%${search.replace(/[%_\\]/g,"\\$&")}%`); conditions.push(`(q.reference ILIKE $${values.length} OR q.subject ILIKE $${values.length} OR c.name ILIKE $${values.length})`); }
  const result = await query(`SELECT ${questionColumns} FROM questions q JOIN contacts c ON c.id=q.contact_id ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""} ORDER BY q.created_at DESC LIMIT 100`,values);
  return result.rows.map(({userId: _userId,...row}) => row);
}
export async function questionDetail(id: string, user: CurrentUser) {
  const values = isStaff(user) ? [id] : [id,user.id,user.email.toLowerCase()];
  const result = await query(`SELECT ${questionColumns} FROM questions q JOIN contacts c ON c.id=q.contact_id WHERE q.id=$1 ${isStaff(user) ? "" : "AND (c.user_id=$2 OR lower(c.email)=$3)"}`,values);
  const question = result.rows[0];
  if (!question || !canReadContact(user,question)) throw new HttpError(404,"Question not found.");
  const [responses,events] = await Promise.all([
    query(`SELECT id,body,sources,risks,assumptions,analysis_date::text AS "analysisDate",published_at AS "publishedAt",created_at AS "createdAt"${isStaff(user) ? ',consultant_id AS "consultantId"' : ""} FROM responses WHERE question_id=$1 ${isStaff(user) ? "" : "AND published_at IS NOT NULL"} ORDER BY created_at`,[id]),
    query('SELECT id,from_status AS "fromStatus",to_status AS "toStatus",note,created_at AS "createdAt" FROM question_events WHERE question_id=$1 ORDER BY created_at',[id]),
  ]);
  const {userId: _userId,...safeQuestion} = question;
  return {question:safeQuestion,responses:responses.rows.filter(row=>responseVisible(user,{publishedAt:row.publishedAt})),events:events.rows};
}
export async function updateQuestionStatus(id: string, status: string, user: CurrentUser) {
  requireStaff(user);
  return transaction(async client => {
    const result = await client.query("SELECT q.status,c.email,q.reference FROM questions q JOIN contacts c ON c.id=q.contact_id WHERE q.id=$1 FOR UPDATE OF q",[id]);
    const question = result.rows[0]; if (!question) throw new HttpError(404,"Question not found.");
    if (question.status === status) return {message:"Status unchanged."};
    if (status === "ANSWERED") {
      const response = await client.query("SELECT id FROM responses WHERE question_id=$1 AND published_at IS NOT NULL LIMIT 1",[id]);
      if (!response.rowCount) throw new HttpError(400,"Publish a response with risks and assumptions before marking the question answered.");
    }
    await client.query("UPDATE questions SET status=$2,updated_at=now() WHERE id=$1",[id,status]);
    const event = await client.query("INSERT INTO question_events(question_id,actor_id,from_status,to_status,note) VALUES($1,$2,$3,$4,'Status updated') RETURNING id",[id,user.id,question.status,status]);
    await enqueueEmail(client,question.email,`${question.reference}: status updated`,`Your question is now ${status.replaceAll("_"," ").toLowerCase()}.\n\nView your private history: ${appLink("/my-questions")}`,`question-status:${event.rows[0].id}`);
    return {message:"Question status updated."};
  });
}
export async function saveResponse(id: string, data: z.infer<typeof responseInput>, user: CurrentUser) {
  requireStaff(user);
  return transaction(async client => {
    const result = await client.query("SELECT q.status,q.reference,c.email FROM questions q JOIN contacts c ON c.id=q.contact_id WHERE q.id=$1 FOR UPDATE OF q",[id]);
    const question = result.rows[0]; if (!question) throw new HttpError(404,"Question not found.");
    const draft = await client.query("SELECT id FROM responses WHERE question_id=$1 AND consultant_id=$2 AND published_at IS NULL",[id,user.id]);
    let responseId: string;
    if (draft.rowCount) {
      responseId=draft.rows[0].id;
      await client.query("UPDATE responses SET body=$2,sources=$3,risks=$4,assumptions=$5,analysis_date=$6,published_at=CASE WHEN $7 THEN now() ELSE NULL END,updated_at=now() WHERE id=$1",[responseId,data.body,data.sources,data.risks,data.assumptions,data.analysisDate,data.publish]);
    } else {
      const response=await client.query("INSERT INTO responses(question_id,consultant_id,body,sources,risks,assumptions,analysis_date,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,CASE WHEN $8 THEN now() END) RETURNING id",[id,user.id,data.body,data.sources,data.risks,data.assumptions,data.analysisDate,data.publish]);
      responseId=response.rows[0].id;
    }
    if(data.publish) {
      await client.query("UPDATE questions SET status='ANSWERED',updated_at=now() WHERE id=$1",[id]);
      await client.query("INSERT INTO question_events(question_id,actor_id,from_status,to_status,note) VALUES($1,$2,$3,'ANSWERED','Consultant response published')",[id,user.id,question.status]);
      await enqueueEmail(client,question.email,`${question.reference}: your response is ready`,`A consultant has published a response to your question.\n\nRead it securely after signing in: ${appLink(`/my-questions/${id}`)}\n\nReference numbers do not provide access to private responses.`,`response-published:${responseId}`);
    }
    return {id:responseId,message:data.publish ? "Response published and notification queued." : "Draft saved privately."};
  });
}
export async function createConsultation(data: z.infer<typeof consultationInput>, user: CurrentUser | null) {
  return transaction(async client=>{
    const contactId=await upsertContact(client,data,user);
    const sequence=await client.query("SELECT nextval('consultation_reference_seq') AS number");
    const year=new Intl.DateTimeFormat("en",{year:"numeric",timeZone:"Asia/Karachi"}).format(new Date());
    const reference=`SESSION-${year}-${String(sequence.rows[0].number).padStart(5,"0")}`;
    const result=await client.query("INSERT INTO consultations(reference,contact_id,topic,client_notes,preferred_at) VALUES($1,$2,$3,$4,$5) RETURNING id",[reference,contactId,data.topic,data.notes,data.preferredAt]);
    await enqueueEmail(client,data.email,`${reference}: session request received`,`Your educational session request was received. Your preferred time is a request and is not yet confirmed. We will email you when it is confirmed or updated.\n\nPrivate history: ${appLink("/my-questions")}`,`consultation-received:${result.rows[0].id}`);
    return {reference,message:"Session requested. Your appointment is not confirmed until the consultant approves it."};
  });
}
export async function listConsultations(user: CurrentUser,admin=false) {
  if(admin) requireStaff(user);
  const result=await query(`SELECT ${consultationColumns}${admin ? ',a.staff_notes AS "notes"' : ""} FROM consultations a JOIN contacts c ON c.id=a.contact_id ${admin ? "" : "WHERE c.user_id=$1 OR lower(c.email)=$2"} ORDER BY a.created_at DESC LIMIT 100`,admin ? [] : [user.id,user.email.toLowerCase()]);
  return result.rows;
}
export async function updateConsultation(id:string,data:z.infer<typeof consultationUpdateInput>,user:CurrentUser) {
  requireStaff(user);
  return transaction(async client=>{
    const result=await client.query("UPDATE consultations SET status=$2,confirmed_at=$3,meeting_url=$4,staff_notes=$5,updated_at=now() WHERE id=$1 RETURNING reference,contact_id,updated_at",[id,data.status,data.confirmedAt ?? null,data.meetingUrl,data.notes]);
    if(!result.rowCount) throw new HttpError(404,"Session request not found.");
    const appointment=result.rows[0]; const contact=await client.query("SELECT email FROM contacts WHERE id=$1",[appointment.contact_id]);
    const confirmation=data.confirmedAt ? `\nTime: ${new Intl.DateTimeFormat("en-PK",{dateStyle:"full",timeStyle:"short",timeZone:"Asia/Karachi"}).format(new Date(data.confirmedAt))} (Pakistan time)` : "";
    await enqueueEmail(client,contact.rows[0].email,`${appointment.reference}: session updated`,`Your session status is ${data.status.toLowerCase()}.${confirmation}\n\nView details securely: ${appLink("/my-questions")}`,`consultation-updated:${id}:${appointment.updated_at.toISOString()}`);
    return {message:"Session updated and notification queued."};
  });
}
export async function adminOverview(user:CurrentUser) {
  requireStaff(user);
  const [q,c,content,n]=await Promise.all([
    query("SELECT count(*)::int AS total,count(*) FILTER(WHERE status='NEW')::int AS new,count(*) FILTER(WHERE status='IN_PROGRESS')::int AS \"inProgress\",count(*) FILTER(WHERE status='ANSWERED')::int AS answered,count(*) FILTER(WHERE status='DECLINED')::int AS declined FROM questions"),
    query("SELECT count(*)::int AS total,count(*) FILTER(WHERE status='REQUESTED')::int AS requested,count(*) FILTER(WHERE status='CONFIRMED')::int AS confirmed FROM consultations"),
    query("SELECT count(*) FILTER(WHERE status='PUBLISHED')::int AS published,count(*) FILTER(WHERE status='DRAFT')::int AS drafts FROM contents"),
    query("SELECT count(*) FILTER(WHERE sent_at IS NULL AND attempts<5)::int AS pending,count(*) FILTER(WHERE sent_at IS NULL AND attempts>=5)::int AS failed FROM notification_outbox"),
  ]);
  return {questions:q.rows[0],consultations:c.rows[0],content:content.rows[0],notifications:n.rows[0]};
}
export async function listAdminContent(user:CurrentUser) { requireStaff(user); return (await query(`SELECT ${contentColumns} FROM contents ORDER BY updated_at DESC LIMIT 200`)).rows.map(mapContent); }
export async function saveContent(data:z.infer<typeof contentInput>,user:CurrentUser,id?:string) {
  requireStaff(user);
  return transaction(async client=>{
    let contentId=id;
    if(id) {
      const before=await client.query("SELECT * FROM contents WHERE id=$1 FOR UPDATE",[id]);
      if(!before.rowCount) throw new HttpError(404,"Content not found.");
      await client.query("INSERT INTO content_revisions(content_id,actor_id,snapshot) VALUES($1,$2,$3)",[id,user.id,JSON.stringify(before.rows[0])]);
      await client.query(`UPDATE contents SET slug=$2,kind=$3,title=$4,excerpt=$5,body=$6,level=$7,category=$8,read_minutes=$9,author=$10,featured=$11,status=$12,
        published_at=CASE WHEN $12='PUBLISHED' THEN COALESCE(published_at,now()) ELSE NULL END,updated_at=now() WHERE id=$1`,
        [id,data.slug,data.kind,data.title,data.excerpt,data.body,data.level??null,data.category,data.readMinutes,data.author,data.featured,data.status]);
    } else {
      const result=await client.query(`INSERT INTO contents(slug,kind,title,excerpt,body,level,category,read_minutes,author,featured,status,author_id,published_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CASE WHEN $11='PUBLISHED' THEN now() END) RETURNING id`,
        [data.slug,data.kind,data.title,data.excerpt,data.body,data.level??null,data.category,data.readMinutes,data.author,data.featured,data.status,user.id]);
      contentId=result.rows[0].id;
    }
    return {id:contentId,message:data.status === "PUBLISHED" ? "Content published." : "Content draft saved."};
  });
}
