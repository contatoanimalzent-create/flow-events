-- Apple Store + Google Play Compliance:
-- Apps com login devem permitir auto-exclusao da conta (App Store Guideline 5.1.1.v)
-- LGPD (Brasil) + GDPR (UE) exigem retencao max de 30 dias para dados pessoais apos solicitacao.

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  reason        text,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  scheduled_for timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  processed_at  timestamptz,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_deletion_user      ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_status    ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_scheduled ON account_deletion_requests(scheduled_for) WHERE status = 'pending';

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletion_requests_own_read"
  ON account_deletion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Soft-delete: coluna deleted_at em profiles (se nao existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='deleted_at') THEN
    ALTER TABLE profiles ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Push tokens table (used by setupPushNotifications)
CREATE TABLE IF NOT EXISTS push_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      text NOT NULL UNIQUE,
  platform   text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  app_version text,
  device_model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_own_all"
  ON push_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE account_deletion_requests IS 'Apple Guideline 5.1.1.v + LGPD Art. 18 IV';
COMMENT ON TABLE push_tokens IS 'APNs / FCM device tokens for push notifications';
