-- ============================================================
-- Migration: 20260403_complete_operational_schema.sql
-- Descrição: Schema operacional completo — multi-tenant com RLS
-- Autor: Flow Events Platform
-- ⚠️  NÃO modifica nada relacionado à Capital Strike
-- ============================================================

-- Habilita extensão para geolocalização (necessária para event_geofences)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE venue_item_type       AS ENUM ('stage', 'stand', 'checkpoint');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE staff_invite_role     AS ENUM ('coordinator', 'operator', 'checkin', 'pdv', 'security', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status    AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credential_type       AS ENUM ('badge', 'qrcode');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credential_status     AS ENUM ('active', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE checkin_result        AS ENUM ('valid', 'duplicated', 'invalid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE timeclock_entry_type  AS ENUM ('start', 'pause', 'resume', 'end');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE comm_channel          AS ENUM ('email', 'whatsapp');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE comm_status           AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_job_status      AS ENUM ('pending', 'running', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE financial_entry_type  AS ENUM ('revenue', 'cost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE person_event_role     AS ENUM ('attendee', 'staff', 'vendor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- HELPER: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- HELPER: organization_id do usuário autenticado
-- ============================================================

CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- HELPER: organization_id a partir de event_id
-- ============================================================

CREATE OR REPLACE FUNCTION event_org_id(p_event_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT organization_id FROM events WHERE id = p_event_id LIMIT 1;
$$;

-- ============================================================
-- HELPER: organization_id a partir de staff_id
-- ============================================================

CREATE OR REPLACE FUNCTION staff_org_id(p_staff_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT e.organization_id
  FROM staff_members sm
  JOIN events e ON e.id = sm.event_id
  WHERE sm.id = p_staff_id
  LIMIT 1;
$$;

-- ============================================================
-- 1. event_editions
-- ============================================================

CREATE TABLE IF NOT EXISTS event_editions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  active      BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_editions_event_id   ON event_editions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_editions_starts_at  ON event_editions(starts_at);

CREATE OR REPLACE TRIGGER trg_event_editions_updated_at
  BEFORE UPDATE ON event_editions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE event_editions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. venues
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  address         TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venues_organization_id ON venues(organization_id);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. venue_maps
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_maps (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id   UUID        NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  version    INTEGER     NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venue_maps_venue_id ON venue_maps(venue_id);

ALTER TABLE venue_maps ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. venue_zones
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_zones (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id     UUID        NOT NULL REFERENCES venue_maps(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  capacity   INTEGER     CHECK (capacity >= 0),
  color      TEXT        DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venue_zones_map_id ON venue_zones(map_id);

ALTER TABLE venue_zones ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. venue_items
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_items (
  id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id    UUID              NOT NULL REFERENCES venue_zones(id) ON DELETE CASCADE,
  type       venue_item_type   NOT NULL,
  label      TEXT              NOT NULL,
  created_at TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venue_items_zone_id ON venue_items(zone_id);
CREATE INDEX IF NOT EXISTS idx_venue_items_type    ON venue_items(type);

ALTER TABLE venue_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. stages
-- ============================================================

CREATE TABLE IF NOT EXISTS stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     UUID NOT NULL REFERENCES venue_zones(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_stages_zone_id ON stages(zone_id);

ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. vendors  (antes de stands — FK depende desta tabela)
-- ============================================================

CREATE TABLE IF NOT EXISTS vendors (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  contact_info    JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_organization_id ON vendors(organization_id);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. stands
-- ============================================================

CREATE TABLE IF NOT EXISTS stands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     UUID NOT NULL REFERENCES venue_zones(id) ON DELETE CASCADE,
  vendor_id   UUID REFERENCES vendors(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_stands_zone_id   ON stands(zone_id);
CREATE INDEX IF NOT EXISTS idx_stands_vendor_id ON stands(vendor_id);

ALTER TABLE stands ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. checkpoints
-- ============================================================

CREATE TABLE IF NOT EXISTS checkpoints (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id    UUID        NOT NULL REFERENCES venue_zones(id) ON DELETE CASCADE,
  label      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_zone_id ON checkpoints(zone_id);

ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. teams
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT
);

CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. staff_invite_links
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_invite_links (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID               NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token           TEXT               NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ,
  role            staff_invite_role  NOT NULL DEFAULT 'staff',
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_invite_links_organization_id ON staff_invite_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_invite_links_token           ON staff_invite_links(token);

ALTER TABLE staff_invite_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. staff_applications
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_applications (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID               NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT               NOT NULL,
  name            TEXT               NOT NULL,
  phone           TEXT,
  status          application_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_applications_organization_id ON staff_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_applications_status          ON staff_applications(status);
CREATE INDEX IF NOT EXISTS idx_staff_applications_email           ON staff_applications(email);

ALTER TABLE staff_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. credentials
-- ============================================================

CREATE TABLE IF NOT EXISTS credentials (
  id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID              NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  type       credential_type   NOT NULL DEFAULT 'qrcode',
  status     credential_status NOT NULL DEFAULT 'active',
  issued_at  TIMESTAMPTZ       NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_credentials_staff_id ON credentials(staff_id);
CREATE INDEX IF NOT EXISTS idx_credentials_status   ON credentials(status);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. credential_access_rules
-- ============================================================

CREATE TABLE IF NOT EXISTS credential_access_rules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID        NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  zone_id       UUID        NOT NULL REFERENCES venue_zones(id) ON DELETE CASCADE,
  valid_from    TIMESTAMPTZ,
  valid_until   TIMESTAMPTZ,
  CONSTRAINT uq_credential_zone UNIQUE (credential_id, zone_id)
);

CREATE INDEX IF NOT EXISTS idx_credential_access_rules_credential_id ON credential_access_rules(credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_access_rules_zone_id        ON credential_access_rules(zone_id);

ALTER TABLE credential_access_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. checkin_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS checkin_logs (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id     UUID           NOT NULL REFERENCES credentials(id),
  checkpoint_id     UUID           NOT NULL REFERENCES checkpoints(id),
  scanned_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  result            checkin_result NOT NULL DEFAULT 'valid',
  device_id         TEXT,
  staff_operator_id UUID           REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_checkin_logs_credential_id     ON checkin_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_checkpoint_id     ON checkin_logs(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_scanned_at        ON checkin_logs(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_result            ON checkin_logs(result);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_staff_operator_id ON checkin_logs(staff_operator_id);

ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. event_geofences  (requer PostGIS)
-- ============================================================

CREATE TABLE IF NOT EXISTS event_geofences (
  id         UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID                      NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT                      NOT NULL,
  polygon    GEOGRAPHY(POLYGON, 4326)  NOT NULL,
  created_at TIMESTAMPTZ               NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_geofences_event_id ON event_geofences(event_id);
CREATE INDEX IF NOT EXISTS idx_event_geofences_polygon  ON event_geofences USING GIST(polygon);

ALTER TABLE event_geofences ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. timeclock_sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS timeclock_sessions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID        NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at   TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeclock_sessions_staff_id   ON timeclock_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_timeclock_sessions_event_id   ON timeclock_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_timeclock_sessions_started_at ON timeclock_sessions(started_at DESC);

ALTER TABLE timeclock_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. timeclock_entries
-- ============================================================

CREATE TABLE IF NOT EXISTS timeclock_entries (
  id         UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID                 NOT NULL REFERENCES timeclock_sessions(id) ON DELETE CASCADE,
  type       timeclock_entry_type NOT NULL,
  timestamp  TIMESTAMPTZ          NOT NULL DEFAULT now(),
  latitude   NUMERIC(10, 7),
  longitude  NUMERIC(10, 7)
);

CREATE INDEX IF NOT EXISTS idx_timeclock_entries_session_id ON timeclock_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_timeclock_entries_timestamp  ON timeclock_entries(timestamp DESC);

ALTER TABLE timeclock_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. timeclock_exceptions
-- ============================================================

CREATE TABLE IF NOT EXISTS timeclock_exceptions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID        NOT NULL REFERENCES timeclock_sessions(id) ON DELETE CASCADE,
  reason     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeclock_exceptions_session_id ON timeclock_exceptions(session_id);

ALTER TABLE timeclock_exceptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. email_templates
-- ============================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key             TEXT        NOT NULL,
  subject         TEXT        NOT NULL,
  html            TEXT        NOT NULL,
  text            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_email_template_org_key UNIQUE (organization_id, key)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_organization_id ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_key             ON email_templates(key);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. whatsapp_templates
-- ============================================================

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key             TEXT        NOT NULL,
  body            TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_whatsapp_template_org_key UNIQUE (organization_id, key)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_organization_id ON whatsapp_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_key             ON whatsapp_templates(key);

ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. communications_log
-- ============================================================

CREATE TABLE IF NOT EXISTS communications_log (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_key    TEXT         NOT NULL,
  channel         comm_channel NOT NULL,
  recipient       TEXT         NOT NULL,
  status          comm_status  NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communications_log_organization_id ON communications_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_communications_log_channel         ON communications_log(channel);
CREATE INDEX IF NOT EXISTS idx_communications_log_status          ON communications_log(status);
CREATE INDEX IF NOT EXISTS idx_communications_log_created_at      ON communications_log(created_at DESC);

ALTER TABLE communications_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. notification_jobs
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_jobs (
  id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID             NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_key        TEXT             NOT NULL,
  audience_segment_id UUID             REFERENCES audience_segments(id) ON DELETE SET NULL,
  scheduled_at        TIMESTAMPTZ      NOT NULL DEFAULT now(),
  status              notif_job_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_organization_id     ON notification_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status              ON notification_jobs(status);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_scheduled_at        ON notification_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_audience_segment_id ON notification_jobs(audience_segment_id);

ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. documents
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  url             TEXT        NOT NULL,
  type            TEXT        NOT NULL DEFAULT 'other',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_type            ON documents(type);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. financial_entries
-- ============================================================

CREATE TABLE IF NOT EXISTS financial_entries (
  id          UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID                 NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type        financial_entry_type NOT NULL,
  amount      NUMERIC(10, 2)       NOT NULL CHECK (amount >= 0),
  description TEXT                 NOT NULL,
  occurred_at TIMESTAMPTZ          NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_entries_event_id    ON financial_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_type        ON financial_entries(type);
CREATE INDEX IF NOT EXISTS idx_financial_entries_occurred_at ON financial_entries(occurred_at DESC);

ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. person_event_profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS person_event_profiles (
  id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id  UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id   UUID              NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role       person_event_role NOT NULL DEFAULT 'attendee',
  created_at TIMESTAMPTZ       NOT NULL DEFAULT now(),
  CONSTRAINT uq_person_event_role UNIQUE (person_id, event_id, role)
);

CREATE INDEX IF NOT EXISTS idx_person_event_profiles_person_id ON person_event_profiles(person_id);
CREATE INDEX IF NOT EXISTS idx_person_event_profiles_event_id  ON person_event_profiles(event_id);
CREATE INDEX IF NOT EXISTS idx_person_event_profiles_role      ON person_event_profiles(role);

ALTER TABLE person_event_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY — POLÍTICAS
-- ============================================================

-- ── event_editions ──────────────────────────────────────────
DROP POLICY IF EXISTS event_editions_org ON event_editions;
CREATE POLICY event_editions_org ON event_editions
  USING (event_org_id(event_id) = auth_org_id());

-- ── venues ──────────────────────────────────────────────────
DROP POLICY IF EXISTS venues_org ON venues;
CREATE POLICY venues_org ON venues
  USING (organization_id = auth_org_id());

-- ── venue_maps ──────────────────────────────────────────────
DROP POLICY IF EXISTS venue_maps_org ON venue_maps;
CREATE POLICY venue_maps_org ON venue_maps
  USING (
    (SELECT organization_id FROM venues WHERE id = venue_maps.venue_id) = auth_org_id()
  );

-- ── venue_zones ─────────────────────────────────────────────
DROP POLICY IF EXISTS venue_zones_org ON venue_zones;
CREATE POLICY venue_zones_org ON venue_zones
  USING (
    (SELECT v.organization_id
     FROM venue_maps vm
     JOIN venues v ON v.id = vm.venue_id
     WHERE vm.id = venue_zones.map_id) = auth_org_id()
  );

-- ── venue_items ─────────────────────────────────────────────
DROP POLICY IF EXISTS venue_items_org ON venue_items;
CREATE POLICY venue_items_org ON venue_items
  USING (
    (SELECT v.organization_id
     FROM venue_zones vz
     JOIN venue_maps  vm ON vm.id = vz.map_id
     JOIN venues       v ON  v.id = vm.venue_id
     WHERE vz.id = venue_items.zone_id) = auth_org_id()
  );

-- ── stages ──────────────────────────────────────────────────
DROP POLICY IF EXISTS stages_org ON stages;
CREATE POLICY stages_org ON stages
  USING (
    (SELECT v.organization_id
     FROM venue_zones vz
     JOIN venue_maps  vm ON vm.id = vz.map_id
     JOIN venues       v ON  v.id = vm.venue_id
     WHERE vz.id = stages.zone_id) = auth_org_id()
  );

-- ── stands ──────────────────────────────────────────────────
DROP POLICY IF EXISTS stands_org ON stands;
CREATE POLICY stands_org ON stands
  USING (
    (SELECT v.organization_id
     FROM venue_zones vz
     JOIN venue_maps  vm ON vm.id = vz.map_id
     JOIN venues       v ON  v.id = vm.venue_id
     WHERE vz.id = stands.zone_id) = auth_org_id()
  );

-- ── checkpoints ─────────────────────────────────────────────
DROP POLICY IF EXISTS checkpoints_org ON checkpoints;
CREATE POLICY checkpoints_org ON checkpoints
  USING (
    (SELECT v.organization_id
     FROM venue_zones vz
     JOIN venue_maps  vm ON vm.id = vz.map_id
     JOIN venues       v ON  v.id = vm.venue_id
     WHERE vz.id = checkpoints.zone_id) = auth_org_id()
  );

-- ── teams ────────────────────────────────────────────────────
DROP POLICY IF EXISTS teams_org ON teams;
CREATE POLICY teams_org ON teams
  USING (organization_id = auth_org_id());

-- ── staff_invite_links ───────────────────────────────────────
DROP POLICY IF EXISTS staff_invite_links_public_read ON staff_invite_links;
DROP POLICY IF EXISTS staff_invite_links_org_write   ON staff_invite_links;
-- Leitura pública do token (validar convite sem login)
CREATE POLICY staff_invite_links_public_read ON staff_invite_links
  FOR SELECT USING (true);
-- Escrita restrita à organização
CREATE POLICY staff_invite_links_org_write ON staff_invite_links
  FOR ALL USING (organization_id = auth_org_id());

-- ── staff_applications ───────────────────────────────────────
DROP POLICY IF EXISTS staff_applications_public_insert ON staff_applications;
DROP POLICY IF EXISTS staff_applications_org           ON staff_applications;
DROP POLICY IF EXISTS staff_applications_org_update    ON staff_applications;
-- Formulário público: qualquer um pode inserir
CREATE POLICY staff_applications_public_insert ON staff_applications
  FOR INSERT WITH CHECK (true);
-- Org lê e atualiza
CREATE POLICY staff_applications_org ON staff_applications
  FOR SELECT USING (organization_id = auth_org_id());
CREATE POLICY staff_applications_org_update ON staff_applications
  FOR UPDATE USING (organization_id = auth_org_id());

-- ── credentials ─────────────────────────────────────────────
DROP POLICY IF EXISTS credentials_org ON credentials;
CREATE POLICY credentials_org ON credentials
  USING (staff_org_id(staff_id) = auth_org_id());

-- ── credential_access_rules ──────────────────────────────────
DROP POLICY IF EXISTS credential_access_rules_org ON credential_access_rules;
CREATE POLICY credential_access_rules_org ON credential_access_rules
  USING (
    staff_org_id(
      (SELECT staff_id FROM credentials WHERE id = credential_access_rules.credential_id)
    ) = auth_org_id()
  );

-- ── checkin_logs ────────────────────────────────────────────
DROP POLICY IF EXISTS checkin_logs_org ON checkin_logs;
CREATE POLICY checkin_logs_org ON checkin_logs
  USING (
    staff_org_id(
      (SELECT staff_id FROM credentials WHERE id = checkin_logs.credential_id)
    ) = auth_org_id()
  );

-- ── event_geofences ─────────────────────────────────────────
DROP POLICY IF EXISTS event_geofences_org ON event_geofences;
CREATE POLICY event_geofences_org ON event_geofences
  USING (event_org_id(event_id) = auth_org_id());

-- ── timeclock_sessions ───────────────────────────────────────
DROP POLICY IF EXISTS timeclock_sessions_org ON timeclock_sessions;
CREATE POLICY timeclock_sessions_org ON timeclock_sessions
  USING (event_org_id(event_id) = auth_org_id());

-- ── timeclock_entries ───────────────────────────────────────
DROP POLICY IF EXISTS timeclock_entries_org ON timeclock_entries;
CREATE POLICY timeclock_entries_org ON timeclock_entries
  USING (
    event_org_id(
      (SELECT event_id FROM timeclock_sessions WHERE id = timeclock_entries.session_id)
    ) = auth_org_id()
  );

-- ── timeclock_exceptions ────────────────────────────────────
DROP POLICY IF EXISTS timeclock_exceptions_org ON timeclock_exceptions;
CREATE POLICY timeclock_exceptions_org ON timeclock_exceptions
  USING (
    event_org_id(
      (SELECT event_id FROM timeclock_sessions WHERE id = timeclock_exceptions.session_id)
    ) = auth_org_id()
  );

-- ── email_templates ─────────────────────────────────────────
DROP POLICY IF EXISTS email_templates_org ON email_templates;
CREATE POLICY email_templates_org ON email_templates
  USING (organization_id = auth_org_id());

-- ── whatsapp_templates ──────────────────────────────────────
DROP POLICY IF EXISTS whatsapp_templates_org ON whatsapp_templates;
CREATE POLICY whatsapp_templates_org ON whatsapp_templates
  USING (organization_id = auth_org_id());

-- ── communications_log ──────────────────────────────────────
DROP POLICY IF EXISTS communications_log_org ON communications_log;
CREATE POLICY communications_log_org ON communications_log
  USING (organization_id = auth_org_id());

-- ── notification_jobs ───────────────────────────────────────
DROP POLICY IF EXISTS notification_jobs_org ON notification_jobs;
CREATE POLICY notification_jobs_org ON notification_jobs
  USING (organization_id = auth_org_id());

-- ── documents ───────────────────────────────────────────────
DROP POLICY IF EXISTS documents_org ON documents;
CREATE POLICY documents_org ON documents
  USING (organization_id = auth_org_id());

-- ── financial_entries ───────────────────────────────────────
DROP POLICY IF EXISTS financial_entries_org ON financial_entries;
CREATE POLICY financial_entries_org ON financial_entries
  USING (event_org_id(event_id) = auth_org_id());

-- ── vendors ─────────────────────────────────────────────────
DROP POLICY IF EXISTS vendors_org ON vendors;
CREATE POLICY vendors_org ON vendors
  USING (organization_id = auth_org_id());

-- ── person_event_profiles ───────────────────────────────────
DROP POLICY IF EXISTS person_event_profiles_org  ON person_event_profiles;
DROP POLICY IF EXISTS person_event_profiles_self ON person_event_profiles;
-- Org vê todos os perfis dos seus eventos
CREATE POLICY person_event_profiles_org ON person_event_profiles
  USING (event_org_id(event_id) = auth_org_id());
-- Cada pessoa lê o próprio perfil
CREATE POLICY person_event_profiles_self ON person_event_profiles
  FOR SELECT USING (person_id = auth.uid());

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
