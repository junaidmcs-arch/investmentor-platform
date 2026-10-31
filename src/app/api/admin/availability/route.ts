import { api,jsonInput,requireUser } from "@/lib/server/http";
import { listSlots,createSlot,saveBookingLink } from "@/lib/server/ecosystem";
import { slotInput,bookingUrlInput } from "@/lib/server/validation";
import { query } from "@/lib/server/db";
export const GET=api(async()=>{const user=await requireUser(true);const profile=await query("SELECT booking_url FROM consultant_profiles WHERE user_id=$1",[user.id]);return {slots:await listSlots(user,true),bookingUrl:profile.rows[0]?.booking_url??""};});
export const POST=api(async request=>createSlot(slotInput.parse(await jsonInput(request)),await requireUser(true)));
export const PATCH=api(async request=>saveBookingLink(bookingUrlInput.parse(await jsonInput(request)).bookingUrl,await requireUser(true)));
