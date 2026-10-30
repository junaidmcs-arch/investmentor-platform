# Local development with Docker Desktop

Docker Desktop with Linux containers is the only runtime prerequisite. Node, pnpm, PostgreSQL, and a test mailbox run inside containers. No Node.js installation on Windows is needed.

## Start

From the repository directory:

```powershell
docker compose up --build -d
docker compose ps
```

The first build downloads the official Node 24 image and installs the locked packages inside it. PostgreSQL 17.10 and Mailpit 1.31.6 images are reused if already present. Initialization applies migrations, seeds starter articles without overwriting existing content, and generates a random local authentication secret. The database and secret survive container recreation in dedicated Docker volumes.

- Website: http://localhost:3000
- Test inbox: http://localhost:8025
- Local staff account: `admin@investmentor.test`
- For a client account, use another test address such as `learner@investmentor.test`.

Sign in on the website, open the message in the test inbox, and follow its sign-in link. These are actual email-link accounts backed by local PostgreSQL; there is no bypass login. All outgoing messages are captured by Mailpit and are not delivered to real inboxes. No production SMTP credentials or real personal information are needed.

Use **localhost** consistently, including when opening the sign-in links. The Compose configuration deliberately supplies its own local environment and does not import `.env.local`. Public phone and email links remain empty until configured for a real deployment.

## Work on the application

```powershell
docker compose watch
```

Keep this command running while editing. Source changes sync into the Linux containers; package and Next.js configuration changes rebuild the relevant image. Windows `node_modules` and `.next` are excluded, so host and container binaries are never mixed. Press Ctrl+C to stop watching; detached containers keep running.

For changes to Dockerfiles, Compose, database migrations, or other files outside the watch rules, rerun `docker compose up --build -d`. Initialization is safe to rerun: migration records prevent reapplication and seeding preserves edited articles.

## Validate and inspect

```powershell
docker compose exec web pnpm typecheck
docker compose exec -e NODE_ENV=test web pnpm test
docker compose exec -e NODE_ENV=production web pnpm build
docker compose logs --tail 100 web worker initialize
```

The build checks production compilation; the local website continues to use the development server. Production email/TLS and AWS connectivity still need separate validation.

## Stop and restart

```powershell
docker compose stop
docker compose up -d
```

`docker compose down` removes this project's containers and network while retaining its data volumes. Do not add the `--volumes` option unless you intend to erase the local database and authentication secret. This stack uses its own project name and does not manage containers from other projects.

If port 3000 or 8025 is already used, select another local port before starting:

```powershell
$env:INVESTMENTOR_PORT = "3001"
$env:INVESTMENTOR_MAIL_PORT = "8026"
docker compose up --build -d
```

Use the matching website URL for that session. The configured sign-in origin follows `INVESTMENTOR_PORT`.

## Scope

This Compose file is for local development only. The database password and staff test address are intentionally local defaults. Only the web app and test inbox publish ports, both bound to `127.0.0.1`; PostgreSQL and SMTP are available only within the Docker network. Do not deploy this file to a public host. Follow [production deployment](deployment.md) for the separately configured EC2/RDS environment.
