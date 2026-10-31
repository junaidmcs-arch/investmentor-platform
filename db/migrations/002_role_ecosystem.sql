ALTER TABLE users ADD COLUMN suspended_at TIMESTAMPTZ;
ALTER TABLE contents ADD COLUMN moderation_hold BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE contents ADD COLUMN moderation_note TEXT NOT NULL DEFAULT '';

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id), action TEXT NOT NULL,
  entity_type TEXT NOT NULL, entity_id UUID, details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_date ON audit_events(created_at DESC);
CREATE TABLE bookmarks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(user_id,content_id)
);
CREATE TABLE investor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), audience_email TEXT NOT NULL,
  title TEXT NOT NULL, dedupe_key TEXT NOT NULL UNIQUE,
  read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX investor_notifications_owner ON investor_notifications(lower(audience_email),created_at DESC);
INSERT INTO investor_notifications(audience_email,title,dedupe_key,created_at)
SELECT lower(to_email),subject,dedupe_key,created_at FROM notification_outbox;

CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), consultant_id UUID NOT NULL REFERENCES users(id),
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  closed BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(ends_at > starts_at)
);
CREATE INDEX appointment_slots_consultant ON appointment_slots(consultant_id,starts_at);
ALTER TABLE consultations ADD COLUMN slot_id UUID REFERENCES appointment_slots(id);
CREATE UNIQUE INDEX consultation_slot_reservation ON consultations(slot_id) WHERE status <> 'CANCELLED';
CREATE TABLE consultant_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  booking_url TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
