# EC2 / RDS deployment

This procedure targets an existing Linux EC2 instance and a dedicated PostgreSQL RDS database. It does not provision AWS infrastructure or modify an existing production database automatically.

## Configuration

- Use a supported Node.js version (22.14+, tested with 24) and pnpm 11.25.
- Install the checkout under an application-owned directory, such as `/srv/investmentor`.
- Configure `.env.local` on the server, readable only by the service account, or inject secrets through your established secret-management process. Match `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
- Set `DATABASE_URL` to a dedicated database and a least-privilege application role. Use a separate migration role if your environment requires it.
- For RDS, provide its current trusted CA certificate through `DATABASE_CA_CERT` (literal `\n` separators are accepted). Do not disable certificate verification. Avoid connection-string SSL parameters that can override the explicit certificate configuration.
- Allow RDS ingress from the EC2 security group only. Keep database credentials off the client and out of Git.
- Configure a verified email sender using SES SMTP or Resend SMTP and set `EMAIL_SERVER` and `EMAIL_FROM`. URL-encode special characters in SMTP credentials. Production SMTP requires TLS. SES accounts in the sandbox need the appropriate sender/recipient verification or production access.
- Add the initial operator's verified email to `ADMIN_EMAILS`. Staff roles can also be assigned in the database by an authorized administrator; there is no public role-assignment form.
- Configure the optional public WhatsApp number and contact email before building.

## First release

Take or verify an RDS backup before migrations on a database containing existing data. The initial migration creates tables and should be applied to a dedicated empty application database.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm db:migrate
pnpm db:seed
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
```

Set up PM2 startup through the host's existing service-management procedure. Both processes run as the application service account. The web process listens only on `127.0.0.1:3000`; the mail process loads the same server environment.

The included Nginx template belongs in Nginx's `http` configuration context. Replace its example host and certificate paths, obtain/install the certificate using the host's established Certbot process, validate with `nginx -t`, and reload Nginx. Open only the intended HTTPS/HTTP ingress; do not expose port 3000 directly.

Set `TRUST_PROXY=true` only when Nginx replaces `X-Forwarded-For` with the actual peer IP, as the template does. If a load balancer or CDN sits in front of Nginx, establish its trusted real-IP handling separately. Never accept client-supplied forwarding headers blindly. The auth location disables access logs to avoid recording magic-link token URLs and applies an additional rate limit.

## Release checks

1. `/api/health` reports connected/ready. This checks database reachability, not complete schema or SMTP readiness.
2. A real sign-in email reaches an authorized inbox and establishes a secure session. Expired links fail.
3. A guest educational question appears only to its verified email owner and authorized staff.
4. A consultant draft remains invisible to the client. Publishing includes risks, assumptions, and an analysis date, and queues an email.
5. The worker sends queued mail and records completion; repeated failures appear in the staff overview.
6. A session request stays requested until confirmation. Pakistan time and the HTTPS meeting link are correct.
7. Unpublished CMS content is absent from public pages and the sitemap.
8. Mobile navigation, source links, public contact links, and policy copy are reviewed.

Also verify RDS backup retention, restore access, certificate renewal, host patching, log access and retention, and mail-provider delivery events under your operational procedures. The repository does not configure those external resources.

## Updates and rollback

Build and test the intended revision before changing the running release. Review new migrations and take a backup as required. Run migrations once, then restart the web and mail processes with updated environment values. Preserve the prior application revision for rollback.

Reverting application code does not reverse a database migration. Assess schema compatibility before rolling back; use a tested database restore or a deliberate forward migration when required. Never automatically drop tables to recover a failed release.

## Email queue

The worker retries failed deliveries with increasing delay, up to five attempts. It claims jobs using database leases and uses a stable message ID. Delivery remains at least once; SMTP cannot guarantee exactly-once acceptance across process crashes.

Investigate failed jobs before resetting their attempts for a deliberate retry. The UI reports queue counts; it does not automatically resend exhausted jobs. Avoid copying email addresses, private message text, sign-in tokens, or SMTP credentials into public issue reports.

## Current external dependencies

Production SMTP delivery, RDS TLS/networking, DNS, Nginx/Certbot, PM2 boot persistence, and backup recovery require validation against the real environment. Local automated tests do not establish that these external services are configured correctly.
