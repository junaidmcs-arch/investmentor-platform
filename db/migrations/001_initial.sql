CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, email TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMPTZ, image TEXT,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT','CONSULTANT','ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower ON users(lower(email));
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL, provider VARCHAR(255) NOT NULL, "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT, access_token TEXT, expires_at BIGINT, id_token TEXT, scope TEXT, session_state TEXT, token_type TEXT,
  UNIQUE(provider, "providerAccountId")
);
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL, "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);
CREATE INDEX sessions_user ON sessions("userId");
CREATE TABLE verification_token (identifier TEXT NOT NULL, expires TIMESTAMPTZ NOT NULL, token TEXT NOT NULL, PRIMARY KEY(identifier, token));
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE,
  whatsapp TEXT, user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX contacts_email_lower ON contacts(lower(email));
CREATE SEQUENCE question_reference_seq;
CREATE SEQUENCE consultation_reference_seq;
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reference TEXT NOT NULL UNIQUE,
  contact_id UUID NOT NULL REFERENCES contacts(id), category TEXT NOT NULL,
  subject TEXT NOT NULL, body TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'WEBSITE' CHECK(source IN ('WEBSITE','WHATSAPP')),
  status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','IN_PROGRESS','ANSWERED','DECLINED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX questions_contact ON questions(contact_id);
CREATE INDEX questions_status_date ON questions(status, created_at DESC);
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id), body TEXT NOT NULL DEFAULT '', sources TEXT NOT NULL DEFAULT '',
  risks TEXT NOT NULL DEFAULT '', assumptions TEXT NOT NULL DEFAULT '', analysis_date DATE NOT NULL,
  published_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (published_at IS NULL OR (length(trim(body)) >= 10 AND length(trim(risks)) >= 10 AND length(trim(assumptions)) >= 10))
);
CREATE INDEX responses_question ON responses(question_id, published_at);
CREATE UNIQUE INDEX one_response_draft_per_consultant ON responses(question_id, consultant_id) WHERE published_at IS NULL;
CREATE TABLE question_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id), from_status TEXT, to_status TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX events_question ON question_events(question_id, created_at);
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reference TEXT NOT NULL UNIQUE, contact_id UUID NOT NULL REFERENCES contacts(id),
  topic TEXT NOT NULL, client_notes TEXT NOT NULL DEFAULT '', preferred_at TIMESTAMPTZ NOT NULL, confirmed_at TIMESTAMPTZ,
  meeting_url TEXT NOT NULL DEFAULT '', staff_notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED','CONFIRMED','COMPLETED','CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(status NOT IN ('CONFIRMED','COMPLETED') OR confirmed_at IS NOT NULL),
  CHECK(status <> 'REQUESTED' OR confirmed_at IS NULL)
);
CREATE INDEX consultations_contact ON consultations(contact_id);
CREATE INDEX consultations_status ON consultations(status, preferred_at);
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT NOT NULL UNIQUE, kind TEXT NOT NULL CHECK(kind IN ('lesson','study','market','faq')),
  title TEXT NOT NULL, excerpt TEXT NOT NULL, body TEXT NOT NULL, level INTEGER CHECK(level BETWEEN 1 AND 5),
  category TEXT NOT NULL, read_minutes INTEGER NOT NULL DEFAULT 5 CHECK(read_minutes BETWEEN 1 AND 120),
  author TEXT NOT NULL, featured BOOLEAN NOT NULL DEFAULT false, status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED')),
  author_id UUID REFERENCES users(id), published_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(kind <> 'lesson' OR level IS NOT NULL),
  CHECK(status <> 'PUBLISHED' OR published_at IS NOT NULL)
);
CREATE INDEX contents_publication ON contents(status, kind, published_at DESC);
CREATE TABLE content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id), snapshot JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), to_email TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
  dedupe_key TEXT NOT NULL UNIQUE, attempts INTEGER NOT NULL DEFAULT 0, available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ, lock_token UUID, sent_at TIMESTAMPTZ, last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notification_pending ON notification_outbox(available_at) WHERE sent_at IS NULL;
CREATE TABLE rate_limits (key_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
