import { z } from "zod";
import { emailInput } from "../email";

export { emailInput } from "../email";
const email = emailInput;
export function normalizePakistaniPhone(input: string) {
  const value = input.replace(/[\s()-]/g, "");
  if (!value) return "";
  if (/^03\d{9}$/.test(value)) return `+92${value.slice(1)}`;
  if (/^923\d{9}$/.test(value)) return `+${value}`;
  return value;
}
const phone = z.string().trim().max(30).optional().transform(value => normalizePakistaniPhone(value ?? ""))
  .refine(value => !value || /^\+923\d{9}$/.test(value), "Enter a Pakistani mobile number, for example 0300 1234567.");
const contact = { name: z.string().trim().min(2).max(100), email, whatsapp: phone };
const questionFields = z.object({ ...contact, email: z.union([email, z.literal("")]).optional(), category: z.string().trim().min(2).max(60), subject: z.string().trim().min(5).max(160), body: z.string().trim().min(20).max(6000) });
export const questionInput = questionFields.refine(value => Boolean(value.email || value.whatsapp), { message: "Provide an email address or Pakistani WhatsApp number.", path: ["email"] });
export const offlineQuestionInput = questionFields.refine(value => Boolean(value.whatsapp), { message: "A WhatsApp number is required for an offline inquiry.", path: ["whatsapp"] });
export const consultationInput = z.object({ ...contact, preferredAt: z.string().datetime({ offset: true }), topic: z.string().trim().min(5).max(160), notes: z.string().trim().max(3000).optional().default("") })
  .refine(value => { const date = Date.parse(value.preferredAt); return date > Date.now() && date < Date.now() + 180 * 86400000; }, { message: "Choose a preferred time within the next 180 days.", path: ["preferredAt"] });
export const questionStatusInput = z.object({ status: z.enum(["NEW", "IN_PROGRESS", "ANSWERED", "DECLINED"]) });
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD analysis date.").refine(value => !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, "Enter a valid analysis date.");
export const responseInput = z.object({ body: z.string().trim().max(20000), sources: z.string().trim().max(5000).optional().default(""), risks: z.string().trim().max(5000).optional().default(""), assumptions: z.string().trim().max(5000).optional().default(""), analysisDate: dateOnly, publish: z.boolean().default(false) })
  .superRefine((value, context) => { if (value.publish) for (const field of ["body", "risks", "assumptions"] as const) if (value[field].length < 10) context.addIssue({ code: "custom", message: `${field} must contain at least 10 characters before publishing.`, path: [field] }); });
export const consultationUpdateInput = z.object({ status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"]), confirmedAt: z.string().datetime({ offset: true }).optional().nullable(), meetingUrl: z.string().trim().max(1000).optional().default(""), notes: z.string().trim().max(5000).optional().default("") })
  .refine(value => !value.meetingUrl || (() => { try { const url=new URL(value.meetingUrl); return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; } })(), { message: "Meeting links must be valid HTTPS URLs without embedded credentials.", path: ["meetingUrl"] })
  .refine(value => value.status !== "REQUESTED" || !value.confirmedAt, { message: "A requested appointment cannot already have a confirmed time.", path: ["confirmedAt"] })
  .refine(value => !["CONFIRMED","COMPLETED"].includes(value.status) || Boolean(value.confirmedAt), { message: "A confirmed or completed appointment needs a date and time.", path: ["confirmedAt"] });
export const contentInput = z.object({ slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), kind: z.enum(["lesson", "study", "market", "faq"]), title: z.string().trim().min(5).max(180), excerpt: z.string().trim().min(15).max(500), body: z.string().trim().min(30).max(80000), level: z.number().int().min(1).max(5).optional().nullable(), category: z.string().trim().min(2).max(80), readMinutes: z.number().int().min(1).max(120).default(5), author: z.string().trim().min(2).max(100), featured: z.boolean().default(false), status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT") })
  .refine(value => value.kind !== "lesson" || Boolean(value.level), {message:"Choose a learning level for a lesson.",path:["level"]});
export const idInput = z.string().uuid();

export const userUpdateInput = z.object({ role: z.enum(["CLIENT", "CONSULTANT", "ADMIN"]), suspended: z.boolean() });
export const consultantCreateInput = z.object({ name: z.string().trim().min(2).max(100), email: emailInput });
export const moderationInput = z.object({ hold: z.boolean(), note: z.string().trim().min(5).max(1000) });
export const bookingUrlInput = z.object({ bookingUrl: z.string().trim().max(1000).refine(value => !value || (() => { try { const url = new URL(value); return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; } })(), "Enter an HTTPS booking link without embedded credentials.") });
export const slotInput = z.object({ startsAt: z.string().datetime({offset:true}), endsAt: z.string().datetime({offset:true}) }).refine(value => {
  const start = Date.parse(value.startsAt), end = Date.parse(value.endsAt);
  return start > Date.now() && start < Date.now() + 180 * 86400000 && end - start >= 15 * 60000 && end - start <= 180 * 60000;
}, "Choose a future slot within 180 days, lasting 15–180 minutes.");
export const slotBookingInput = z.object({ name: contact.name, slotId: idInput, topic: z.string().trim().min(5).max(160), notes: z.string().trim().max(3000).default("") });
