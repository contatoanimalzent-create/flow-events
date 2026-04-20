-- =============================================================================
-- FLOW EVENTS — COMPLETE PLATFORM SCHEMA
-- 20260419_complete_platform_schema.sql
-- Adds all missing tables from the full platform specification.
-- Skips tables that already exist (roles, events, profiles, organizations, etc.)
-- =============================================================================

-- ============================================================
-- 1. RBAC — Roles, Permissions & Overrides
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text UNIQUE NOT NULL,
  name       text NOT NULL,
  module     text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS member_permission_overrides (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_member_id uuid REFERENCES organization_members(id) ON DELETE CASCADE,
  permission_id          uuid REFERENCES permissions(id) ON DELETE CASCADE,
  effect                 text NOT NULL CHECK (effect IN ('allow', 'deny')),
  UNIQUE(organization_member_id, permission_id)
);

-- ============================================================
-- 2. EVENTS — Extended Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS event_status_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid REFERENCES events(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  changed_at timestamptz DEFAULT now()
);

-- event_zones: event-scoped sectors (separate from venue_zones)
CREATE TABLE IF NOT EXISTS event_zones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES events(id) ON DELETE CASCADE,
  name           text NOT NULL,
  code           text,
  zone_type      text,
  capacity       integer,
  polygon        jsonb,
  entry_required boolean DEFAULT false,
  exit_required  boolean DEFAULT false,
  is_restricted  boolean DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

-- event_access_points: physical gates tied to event_zones
CREATE TABLE IF NOT EXISTS event_access_points (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES events(id) ON DELETE CASCADE,
  zone_id        uuid REFERENCES event_zones(id),
  name           text NOT NULL,
  code           text,
  access_type    text,
  lat            numeric,
  lng            numeric,
  radius_meters  integer,
  status         text DEFAULT 'active',
  created_at     timestamptz DEFAULT now()
);

-- event_sessions: attractions, talks, performances within a schedule block
CREATE TABLE IF NOT EXISTS event_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE,
  schedule_id  uuid REFERENCES event_schedules(id),
  title        text NOT NULL,
  description  text,
  speaker_name text,
  session_type text,
  zone_id      uuid REFERENCES event_zones(id),
  start_at     timestamptz,
  end_at       timestamptz,
  capacity     integer,
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- 3. TICKETING — Extended Tables
-- ============================================================

-- promoters / embaixadores
CREATE TABLE IF NOT EXISTS promoters (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id       uuid REFERENCES profiles(id),
  code             text UNIQUE NOT NULL,
  commission_type  text CHECK (commission_type IN ('fixed', 'percentage')),
  commission_value numeric(12,2),
  status           text DEFAULT 'active',
  created_at       timestamptz DEFAULT now()
);

-- tickets: individual QR-based tickets (complements digital_tickets checkout flow)
CREATE TABLE IF NOT EXISTS tickets (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           uuid REFERENCES events(id) ON DELETE CASCADE,
  order_id           uuid REFERENCES orders(id),
  ticket_type_id     uuid REFERENCES ticket_types(id),
  holder_profile_id  uuid REFERENCES profiles(id),
  holder_name        text,
  holder_email       text,
  holder_phone       text,
  qr_token           text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  qr_hash            text NOT NULL DEFAULT '',
  qr_expires_at      timestamptz,
  status             text NOT NULL DEFAULT 'active',
  issued_at          timestamptz DEFAULT now(),
  last_regenerated_at timestamptz
);

-- ticket_transfers
CREATE TABLE IF NOT EXISTS ticket_transfers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid REFERENCES tickets(id) ON DELETE CASCADE,
  from_profile_id uuid REFERENCES profiles(id),
  to_profile_id   uuid REFERENCES profiles(id),
  status          text NOT NULL DEFAULT 'pending',
  requested_at    timestamptz DEFAULT now(),
  completed_at    timestamptz
);

-- ============================================================
-- 4. CHECK-IN — Extended Tables
-- ============================================================

-- checkin_devices: authorized scanner devices
CREATE TABLE IF NOT EXISTS checkin_devices (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                uuid REFERENCES events(id) ON DELETE CASCADE,
  device_name             text NOT NULL,
  device_uuid             text UNIQUE NOT NULL,
  assigned_to_profile_id  uuid REFERENCES profiles(id),
  access_point_id         uuid REFERENCES event_access_points(id),
  status                  text DEFAULT 'active',
  last_seen_at            timestamptz,
  created_at              timestamptz DEFAULT now()
);

-- checkin_attempts: every scan attempt (valid or not)
CREATE TABLE IF NOT EXISTS checkin_attempts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid REFERENCES events(id) ON DELETE CASCADE,
  ticket_id           uuid REFERENCES tickets(id),
  qr_token            text NOT NULL,
  access_point_id     uuid REFERENCES event_access_points(id),
  operator_profile_id uuid REFERENCES profiles(id),
  device_id           uuid REFERENCES checkin_devices(id),
  result              text NOT NULL CHECK (result IN ('success', 'denied', 'error')),
  reason              text,
  attempted_at        timestamptz DEFAULT now()
);

-- ============================================================
-- 5. STAFF — Extended Tables
-- ============================================================

-- staff_roles: operational function catalog per org
CREATE TABLE IF NOT EXISTS staff_roles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  description     text,
  access_level    integer NOT NULL DEFAULT 1,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- staff: base operational record (separate from staff_members)
CREATE TABLE IF NOT EXISTS staff (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id              uuid REFERENCES profiles(id),
  full_name               text NOT NULL,
  phone                   text,
  email                   text,
  document_number         text,
  birth_date              date,
  photo_url               text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  staff_category          text,
  status                  text DEFAULT 'active',
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- staff_event_assignments: who is assigned to which event in which role
CREATE TABLE IF NOT EXISTS staff_event_assignments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid REFERENCES events(id) ON DELETE CASCADE,
  staff_id            uuid REFERENCES staff(id) ON DELETE CASCADE,
  role_id             uuid REFERENCES staff_roles(id),
  primary_zone_id     uuid REFERENCES event_zones(id),
  supervisor_staff_id uuid REFERENCES staff(id),
  status              text DEFAULT 'active',
  notes               text,
  assigned_at         timestamptz DEFAULT now(),
  UNIQUE(event_id, staff_id)
);

-- staff_shifts: planned work windows per assignment
CREATE TABLE IF NOT EXISTS staff_shifts (
  id                                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                              uuid REFERENCES events(id) ON DELETE CASCADE,
  staff_assignment_id                   uuid REFERENCES staff_event_assignments(id) ON DELETE CASCADE,
  name                                  text NOT NULL,
  starts_at                             timestamptz NOT NULL,
  ends_at                               timestamptz NOT NULL,
  grace_minutes                         integer DEFAULT 5,
  auto_checkout_after_minutes_outside   integer DEFAULT 5,
  created_at                            timestamptz DEFAULT now()
);

-- staff_area_permissions: zone-level access per assignment
CREATE TABLE IF NOT EXISTS staff_area_permissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_assignment_id uuid REFERENCES staff_event_assignments(id) ON DELETE CASCADE,
  zone_id             uuid REFERENCES event_zones(id) ON DELETE CASCADE,
  can_enter           boolean DEFAULT true,
  can_exit            boolean DEFAULT true,
  is_primary          boolean DEFAULT false,
  UNIQUE(staff_assignment_id, zone_id)
);

-- staff_presence_sessions: real presence session per shift
CREATE TABLE IF NOT EXISTS staff_presence_sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id              uuid REFERENCES events(id) ON DELETE CASCADE,
  staff_id              uuid REFERENCES staff(id) ON DELETE CASCADE,
  staff_assignment_id   uuid REFERENCES staff_event_assignments(id),
  shift_id              uuid REFERENCES staff_shifts(id),
  check_in_at           timestamptz,
  check_out_at          timestamptz,
  check_in_method       text,
  check_out_method      text,
  check_in_zone_id      uuid REFERENCES event_zones(id),
  check_out_zone_id     uuid REFERENCES event_zones(id),
  check_in_lat          numeric,
  check_in_lng          numeric,
  check_out_lat         numeric,
  check_out_lng         numeric,
  status                text DEFAULT 'active',
  total_minutes_present integer DEFAULT 0,
  total_minutes_outside integer DEFAULT 0,
  created_at            timestamptz DEFAULT now()
);

-- staff_location_events: GPS pings
CREATE TABLE IF NOT EXISTS staff_location_events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid REFERENCES events(id) ON DELETE CASCADE,
  staff_id            uuid REFERENCES staff(id) ON DELETE CASCADE,
  session_id          uuid REFERENCES staff_presence_sessions(id),
  lat                 numeric NOT NULL,
  lng                 numeric NOT NULL,
  accuracy_meters     numeric,
  battery_level       integer,
  inside_allowed_zone boolean,
  matched_zone_id     uuid REFERENCES event_zones(id),
  detected_at         timestamptz DEFAULT now()
);

-- staff_presence_events: operational events derived from GPS
CREATE TABLE IF NOT EXISTS staff_presence_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  staff_id    uuid REFERENCES staff(id) ON DELETE CASCADE,
  session_id  uuid REFERENCES staff_presence_sessions(id),
  event_type  text NOT NULL CHECK (event_type IN (
    'check_in', 'check_out', 'outside_zone_started', 'outside_zone_confirmed',
    'returned_to_zone', 'late_arrival', 'abandoned_post', 'manual_override'
  )),
  zone_id     uuid REFERENCES event_zones(id),
  triggered_at timestamptz DEFAULT now(),
  metadata    jsonb
);

-- staff_occurrences: incident reports
CREATE TABLE IF NOT EXISTS staff_occurrences (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  staff_id    uuid REFERENCES staff(id) ON DELETE CASCADE,
  session_id  uuid REFERENCES staff_presence_sessions(id),
  type        text NOT NULL,
  severity    text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title       text NOT NULL,
  description text,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- staff_devices: mobile devices used by staff
CREATE TABLE IF NOT EXISTS staff_devices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    uuid REFERENCES staff(id) ON DELETE CASCADE,
  device_uuid text UNIQUE NOT NULL,
  platform    text,
  last_seen_at timestamptz,
  status      text DEFAULT 'active',
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 6. COMMUNICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS push_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  device_uuid text NOT NULL,
  token       text NOT NULL,
  platform    text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  status      text DEFAULT 'active',
  created_at  timestamptz DEFAULT now(),
  UNIQUE(profile_id, device_uuid)
);

-- ============================================================
-- 7. CRM & GLOBAL IDENTITY
-- ============================================================

CREATE TABLE IF NOT EXISTS user_event_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE,
  ticket_id    uuid REFERENCES tickets(id),
  attended     boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(profile_id, event_id)
);

CREATE TABLE IF NOT EXISTS user_behavior_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id      uuid REFERENCES events(id),
  behavior_type text NOT NULL CHECK (behavior_type IN (
    'viewed_event', 'started_checkout', 'completed_purchase', 'checked_in',
    'opened_notification', 'visited_zone', 'joined_feed', 'bought_upgrade'
  )),
  metadata      jsonb,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_interests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  interest_key text NOT NULL,
  score        integer DEFAULT 1,
  UNIQUE(profile_id, interest_key)
);

CREATE TABLE IF NOT EXISTS user_scores (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score_type  text NOT NULL CHECK (score_type IN (
    'engagement_score', 'attendance_score', 'buyer_score', 'community_score'
  )),
  score_value numeric NOT NULL DEFAULT 0,
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(profile_id, score_type)
);

CREATE TABLE IF NOT EXISTS user_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id        uuid REFERENCES events(id),
  connection_type text NOT NULL DEFAULT 'contact',
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz DEFAULT now(),
  UNIQUE(from_profile_id, to_profile_id, event_id)
);

-- ============================================================
-- 8. FEED & COMMUNITY
-- ============================================================

CREATE TABLE IF NOT EXISTS event_feed_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         uuid REFERENCES events(id) ON DELETE CASCADE,
  author_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_type        text NOT NULL DEFAULT 'text',
  content          text,
  media_url        text,
  visibility       text DEFAULT 'public',
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_feed_comments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          uuid REFERENCES event_feed_posts(id) ON DELETE CASCADE,
  author_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content          text NOT NULL,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_feed_reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES event_feed_posts(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction   text NOT NULL DEFAULT 'like',
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, profile_id, reaction)
);

CREATE TABLE IF NOT EXISTS event_announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid REFERENCES events(id) ON DELETE CASCADE,
  title      text NOT NULL,
  body       text NOT NULL,
  priority   text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 9. INTERNAL MONETIZATION
-- ============================================================

CREATE TABLE IF NOT EXISTS experience_offers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  offer_type  text NOT NULL,
  price       numeric(12,2) NOT NULL,
  currency    text DEFAULT 'BRL',
  zone_id     uuid REFERENCES event_zones(id),
  inventory   integer,
  status      text DEFAULT 'active',
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experience_purchases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id     uuid REFERENCES experience_offers(id) ON DELETE CASCADE,
  profile_id   uuid REFERENCES profiles(id),
  order_id     uuid REFERENCES orders(id),
  status       text NOT NULL DEFAULT 'pending',
  purchased_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS premium_connections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          uuid REFERENCES events(id) ON DELETE CASCADE,
  buyer_profile_id  uuid REFERENCES profiles(id),
  target_profile_id uuid REFERENCES profiles(id),
  price             numeric(12,2),
  status            text NOT NULL DEFAULT 'pending',
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsor_activations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES events(id) ON DELETE CASCADE,
  name            text NOT NULL,
  activation_type text NOT NULL,
  sponsor_name    text,
  zone_id         uuid REFERENCES event_zones(id),
  starts_at       timestamptz,
  ends_at         timestamptz,
  status          text DEFAULT 'active',
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- 10. FINANCIAL
-- ============================================================

CREATE TABLE IF NOT EXISTS financial_transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid REFERENCES organizations(id) ON DELETE CASCADE,
  event_id         uuid REFERENCES events(id),
  transaction_type text NOT NULL,
  reference_type   text,
  reference_id     uuid,
  amount           numeric(12,2) NOT NULL,
  currency         text DEFAULT 'BRL',
  status           text NOT NULL DEFAULT 'pending',
  occurred_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS producer_settlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  event_id        uuid UNIQUE REFERENCES events(id),
  gross_amount    numeric(12,2) NOT NULL DEFAULT 0,
  fees_amount     numeric(12,2) NOT NULL DEFAULT 0,
  refunds_amount  numeric(12,2) NOT NULL DEFAULT 0,
  net_amount      numeric(12,2) NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending',
  calculated_at   timestamptz DEFAULT now(),
  paid_at         timestamptz
);

CREATE TABLE IF NOT EXISTS cash_closings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         uuid REFERENCES events(id) ON DELETE CASCADE,
  zone_id          uuid REFERENCES event_zones(id),
  opened_by        uuid REFERENCES profiles(id),
  closed_by        uuid REFERENCES profiles(id),
  opened_at        timestamptz DEFAULT now(),
  closed_at        timestamptz,
  expected_amount  numeric(12,2),
  actual_amount    numeric(12,2),
  difference_amount numeric(12,2)
);

-- ============================================================
-- 11. AI & OPERATIONAL METRICS
-- ============================================================

CREATE TABLE IF NOT EXISTS operational_metrics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE,
  metric_key   text NOT NULL CHECK (metric_key IN (
    'checkins_per_minute', 'invalid_attempts_per_minute', 'average_entry_time_seconds',
    'active_staff_count', 'outside_zone_staff_count', 'late_staff_count',
    'zone_density_score', 'upgrade_conversion_rate', 'push_open_rate'
  )),
  metric_value numeric NOT NULL,
  zone_id      uuid REFERENCES event_zones(id),
  captured_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  zone_id     uuid REFERENCES event_zones(id),
  alert_type  text NOT NULL,
  severity    text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title       text NOT NULL,
  message     text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at  timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            uuid REFERENCES events(id) ON DELETE CASCADE,
  zone_id             uuid REFERENCES event_zones(id),
  recommendation_type text NOT NULL,
  title               text NOT NULL,
  message             text,
  priority            integer DEFAULT 1,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'expired')),
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_action_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          uuid REFERENCES events(id) ON DELETE CASCADE,
  alert_id          uuid REFERENCES ai_alerts(id),
  recommendation_id uuid REFERENCES ai_recommendations(id),
  taken_by          uuid REFERENCES profiles(id),
  action_taken      text NOT NULL,
  created_at        timestamptz DEFAULT now()
);

-- ============================================================
-- 12. SECURITY & AUDIT
-- ============================================================

CREATE TABLE IF NOT EXISTS security_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  event_id        uuid REFERENCES events(id),
  event_type      text NOT NULL,
  severity        text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description     text,
  metadata        jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     text NOT NULL,
  event_type   text NOT NULL,
  payload      jsonb,
  processed    boolean DEFAULT false,
  processed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_event_zones_event_id         ON event_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_event_access_points_event_id ON event_access_points(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id      ON event_sessions(event_id);

CREATE INDEX IF NOT EXISTS idx_tickets_event_id       ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_token       ON tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_tickets_holder_email   ON tickets(holder_email);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id       ON tickets(order_id);

CREATE INDEX IF NOT EXISTS idx_checkin_attempts_event_ticket ON checkin_attempts(event_id, ticket_id);
CREATE INDEX IF NOT EXISTS idx_checkin_attempts_attempted_at ON checkin_attempts(attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_org_id                    ON staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_profile_id                ON staff(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_presence_sessions_event   ON staff_presence_sessions(event_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_location_events_session   ON staff_location_events(session_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_presence_events_event     ON staff_presence_events(event_id, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_behavior_events_profile ON user_behavior_events(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_connections_from        ON user_connections(from_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_event_history_profile   ON user_event_history(profile_id);

CREATE INDEX IF NOT EXISTS idx_event_feed_posts_event    ON event_feed_posts(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_feed_comments_post  ON event_feed_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_operational_metrics_event_time ON operational_metrics(event_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_event_status         ON ai_alerts(event_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_event       ON ai_recommendations(event_id, status);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_org ON financial_transactions(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_org        ON security_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider      ON webhook_logs(provider, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed     ON webhook_logs(processed) WHERE processed = false;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER set_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS — Enable
-- ============================================================

ALTER TABLE roles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_status_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_zones               ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_access_points       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoters                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transfers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_devices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_attempts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_event_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_area_permissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_presence_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_location_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_presence_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_occurrences         ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_devices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feed_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feed_comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feed_reactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_connections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_activations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE producer_settlements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_metrics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_action_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs              ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS — Policies
-- ============================================================

-- RBAC: public read (no sensitive data)
CREATE POLICY "roles_public_read"        ON roles        FOR SELECT USING (true);
CREATE POLICY "permissions_public_read"  ON permissions  FOR SELECT USING (true);
CREATE POLICY "role_perms_public_read"   ON role_permissions FOR SELECT USING (true);
CREATE POLICY "member_overrides_org"     ON member_permission_overrides
  USING (
    organization_member_id IN (
      SELECT id FROM organization_members WHERE organization_id = auth_org_id()
    )
  );

-- Events extended (org-scoped via helper)
CREATE POLICY "event_status_history_org" ON event_status_history
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "event_zones_org"         ON event_zones
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "event_access_points_org" ON event_access_points
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "event_sessions_org"      ON event_sessions
  USING (event_org_id(event_id) = auth_org_id());

-- Ticketing
CREATE POLICY "promoters_org"           ON promoters
  USING (organization_id = auth_org_id());

CREATE POLICY "tickets_org"             ON tickets
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "ticket_transfers_org"    ON ticket_transfers
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE event_org_id(event_id) = auth_org_id()
    )
  );

-- Check-in
CREATE POLICY "checkin_devices_org"     ON checkin_devices
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "checkin_attempts_org"    ON checkin_attempts
  USING (event_org_id(event_id) = auth_org_id());

-- Staff
CREATE POLICY "staff_org"               ON staff
  USING (organization_id = auth_org_id());

CREATE POLICY "staff_roles_org"         ON staff_roles
  USING (organization_id = auth_org_id());

CREATE POLICY "staff_assignments_org"   ON staff_event_assignments
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "staff_shifts_org"        ON staff_shifts
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "staff_area_perms_org"    ON staff_area_permissions
  USING (
    staff_assignment_id IN (
      SELECT id FROM staff_event_assignments WHERE event_org_id(event_id) = auth_org_id()
    )
  );

CREATE POLICY "staff_presence_sessions_org" ON staff_presence_sessions
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "staff_location_events_org"   ON staff_location_events
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "staff_presence_events_org"   ON staff_presence_events
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "staff_occurrences_org"       ON staff_occurrences
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "staff_devices_org"           ON staff_devices
  USING (
    staff_id IN (SELECT id FROM staff WHERE organization_id = auth_org_id())
  );

-- Communications
CREATE POLICY "push_tokens_own"             ON push_tokens
  USING (profile_id = auth.uid());

-- CRM / User data (own profile)
CREATE POLICY "user_event_history_own"      ON user_event_history
  USING (profile_id = auth.uid());

CREATE POLICY "user_behavior_events_own"    ON user_behavior_events
  USING (profile_id = auth.uid());

CREATE POLICY "user_interests_own"          ON user_interests
  USING (profile_id = auth.uid());

CREATE POLICY "user_scores_own"             ON user_scores
  USING (profile_id = auth.uid());

CREATE POLICY "user_connections_own"        ON user_connections
  USING (from_profile_id = auth.uid() OR to_profile_id = auth.uid());

-- Feed (public read, own write)
CREATE POLICY "feed_posts_public_read"      ON event_feed_posts
  FOR SELECT USING (visibility = 'public');
CREATE POLICY "feed_posts_own_write"        ON event_feed_posts
  FOR ALL USING (author_profile_id = auth.uid());

CREATE POLICY "feed_comments_public_read"   ON event_feed_comments
  FOR SELECT USING (true);
CREATE POLICY "feed_comments_own_write"     ON event_feed_comments
  FOR ALL USING (author_profile_id = auth.uid());

CREATE POLICY "feed_reactions_own"          ON event_feed_reactions
  USING (profile_id = auth.uid());

CREATE POLICY "announcements_public_read"   ON event_announcements
  FOR SELECT USING (true);
CREATE POLICY "announcements_org_write"     ON event_announcements
  FOR ALL USING (event_org_id(event_id) = auth_org_id());

-- Monetization
CREATE POLICY "experience_offers_org"       ON experience_offers
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "experience_purchases_own"    ON experience_purchases
  USING (profile_id = auth.uid());

CREATE POLICY "premium_connections_own"     ON premium_connections
  USING (buyer_profile_id = auth.uid() OR target_profile_id = auth.uid());

CREATE POLICY "sponsor_activations_org"     ON sponsor_activations
  USING (event_org_id(event_id) = auth_org_id());

-- Financial
CREATE POLICY "financial_transactions_org"  ON financial_transactions
  USING (organization_id = auth_org_id());

CREATE POLICY "producer_settlements_org"    ON producer_settlements
  USING (organization_id = auth_org_id());

CREATE POLICY "cash_closings_org"           ON cash_closings
  USING (event_org_id(event_id) = auth_org_id());

-- AI / Metrics
CREATE POLICY "operational_metrics_org"     ON operational_metrics
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "ai_alerts_org"               ON ai_alerts
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "ai_recommendations_org"      ON ai_recommendations
  USING (event_org_id(event_id) = auth_org_id());

CREATE POLICY "ai_action_logs_org"          ON ai_action_logs
  USING (event_org_id(event_id) = auth_org_id());

-- Security / Audit
CREATE POLICY "security_events_org"         ON security_events
  USING (organization_id = auth_org_id());

-- webhook_logs: service role only (deny all authenticated)
CREATE POLICY "webhook_logs_deny_public"    ON webhook_logs
  USING (false);

-- ============================================================
-- SEED — Default Roles & Permissions
-- ============================================================

INSERT INTO roles (code, name, description) VALUES
  ('owner',     'Owner',         'Full access — organization owner'),
  ('admin',     'Administrator', 'Full administrative access'),
  ('manager',   'Event Manager', 'Manage events, staff and reports'),
  ('operator',  'Operator',      'Operational access during live events'),
  ('checkin',   'Check-in Agent','Ticket validation and check-in only'),
  ('finance',   'Finance',       'Financial reports and settlements'),
  ('read_only', 'Read Only',     'View-only access across the platform')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, name, module) VALUES
  ('events.create',      'Create Events',       'events'),
  ('events.edit',        'Edit Events',         'events'),
  ('events.delete',      'Delete Events',       'events'),
  ('events.publish',     'Publish Events',      'events'),
  ('tickets.manage',     'Manage Tickets',      'tickets'),
  ('tickets.checkin',    'Check-in Tickets',    'tickets'),
  ('staff.manage',       'Manage Staff',        'staff'),
  ('staff.view',         'View Staff',          'staff'),
  ('finance.view',       'View Financials',     'finance'),
  ('finance.manage',     'Manage Financials',   'finance'),
  ('reports.view',       'View Reports',        'reports'),
  ('campaigns.manage',   'Manage Campaigns',    'communications'),
  ('feed.moderate',      'Moderate Feed',       'community'),
  ('settings.manage',    'Manage Settings',     'settings'),
  ('ai.view',            'View AI Insights',    'intelligence'),
  ('ai.act',             'Act on AI Alerts',    'intelligence')
ON CONFLICT (code) DO NOTHING;
