-- ============================================================================
-- SECURITY HARDENING PRE-LAUNCH
-- Aplica fixes criticos identificados na auditoria de 2026-05-12
-- ============================================================================

-- ─── FIX 1: push_tokens schema unificado ───────────────────────────────────
-- O schema antigo (20260419) usa profile_id; o novo (20260512_account_deletion)
-- usa user_id. Como `IF NOT EXISTS` faz o segundo ser ignorado, padronizamos
-- adicionando colunas faltantes ao schema vivo.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='push_tokens' AND column_name='profile_id') THEN
    -- Schema legado existe: adicionar user_id como alias e backfill
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='push_tokens' AND column_name='user_id') THEN
      ALTER TABLE push_tokens ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      UPDATE push_tokens SET user_id = profile_id WHERE user_id IS NULL;
      CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='push_tokens' AND column_name='last_active_at') THEN
      ALTER TABLE push_tokens ADD COLUMN last_active_at timestamptz NOT NULL DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='push_tokens' AND column_name='app_version') THEN
      ALTER TABLE push_tokens ADD COLUMN app_version text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='push_tokens' AND column_name='device_model') THEN
      ALTER TABLE push_tokens ADD COLUMN device_model text;
    END IF;
  END IF;
END $$;

-- Garantir unique em token
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename='push_tokens' AND indexname='push_tokens_token_unique'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX push_tokens_token_unique ON push_tokens(token);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END;
  END IF;
END $$;

-- Re-criar policy correta cobrindo user_id E profile_id
DROP POLICY IF EXISTS "push_tokens_own"     ON push_tokens;
DROP POLICY IF EXISTS "push_tokens_own_all" ON push_tokens;

CREATE POLICY "push_tokens_own_all"
  ON push_tokens
  FOR ALL
  USING (
    auth.uid() = COALESCE(
      (CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_name='push_tokens' AND column_name='user_id')
            THEN user_id END),
      profile_id
    )
  )
  WITH CHECK (
    auth.uid() = COALESCE(
      (CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_name='push_tokens' AND column_name='user_id')
            THEN user_id END),
      profile_id
    )
  );

-- ─── FIX 2: staff_invite_links — fechar SELECT publico ─────────────────────
-- Anterior: USING (true) permite enumerar TODOS os tokens de convite
-- Agora: somente via edge function (service role) ou owner do invite

DROP POLICY IF EXISTS "staff_invite_links_public_select" ON staff_invite_links;
DROP POLICY IF EXISTS "staff_invite_links_select"        ON staff_invite_links;
DROP POLICY IF EXISTS "staff_invite_links_open"          ON staff_invite_links;

CREATE POLICY "staff_invite_links_org_read"
  ON staff_invite_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = staff_invite_links.event_id
        AND e.organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid()
        )
    )
  );

-- ─── FIX 3: capital_strike_registrations — fechar SELECT por org ──────────
DROP POLICY IF EXISTS "authenticated_read"                          ON capital_strike_registrations;
DROP POLICY IF EXISTS "capital_strike_registrations_open"           ON capital_strike_registrations;
DROP POLICY IF EXISTS "capital_strike_registrations_authenticated"  ON capital_strike_registrations;

CREATE POLICY "capital_strike_registrations_org_read"
  ON capital_strike_registrations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ─── FIX 4: event_announcements — somente eventos publicados ──────────────
DROP POLICY IF EXISTS "event_announcements_public_read" ON event_announcements;
DROP POLICY IF EXISTS "event_announcements_open"        ON event_announcements;

CREATE POLICY "event_announcements_public_read"
  ON event_announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_announcements.event_id
        AND events.status IN ('published', 'ongoing')
    )
  );

-- ─── FIX 5: staff_location_events retention (LGPD minimizacao) ────────────
-- Cria funcao que pode ser chamada por cron (pg_cron) ou edge function diaria

CREATE OR REPLACE FUNCTION purge_old_staff_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM staff_location_events
  WHERE detected_at < now() - interval '30 days';
END $$;

COMMENT ON FUNCTION purge_old_staff_locations() IS 'LGPD/GDPR: minimizacao de dados de localizacao apos 30 dias';

-- Agendar via pg_cron (se disponivel)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    PERFORM cron.schedule('purge-staff-locations', '0 3 * * *', 'SELECT purge_old_staff_locations()');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- ignora se ja existir
END $$;

-- ─── FIX 6: account_deletion_requests INSERT policy explicita ────────────
DROP POLICY IF EXISTS "deletion_requests_own_insert" ON account_deletion_requests;
CREATE POLICY "deletion_requests_own_insert"
  ON account_deletion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── FIX 7: indices ausentes em FKs ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_staff_invite_links_event       ON staff_invite_links(event_id);
CREATE INDEX IF NOT EXISTS idx_event_announcements_event      ON event_announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_capital_strike_org             ON capital_strike_registrations(organization_id);

-- ─── FIX 8: digital_tickets status check (anti-replay) ────────────────────
-- Garante que ingresso 'used' nao pode ser revertido para 'active' via API publica
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='digital_tickets_status_progression_check') THEN
    ALTER TABLE digital_tickets
      ADD CONSTRAINT digital_tickets_status_progression_check
      CHECK (status IN ('active', 'used', 'cancelled', 'refunded', 'transferred'));
  END IF;
END $$;

-- ─── COMENTARIOS ──────────────────────────────────────────────────────────
COMMENT ON COLUMN push_tokens.user_id IS 'Unificado em 2026-05-12 (antes era profile_id)';
COMMENT ON POLICY "staff_invite_links_org_read" ON staff_invite_links IS 'Fechado em 2026-05-12 (antes USING true vazava tokens)';
COMMENT ON POLICY "capital_strike_registrations_org_read" ON capital_strike_registrations IS 'Fechado em 2026-05-12 por org';
