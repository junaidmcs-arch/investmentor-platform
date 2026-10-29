# MVP scope and product decisions

Brand: **InvestMentor by Validacore**, confirmed by the project owner. Audience: Pakistani investors, with a starting emphasis on beginners and early long-term investors. Purpose: investor education, fundamental-analysis literacy, valuation reasoning, risk awareness, and human question support.

## First release

The five learning levels share one content system: basics, company analysis, valuation, risk, and market behavior. Risk appears across the curriculum. Initial company examples are fictional and explicitly illustrative; market explainers describe conditional relationships rather than guaranteed sector outcomes.

Visitors can read public resources without an account. Website inquiry forms require name and email, with WhatsApp optional. Verified email access adds private history. WhatsApp-only inquiries can be logged by staff against a contact record without inventing an authenticated account.

Question states are New, In progress, Answered, and Declined. Response drafts remain staff-only. Publishing requires an answer, risks, assumptions, and an analysis date. Publication, status history, and queued notification are committed together. Human-readable reference numbers are support identifiers, never authentication secrets.

Sessions are requests for educational conversations. Preferred time is not a reserved slot. The consultant confirms manually and records one HTTPS meeting link. The MVP does not automatically create Calendar/Meet/Zoom events or manage availability conflicts.

The P/E lab takes hypothetical EPS, an assumed multiple, and a reference price. It shows an assumption-dependent estimate and sensitivity to changed inputs, not a recommended stock or expected return. DCF is taught in content; a full DCF engine is deferred.

## Technical decisions

- One Next.js application with TypeScript, PostgreSQL SQL migrations, PM2 and Nginx deployment templates.
- Auth.js email-link authentication replaces the original password-registration idea to reduce first-release account friction. Provider and adapter versions are pinned; the current Auth.js package is a beta release and should be upgraded only with authentication regression tests.
- Public seed content remains available for local previews. Real submissions are refused until the database, auth origin/secret, and SMTP settings exist.
- PostgreSQL is the source of truth for private records and edited CMS content. A contact is distinct from an authenticated user.
- Client authorization is checked at the server, including direct API access. Staff permissions come from trusted role data and the administrator email allowlist.
- Service email uses a database outbox. Auth sign-in email uses the configured SMTP transport directly.
- Pakistani mobile numbers normalize to +92. Appointments are stored as timestamps and displayed with Asia/Karachi.
- Fonts are bundled with the application; no Google Fonts runtime request is required.

## Deferred

Paid packages and subscriptions, payment gateways, live market data, real-time charts, trade execution, brokerage integrations, buy/sell signals, AI recommendations, portfolio tracking/optimization, automated stress testing, automated WhatsApp ingestion, full course delivery/certificates, and self-service scheduling are not part of this implementation.

Premium consultancy and security-specific research need separately defined service scope and applicable review before activation. Free pricing by itself is not treated as a regulatory exemption. Legal/policy text and initial educational content require operator review before public launch.

## Pilot

Pilot the complete read → ask → respond → return journey with a small invited group. Track actual inquiries, response times, repeated questions, attendance, and staff effort. WhatsApp clicks are not equivalent to completed conversations. The MVP stores operational records but does not add third-party analytics or a marketing tracking stack.
