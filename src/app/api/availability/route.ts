import { api,jsonInput,requireUser } from "@/lib/server/http";
import { listSlots,bookSlot,bookingLinks } from "@/lib/server/ecosystem";
import { slotBookingInput } from "@/lib/server/validation";
import { limitSubmission } from "@/lib/server/rate-limit";
export const GET=api(async()=>{const user=await requireUser();return {slots:await listSlots(user),links:await bookingLinks()};});
export const POST=api(async request=>{const user=await requireUser();const data=slotBookingInput.parse(await jsonInput(request));await limitSubmission(request,user.email,"slot-booking");return bookSlot(data,user);});
