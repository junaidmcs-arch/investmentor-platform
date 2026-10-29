import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite, type PGliteInterface } from "@electric-sql/pglite";
import type { Pool, PoolClient } from "pg";
import PostgresAdapter from "@auth/pg-adapter";
import { NextRequest } from "next/server";
import type { CurrentUser } from "@/lib/server/auth";

// Keep the real PostgreSQL schema and service queries. Only replace the network
// connection and the already-verified session boundary, never ownership policies.
const state = vi.hoisted(() => ({
  db: undefined as PGlite | undefined,
  user: null as CurrentUser | null,
  configured: true,
  rejectOutbox: false,
}));

async function pgQuery(connection: Pick<PGliteInterface, "query">, sql: string, values: unknown[] = []) {
  if (state.rejectOutbox && /INSERT INTO notification_outbox/i.test(sql)) {
    throw new Error("Injected delivery-queue failure");
  }
  const result = await connection.query(sql, values.map(value => value === undefined ? null : value));
  return { ...result, rowCount: result.rows.length || result.affectedRows || 0 };
}

vi.mock("@/lib/server/db", () => ({
  isDatabaseConfigured: () => state.configured,
  query: (sql: string, values?: unknown[]) => pgQuery(state.db!, sql, values),
  transaction: <T,>(work: (client: PoolClient) => Promise<T>) => state.db!.transaction(tx =>
    work({ query: (sql: string, values?: unknown[]) => pgQuery(tx, sql, values) } as PoolClient)),
}));
vi.mock("@/lib/server/auth", () => ({
  getCurrentUser: async () => state.user,
  isAuthConfigured: () => state.configured,
  isStaff: (user: CurrentUser | null) => Boolean(user && ["CONSULTANT", "ADMIN"].includes(user.role)),
  handlers: {
    GET: async () => Response.json({ url: "http://localhost:3000/sign-in?sent=1" }),
    POST: async () => Response.json({ url: "http://localhost:3000/sign-in?sent=1" }),
  },
}));

import {
  createQuestion, listQuestions, questionDetail, saveResponse, updateQuestionStatus,
  createConsultation, listConsultations, updateConsultation, saveContent, adminOverview,
} from "@/lib/server/services";
import { getPublishedContent, getPublishedContents } from "@/lib/server/content";
import { claimEmailJob, markEmailDelivered, retryEmail } from "@/lib/server/delivery";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { enqueueEmail } from "@/lib/server/notifications";
import { contentInput, consultationInput, consultationUpdateInput, questionInput, responseInput } from "@/lib/server/validation";
import { GET as getQuestions, POST as postQuestion } from "@/app/api/questions/route";
import { GET as getQuestion } from "@/app/api/questions/[id]/route";
import { POST as postContent } from "@/app/api/admin/content/route";
import { POST as postSignIn } from "@/app/api/auth/[...nextauth]/route";

const alice: CurrentUser = { id: "11111111-1111-4111-8111-111111111111", name: "Test Alice", email: "alice@example.test", role: "CLIENT" };
const bob: CurrentUser = { id: "22222222-2222-4222-8222-222222222222", name: "Test Bob", email: "bob@example.test", role: "CLIENT" };
const consultant: CurrentUser = { id: "33333333-3333-4333-8333-333333333333", name: "Test Consultant", email: "consultant@example.test", role: "CONSULTANT" };
const question = () => questionInput.parse({ name: "Test Alice", email: alice.email, whatsapp: "0300 1234567", category: "Valuation", subject: "Understanding valuation assumptions", body: "Please explain how an assumed P/E affects a hypothetical valuation." });
const draft = () => responseInput.parse({ body: "Draft explanation awaiting review.", analysisDate: "2026-10-29", publish: false });
const published = () => responseInput.parse({ ...draft(), body: "The estimate changes when the chosen multiple changes.", risks: "Future earnings may differ from the illustrative assumptions.", assumptions: "The example assumes constant hypothetical earnings per share.", sources: "https://www.psx.com.pk/", publish: true });
const article = () => contentInput.parse({ slug: "test-risk-lesson", kind: "lesson", title: "Understanding the risk assumptions", excerpt: "An educational example explaining the assumptions in a valuation.", body: "## A hypothetical example\n\nReview the sources and risk assumptions before interpreting this example.", level: 4, category: "Risk", readMinutes: 5, author: "Test author", status: "DRAFT" });
const request = (pathname: string, body?: unknown, origin = "http://localhost:3000") => new Request(`http://localhost:3000${pathname}`, body === undefined ? {} : { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });

beforeAll(async () => {
  state.db = new PGlite();
  await state.db.waitReady;
  await state.db.exec(await readFile(path.join(process.cwd(), "db/migrations/001_initial.sql"), "utf8"));
  vi.stubEnv("AUTH_URL", "http://localhost:3000");
  vi.stubEnv("AUTH_SECRET", "test-only-secret-never-used-in-production");
}, 30000);

beforeEach(async () => {
  state.configured = true;
  state.user = null;
  state.rejectOutbox = false;
  await state.db!.exec("TRUNCATE notification_outbox, question_events, responses, questions, consultations, content_revisions, contents, contacts, sessions, accounts, verification_token, users, rate_limits RESTART IDENTITY CASCADE");
  for (const user of [alice, bob, consultant]) {
    await state.db!.query('INSERT INTO users(id,name,email,role,"emailVerified") VALUES($1,$2,$3,$4,now())', [user.id,user.name,user.email,user.role]);
  }
});

afterAll(async () => { await state.db?.close(); vi.unstubAllEnvs(); });

describe("PostgreSQL-backed inquiry and publication workflow", () => {
  it("runs the installed Auth.js adapter against the real schema with single-use verification tokens and revocable sessions", async () => {
    const adapter = PostgresAdapter({ query: (sql: string, values?: unknown[]) => pgQuery(state.db!,sql,values) } as Pool);
    const expires = new Date(Date.now() + 900000);
    const user = await adapter.createUser!({ id: "44444444-4444-4444-8444-444444444444", name: "Email user", email: "email-user@example.test", emailVerified: expires, image: null });
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    await adapter.createVerificationToken!({ identifier: user.email, expires, token: "hashed-test-token" });
    expect(await adapter.useVerificationToken!({ identifier: user.email, token: "hashed-test-token" })).toMatchObject({ identifier: user.email });
    expect(await adapter.useVerificationToken!({ identifier: user.email, token: "hashed-test-token" })).toBeNull();
    await adapter.createSession!({ userId: user.id, sessionToken: "test-session-token", expires });
    expect(await adapter.getSessionAndUser!("test-session-token")).toMatchObject({ user: { id: user.id, email: user.email } });
    await adapter.deleteSession!("test-session-token");
    expect(await adapter.getSessionAndUser!("test-session-token")).toBeNull();
  });

  it("allows the verified email owner to retrieve a guest inquiry while denying another user and keeping references informational", async () => {
    const created = await createQuestion(question(), null);
    expect(created.reference).toMatch(/^PSX-\d{4}-\d{5,}$/);
    expect(await listQuestions(alice)).toHaveLength(1);
    expect(await listQuestions(bob)).toEqual([]);
    expect((await questionDetail(created.id,alice)).question.reference).toBe(created.reference);
    await expect(questionDetail(created.id,bob)).rejects.toMatchObject({ status: 404 });
    const contact = (await state.db!.query("SELECT user_id,whatsapp FROM contacts")).rows[0];
    expect(contact).toMatchObject({ user_id: null, whatsapp: "+923001234567" });
  });

  it("does not let a guest overwrite an established contact or a signed-in user submit as someone else", async () => {
    await createQuestion(question(),alice);
    await createQuestion({ ...question(), name: "Impersonator", whatsapp: "+923009999999" },null);
    expect((await state.db!.query("SELECT name,user_id,whatsapp FROM contacts")).rows[0]).toMatchObject({ name: alice.name, user_id: alice.id, whatsapp: "+923001234567" });
    await expect(createQuestion(question(),bob)).rejects.toMatchObject({ status: 400 });
    expect((await state.db!.query("SELECT count(*)::int AS count FROM questions")).rows[0]).toMatchObject({ count: 2 });
  });

  it("lets the verified owner replace contact details previously supplied by an unverified guest", async () => {
    await createQuestion({ ...question(),name:"Unverified name",whatsapp:"+923009999999" },null);
    await createQuestion(question(),alice);
    expect((await state.db!.query("SELECT name,user_id,whatsapp FROM contacts")).rows[0]).toMatchObject({name:alice.name,user_id:alice.id,whatsapp:"+923001234567"});
  });

  it("keeps draft responses staff-only and publishes the response, status, event, and email atomically", async () => {
    const created = await createQuestion(question(),null);
    const saved = await saveResponse(created.id,draft(),consultant);
    expect((await questionDetail(created.id,alice)).responses).toEqual([]);
    expect((await questionDetail(created.id,consultant)).responses).toHaveLength(1);
    expect((await questionDetail(created.id,alice)).question.status).toBe("NEW");
    const result = await saveResponse(created.id,published(),consultant);
    expect(result.id).toBe(saved.id);
    const detail = await questionDetail(created.id,alice);
    expect(detail.question.status).toBe("ANSWERED");
    expect(detail.responses).toHaveLength(1);
    expect(detail.responses[0].consultantId).toBeUndefined();
    expect(detail.events).toHaveLength(2);
    const emails = (await state.db!.query("SELECT body,dedupe_key FROM notification_outbox ORDER BY created_at")).rows as Array<{body:string;dedupe_key:string}>;
    expect(emails).toHaveLength(2);
    expect(emails[1].dedupe_key).toBe(`response-published:${saved.id}`);
    expect(emails[1].body).not.toContain(published().body);
  });

  it("rolls publication back if notification persistence fails", async () => {
    const created = await createQuestion(question(),null);
    await saveResponse(created.id,draft(),consultant);
    state.rejectOutbox = true;
    await expect(saveResponse(created.id,published(),consultant)).rejects.toThrow("Injected delivery-queue failure");
    state.rejectOutbox = false;
    const detail = await questionDetail(created.id,consultant);
    expect(detail.question.status).toBe("NEW");
    expect(detail.responses[0].publishedAt).toBeNull();
    expect(detail.responses[0].body).toBe(draft().body);
    expect(detail.events).toHaveLength(1);
  });

  it("requires staff authority at the service boundary and rejects an answered status without a published response", async () => {
    const created = await createQuestion(question(),null);
    await expect(listQuestions(alice,true)).rejects.toMatchObject({ status: 403 });
    await expect(saveResponse(created.id,published(),alice)).rejects.toMatchObject({ status: 403 });
    await expect(updateQuestionStatus(created.id,"IN_PROGRESS",alice)).rejects.toMatchObject({ status: 403 });
    await expect(adminOverview(alice)).rejects.toMatchObject({ status: 403 });
    await expect(createQuestion({ ...question(), email: "" },alice,true)).rejects.toMatchObject({ status: 403 });
    await expect(updateQuestionStatus(created.id,"ANSWERED",consultant)).rejects.toMatchObject({ status: 400 });
    await expect(saveResponse(created.id,{ ...draft(),publish:true },consultant)).rejects.toMatchObject({ code: "23514" });
    expect((await questionDetail(created.id,alice)).question.status).toBe("NEW");
  });

  it("keeps phone-only WhatsApp inquiries separate and private", async () => {
    const created = await createQuestion({ ...question(), email: "", whatsapp: "+923001234567" },consultant,true);
    expect((await questionDetail(created.id,consultant)).question.source).toBe("WHATSAPP");
    expect(await listQuestions(alice)).toEqual([]);
    expect((await state.db!.query("SELECT count(*)::int AS count FROM notification_outbox")).rows[0]).toMatchObject({ count: 0 });
  });

  it("publishes CMS entries only after approval and keeps a snapshot when edited", async () => {
    const created = await saveContent(article(),consultant);
    expect(await getPublishedContent(article().slug)).toBeNull();
    await saveContent({ ...article(), status: "PUBLISHED" },consultant,created.id);
    expect(await getPublishedContent(article().slug)).toMatchObject({ title: article().title, status: "PUBLISHED" });
    expect(await getPublishedContents("lesson")).toHaveLength(1);
    await saveContent({ ...article(), title: "An updated private draft" },consultant,created.id);
    expect(await getPublishedContents("lesson")).toEqual([]);
    const revisions = (await state.db!.query("SELECT snapshot FROM content_revisions ORDER BY created_at")).rows as Array<{snapshot:{status:string}}>;
    expect(revisions.map(row => row.snapshot.status)).toEqual(["DRAFT","PUBLISHED"]);
    await expect(saveContent(article(),alice)).rejects.toMatchObject({ status: 403 });
  });

  it("keeps consultation requests unconfirmed, isolates their owners, and hides staff notes", async () => {
    const preferredAt = new Date(Date.now()+86400000).toISOString();
    await createConsultation(consultationInput.parse({ ...question(),topic:"Reading financial statements",preferredAt,notes:"A hypothetical example please." }),null);
    const own = await listConsultations(alice);
    expect(own[0].status).toBe("REQUESTED");
    expect(await listConsultations(bob)).toEqual([]);
    await expect(listConsultations(alice,true)).rejects.toMatchObject({status:403});
    const update = consultationUpdateInput.parse({status:"CONFIRMED",confirmedAt:preferredAt,meetingUrl:"https://meet.google.com/test-room",notes:"Private staff scheduling context"});
    await updateConsultation(own[0].id,update,consultant);
    expect((await listConsultations(alice))[0]).toMatchObject({status:"CONFIRMED",meetingUrl:update.meetingUrl});
    expect((await listConsultations(alice))[0].notes).toBeUndefined();
    expect((await listConsultations(consultant,true))[0].notes).toBe(update.notes);
    await expect(updateConsultation(own[0].id,update,bob)).rejects.toMatchObject({status:403});
    await expect(state.db!.query("UPDATE consultations SET status='COMPLETED',confirmed_at=NULL WHERE id=$1",[own[0].id])).rejects.toMatchObject({code:"23514"});
  });
});

describe("Delivery, abuse prevention, and HTTP boundaries", () => {
  it("deduplicates notifications, leases one job at a time, retries, and prevents stale leases marking newer work delivered", async () => {
    const client = {query:(sql:string,values?:unknown[])=>pgQuery(state.db!,sql,values)} as PoolClient;
    await enqueueEmail(client,alice.email,"Test subject","Test body","unique-test-event");
    await enqueueEmail(client,alice.email,"Test subject","Test body","unique-test-event");
    const first = await claimEmailJob();
    expect(first?.attempts).toBe(1);
    expect(await claimEmailJob()).toBeNull();
    await state.db!.query("UPDATE notification_outbox SET locked_until=now()-interval '1 minute'");
    const second = await claimEmailJob();
    expect(second?.lock_token).not.toBe(first?.lock_token);
    await markEmailDelivered(first!);
    expect((await state.db!.query("SELECT sent_at FROM notification_outbox")).rows[0]).toMatchObject({sent_at:null});
    await retryEmail(second!);
    expect(await claimEmailJob()).toBeNull();
    await state.db!.query("UPDATE notification_outbox SET available_at=now()-interval '1 minute'");
    const third = await claimEmailJob();
    await markEmailDelivered(third!);
    expect(await claimEmailJob()).toBeNull();
    expect((await state.db!.query("SELECT attempts,sent_at,last_error FROM notification_outbox")).rows[0]).toMatchObject({attempts:3,last_error:null});
  });

  it("enforces database-backed rate limits without retaining plaintext contact data and resets expired windows", async () => {
    await consumeRateLimit(`test:${alice.email}`,2,60);
    await consumeRateLimit(`test:${alice.email}`,2,60);
    await expect(consumeRateLimit(`test:${alice.email}`,2,60)).rejects.toMatchObject({status:429});
    const stored = (await state.db!.query("SELECT key_hash FROM rate_limits")).rows[0] as {key_hash:string};
    expect(stored.key_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.key_hash).not.toContain(alice.email);
    await state.db!.query("UPDATE rate_limits SET expires_at=now()-interval '1 minute'");
    await expect(consumeRateLimit(`test:${alice.email}`,2,60)).resolves.toBeUndefined();
  });

  it("rejects anonymous and cross-user reads, while accepting a validated guest submission from the same origin", async () => {
    expect((await getQuestions(request("/api/questions"))).status).toBe(401);
    expect((await postQuestion(request("/api/questions",question(),"https://unrelated.example"))).status).toBe(403);
    const submitted = await postQuestion(request("/api/questions",question()));
    expect(submitted.status).toBe(200);
    const created = await submitted.json();
    state.user = bob;
    expect((await getQuestion(request(`/api/questions/${created.id}`),{params:Promise.resolve({id:created.id})})).status).toBe(404);
    state.user = alice;
    const response = await getQuestion(request(`/api/questions/${created.id}`),{params:Promise.resolve({id:created.id})});
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect((await response.json()).question.reference).toBe(created.reference);
    expect((await postContent(request("/api/admin/content",article()))).status).toBe(403);
  });

  it("returns honest unavailable responses instead of accepting data when required services are unconfigured", async () => {
    state.configured = false;
    const response = await postQuestion(request("/api/questions",question()));
    expect(response.status).toBe(503);
    expect((await state.db!.query("SELECT count(*)::int AS count FROM questions")).rows[0]).toMatchObject({count:0});
  });

  it("bounds chunked JSON by bytes and returns Auth.js-compatible validation and throttle error URLs", async () => {
    const oversized = await postQuestion(new Request("http://localhost:3000/api/questions",{method:"POST",headers:{origin:"http://localhost:3000","content-type":"application/json"},body:JSON.stringify({body:"ا".repeat(60000)})}));
    expect(oversized.status).toBe(413);
    const signInRequest = (email:string) => new NextRequest("http://localhost:3000/api/auth/signin/nodemailer",{method:"POST",headers:{origin:"http://localhost:3000","content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({email})});
    const invalid = await postSignIn(signInRequest("invalid-email"));
    expect(invalid.status).toBe(400);
    expect(new URL((await invalid.json()).url).searchParams.get("error")).toBe("InvalidEmail");
    for(let attempt=0;attempt<5;attempt++) expect((await postSignIn(signInRequest(alice.email))).status).toBe(200);
    const throttled = await postSignIn(signInRequest(alice.email));
    expect(throttled.status).toBe(429);
    const errorUrl=new URL((await throttled.json()).url);
    expect(errorUrl.origin).toBe("http://localhost:3000");
    expect(errorUrl.searchParams.get("error")).toBe("RateLimit");
  });

  it("rejects unsafe meeting links, contradictory appointment states, and incomplete published responses", () => {
    expect(consultationUpdateInput.safeParse({status:"REQUESTED",confirmedAt:new Date().toISOString()}).success).toBe(false);
    expect(consultationUpdateInput.safeParse({status:"CONFIRMED"}).success).toBe(false);
    expect(consultationUpdateInput.safeParse({status:"REQUESTED",meetingUrl:"https://user:password@meet.example.test/room"}).success).toBe(false);
    expect(consultationUpdateInput.safeParse({status:"REQUESTED",meetingUrl:"javascript:alert(1)"}).success).toBe(false);
    expect(responseInput.safeParse({...draft(),publish:true}).success).toBe(false);
    expect(responseInput.safeParse({...draft(),analysisDate:"2026-02-30"}).success).toBe(false);
  });

  it("rejects duplicate sign-in recipients before Auth.js can parse a different address", async () => {
    const response = await postSignIn(new NextRequest("http://localhost:3000/api/auth/signin/nodemailer", {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "application/x-www-form-urlencoded" },
      body: "email=rotating%40example.test&email=alice%40example.test"
    }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Provide exactly one email address.");
    expect((await state.db!.query("SELECT count(*)::int AS count FROM rate_limits")).rows[0]).toMatchObject({ count: 0 });
  });
});
