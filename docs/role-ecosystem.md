# Business vision and role ecosystem

Stage 1 implementation, 31 October 2026. Audience: Pakistani investors. Payments, pricing configuration, subscriptions, paid reports, and training cohorts remain Stage 2.

Guest is an unauthenticated state. Investor uses the existing database role `CLIENT`; Consultant uses `CONSULTANT`; Administrator uses `ADMIN`. A paid plan must eventually be represented as an entitlement, never as a privileged staff role.

## Roles and journeys

| Role | Stage 1 experience | Access boundary |
| --- | --- | --- |
| Guest | Public lessons, studies, notes, FAQs; submit an educational question with email or a Pakistani WhatsApp number; request a preferred session time | No private history, bookmarks, notifications, or slot reservations until email verification |
| Investor | Free learning and research, own question history and published responses, email and in-app updates, saved research, and reservation of published availability | Can read and update only their own records; cannot view staff drafts, notes, or administration |
| Consultant | Shared inquiry triage, structured response drafts/publication, CMS, appointment management, own availability and optional external booking link | Cannot invite staff, change roles, suspend accounts, release moderation holds, or access administrator analytics/audit history |
| Administrator | Consultant capabilities plus user access management, consultant invitations, moderation holds, operational analytics, and audit history | Sensitive mutations recheck the actor's live administrator status; own and configured bootstrap administrator accounts are protected |

The public learning library stays freely readable in Stage 1. Registered users gain continuity and personal tools, not a paid content gate. Deeper or premium archives can use content entitlements in Stage 2 when that inventory exists.

## Administration

Open `/dashboard/users` as an administrator. Add a consultant by name and email; the account is created unverified and receives sign-in instructions. Normal email verification is required before access. Existing users can be promoted through Manage access. There is no public consultant self-promotion.

Role and suspension changes revoke all existing sessions. Suspended accounts cannot sign in or resolve a current session. Future availability closes when staff access is removed; outstanding appointments remain visible for the team to review. An administrator cannot change their own access or an account named in `ADMIN_EMAILS`. Bootstrap administrator changes remain an operator configuration task.

Open `/dashboard/governance` for operational counts, average time to first published response, moderation, and audit history. These are actual database measures, not visitor analytics or investment-performance claims. Counts do not include fabricated traffic or conversion figures.

Consultants may publish directly in this MVP. An administrator can place content on hold, immediately removing it from public pages and saved-research lists. Neither role can edit or republish held content until an administrator releases the hold. Release leaves a private draft; publication is a separate action. Previous content versions are retained in the database; a revision-restore interface is not included.

Audit records cover invitations, access changes, content moderation/publication, response drafts/publication, question status updates, booking-link changes, slot changes, reservations, and session updates. They record actor, time, target, and limited action details; passwords, authentication tokens, private answer bodies, and email bodies are excluded. The UI provides no audit-edit/delete action. Database operators still control database access and retention; this is not a tamper-proof external audit service.

## Investor continuity

- `/my-questions`: own questions and sessions, including guest questions matched to the verified email.
- `/my-questions/bookmarks`: saved published articles. Unpublished/held content is hidden even if previously saved.
- `/my-questions/notifications`: private event titles and read/unread state, separate from email delivery. Notification creation participates in the same transaction as the underlying update. Migration imports existing service-email titles into the feed.
- `/sessions/book`: reserved availability and configured external scheduling links. No payment is requested.

A WhatsApp-only guest inquiry remains a contact record, not an authenticated account. Staff follow up manually. A number or question reference alone never grants online history access; phone ownership verification and WhatsApp automation are not implemented.

## Scheduling

Consultants publish their own 15–180 minute future slots, within 180 days, under Sessions. Times are stored with timezone and rendered as Asia/Karachi. Overlapping open/reserved slots for a consultant are rejected.

Verified investors have the ability to reserve available slots; guests can still request a preferred time. This is the Stage 1 meaning of priority booking, not a guaranteed response-time SLA. A reservation remains Requested until staff confirmation. A row lock and unique database index prevent two active reservations of the same slot. The confirmed time must match the reserved slot. Cancelled reservations release the slot and cannot be reopened; a new reservation is required. A reserved slot cannot simply be closed without first cancelling its linked appointment.

The existing manual preferred-time workflow remains available. Legacy/manual requests without a slot do not get automatic consultant conflict checking. Use published slots for guaranteed local reservation exclusion.

External HTTPS scheduling links are optional and explicitly labelled as external. They do not create or update local appointments, and local slots do not block external provider calendars. Use separate availability or reconcile it manually. Provider webhooks/calendar synchronization require a selected provider and are not represented as completed integrations.

## Stage 2

Separate pricing/products, entitlements, payments, refunds, and subscription lifecycle from identity and staff permissions. Define service scope, operational review, and applicable requirements before enabling paid consultation or premium research. Booking-provider synchronization, full training delivery, and premium archives are later extensions; the Stage 1 interface does not advertise unavailable paid features.
