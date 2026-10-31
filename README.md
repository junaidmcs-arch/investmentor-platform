# InvestMentor by Validacore

A Pakistan-focused PSX education and inquiry portal. The MVP combines a five-level learning library, illustrative company studies, market explainers, a transparent P/E valuation exercise, and a human-operated question and consultation workspace.

## Run with Docker Desktop (recommended)

Start Docker Desktop in Linux-container mode, then run from this directory:

```sh
docker compose up --build -d
```

Open `http://localhost:3000`. The stack includes Node, PostgreSQL, and a local test inbox at `http://localhost:8025`; no Node installation on your computer is required. Sign in as `admin@investmentor.test` and open the sign-in email in that inbox to use the consultant workspace. All mail remains local. Use another `.test` address to try the client experience.

See [Docker development](docs/docker-development.md) for live editing, tests, ports, and stopping/restarting safely. This configuration is for local development; production deployment remains separate.

## Run directly with Node (optional)

Requirements: Node.js 22.14 or newer (validated on Node 24), pnpm 11.25, and PostgreSQL 15+ when enabling accounts and submissions.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000`. Without service configuration, public educational content and the valuation lab work from the bundled content library. Account access, inquiry submission, and staff operations clearly report that online services are unavailable. There is no mock login or pretend successful submission.

For connected operation:

1. Copy `.env.example` to `.env.local` and set the PostgreSQL, auth, and SMTP values. Set `AUTH_URL` to the exact origin you open (including `localhost` versus `127.0.0.1`).
2. Set `ADMIN_EMAILS` to the email addresses authorized to administer the platform. Ownership of those inboxes must be verified through the sign-in flow.
3. Run `pnpm db:migrate`, then `pnpm db:seed`. Seed preserves existing content by slug.
4. Restart the app and run `pnpm email:worker` in another terminal.
5. Sign in through `/sign-in`. Clients use `/my-questions`; authorized staff use `/dashboard`.

Never paste credentials into source files or commit `.env.local`. Public contact email and WhatsApp number are optional; the site does not invent a contact destination when they are absent. Restart/rebuild after changing public configuration.

## What is implemented

- Responsive public website, local fonts, brand and navigation, policy pages, metadata and sitemap.
- Learning library with five levels, search, FAQs, company case studies, and market notes.
- P/E scenario calculator with editable inputs, validation, and a sensitivity table. All numbers are hypothetical, not live market data.
- Guest inquiries, readable references, verified-email private history, and status events.
- Auth.js email-link sign-in, database sessions, and server-side client/staff authorization.
- Consultant question triage, manual WhatsApp inquiry logging, response drafts, and publication with mandatory risk and assumption fields.
- Learning-session requests and manual confirmation, meeting links, completion, and cancellation. Preferred times are not automatic bookings; times display in Pakistan time.
- Staff content editing, publication, and stored revision snapshots.
- PostgreSQL email outbox, bounded retry, delivery leases, and queue status counts.
- Input validation, origin checks, submission rate limits, and private-response isolation.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local development on port 3000 |
| `pnpm typecheck` | TypeScript checks |
| `pnpm test` | Valuation/content and backend tests |
| `pnpm build` | Optimized production build |
| `pnpm start` | Production server on loopback port 3000 |
| `pnpm db:migrate` | Apply versioned migrations transactionally |
| `pnpm db:seed` | Insert starter public content, preserving existing slugs |
| `pnpm email:worker` | Deliver queued service notifications |
| `pnpm email:worker --once` | Process one bounded batch and exit |

Authentication emails are sent directly by Auth.js. Other service emails are queued transactionally. SMTP delivery is at least once: a crash after a provider accepts mail can cause a repeated delivery, even with stable message IDs. Failed jobs are retained for investigation after the retry limit.

## Architecture

See [the four-role ecosystem and operating guide](docs/role-ecosystem.md) for Guest, Investor, Consultant, and Administrator workflows, including staff onboarding, content moderation, saved research, notifications, and scheduling.

One Next.js App Router/TypeScript application on EC2, behind Nginx, backed by PostgreSQL RDS. PM2 supervises the web process and a separate lightweight mail worker. No microservices, trading engine, live price feeds, payment gateway, AI investment recommendations, or WhatsApp Business API are included.

```text
Browser → Nginx HTTPS → Next.js application → PostgreSQL RDS
                              │                    │
                              └─ sign-in mail      └─ notification outbox
                                     ↓                      ↓
                                 SMTP provider ← mail worker

WhatsApp click-to-chat → consultant → manual inquiry record
```

Code lives in `src/app` (pages and API routes), `src/lib/server` (authorization, validation, SQL workflows, delivery), and `src/lib/content.ts` (starter educational content). SQL migrations live in `db/migrations`. Database-backed content replaces fallback content once a database is configured; an unavailable configured database is reported rather than silently replaced with seed data.

## Deployment and launch status

See [EC2 deployment](docs/deployment.md) and [MVP scope](docs/mvp-scope.md). This repository provides application code and deployment templates. A production RDS instance, SMTP sender, domain, admin email allowlist, and public contact details must be configured separately. No AWS production environment is changed by installing or building the project.

Content is initial editorial material and should be reviewed before public launch. Company case studies are illustrative. The policy pages are drafts for the operator to review against the actual service and retention practices. The product makes no blanket claim that free research or advice is exempt from applicable requirements.
