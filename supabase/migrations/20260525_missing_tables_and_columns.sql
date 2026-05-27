-- =============================================================================
-- FLOW EVENTS — Missing tables & columns referenced by application code
-- 20260525_missing_tables_and_columns.sql
-- Creates 12 new tables + adds missing columns to event_feed_posts
-- =============================================================================

-- ============================================================
-- 1. Missing columns on event_feed_posts
-- ============================================================
ALTER TABLE event_feed_posts
  ADD COLUMN IF NOT EXISTS body          text,
  ADD COLUMN IF NOT EXISTS image_url     text,
  ADD COLUMN IF NOT EXISTS likes_count   integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS author_name   text,
  ADD COLUMN IF NOT EXISTS author_id     uuid;

-- ============================================================
-- 2. agenda_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS agenda_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  speaker_name  text,
  stage         text,
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz,
  category      text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE agenda_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_sessions_select" ON agenda_sessions FOR SELECT USING (true);
CREATE POLICY "agenda_sessions_all" ON agenda_sessions FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. agenda_favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS agenda_favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES agenda_sessions(id) ON DELETE CASCADE,
  event_id    uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE agenda_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_favorites_select" ON agenda_favorites FOR SELECT USING (true);
CREATE POLICY "agenda_favorites_all" ON agenda_favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 4. feed_likes
-- ============================================================
CREATE TABLE IF NOT EXISTS feed_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES event_feed_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  event_id   uuid REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE feed_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_likes_select" ON feed_likes FOR SELECT USING (true);
CREATE POLICY "feed_likes_all" ON feed_likes FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 5. staff_instructions
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_instructions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_by  uuid,
  title       text NOT NULL,
  body        text,
  priority    text DEFAULT 'normal',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE staff_instructions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_instructions_select" ON staff_instructions FOR SELECT USING (true);
CREATE POLICY "staff_instructions_insert" ON staff_instructions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 6. supervisor_approvals
-- ============================================================
CREATE TABLE IF NOT EXISTS supervisor_approvals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  staff_member_id  uuid REFERENCES staff_members(id) ON DELETE CASCADE,
  type             text NOT NULL,
  reason           text,
  requested_at     timestamptz DEFAULT now(),
  status           text DEFAULT 'pending',
  resolved_by      uuid,
  resolved_at      timestamptz
);

ALTER TABLE supervisor_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supervisor_approvals_select" ON supervisor_approvals FOR SELECT USING (true);
CREATE POLICY "supervisor_approvals_all" ON supervisor_approvals FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 7. team_invites
-- ============================================================
CREATE TABLE IF NOT EXISTS team_invites (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email            text NOT NULL,
  role             text DEFAULT 'member',
  invited_by       uuid,
  status           text DEFAULT 'pending',
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_invites_select" ON team_invites FOR SELECT USING (true);
CREATE POLICY "team_invites_all" ON team_invites FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 8. referral_links
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_links (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id            uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  referrer_id         uuid NOT NULL,
  code                text NOT NULL,
  benefit_type        text DEFAULT 'discount',
  benefit_value       numeric DEFAULT 0,
  benefit_description text,
  conversion_count    integer DEFAULT 0,
  revenue_generated   numeric DEFAULT 0,
  is_active           boolean DEFAULT true,
  metadata            jsonb DEFAULT '{}',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_links_select" ON referral_links FOR SELECT USING (true);
CREATE POLICY "referral_links_all" ON referral_links FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 9. referral_conversions
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_conversions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referral_link_id uuid NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
  referrer_id      uuid NOT NULL,
  event_id         uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  order_id         uuid,
  buyer_email      text,
  conversion       boolean DEFAULT false,
  gross_amount     numeric DEFAULT 0,
  reward_status    text DEFAULT 'pending',
  metadata         jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_conversions_select" ON referral_conversions FOR SELECT USING (true);
CREATE POLICY "referral_conversions_all" ON referral_conversions FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 10. referral_clicks
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_clicks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code  text NOT NULL,
  ip_address     text,
  user_agent     text,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_clicks_select" ON referral_clicks FOR SELECT USING (true);
CREATE POLICY "referral_clicks_insert" ON referral_clicks FOR INSERT WITH CHECK (true);

-- ============================================================
-- 11. commissions
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id  uuid NOT NULL,
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount       numeric DEFAULT 0,
  currency     text DEFAULT 'BRL',
  status       text DEFAULT 'pending',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (true);
CREATE POLICY "commissions_all" ON commissions FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 12. promoter_ranking
-- ============================================================
CREATE TABLE IF NOT EXISTS promoter_ranking (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  owner_id     uuid NOT NULL,
  sales_count  integer DEFAULT 0,
  revenue      numeric DEFAULT 0,
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE promoter_ranking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promoter_ranking_select" ON promoter_ranking FOR SELECT USING (true);
CREATE POLICY "promoter_ranking_all" ON promoter_ranking FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 13. promoter_goals
-- ============================================================
CREATE TABLE IF NOT EXISTS promoter_goals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id  uuid NOT NULL,
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label        text NOT NULL,
  target       numeric NOT NULL,
  current      numeric DEFAULT 0,
  unit         text DEFAULT 'vendas',
  deadline     timestamptz,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE promoter_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promoter_goals_select" ON promoter_goals FOR SELECT USING (true);
CREATE POLICY "promoter_goals_all" ON promoter_goals FOR ALL USING (auth.role() = 'authenticated');
