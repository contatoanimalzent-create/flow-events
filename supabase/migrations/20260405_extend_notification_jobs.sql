-- ============================================================
-- Migration: extend notification_jobs + communications_log
-- Applied: 2026-04-05
-- ============================================================
--
-- Extends notification_jobs with the columns needed by the
-- process-notification-jobs Edge Function:
--   channel       — which provider to use (email | whatsapp)
--   event_id      — optional scope for audience resolution
--   variables     — JSONB placeholder values merged into template
--   started_at    — set when status changes to 'running'
--   completed_at  — set when status changes to 'completed' or 'failed'
--   error_message — details when status = 'failed'
--   processed_count / failed_count — per-run stats
--
-- Extends communications_log with:
--   notification_job_id — links a log row back to its job (idempotency key)
-- ============================================================

-- ── 1. notification_jobs additions ───────────────────────────────────────────

ALTER TABLE notification_jobs
  ADD COLUMN IF NOT EXISTS channel         TEXT        NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'whatsapp')),
  ADD COLUMN IF NOT EXISTS event_id        UUID        REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variables       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error_message   TEXT,
  ADD COLUMN IF NOT EXISTS processed_count INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_count    INT         NOT NULL DEFAULT 0;

-- Composite index for the main job-picker query
CREATE INDEX IF NOT EXISTS idx_notification_jobs_pending_scheduled
  ON notification_jobs (scheduled_at, status)
  WHERE status = 'pending';

-- ── 2. communications_log: notification_job_id (idempotency) ─────────────────

ALTER TABLE communications_log
  ADD COLUMN IF NOT EXISTS notification_job_id UUID REFERENCES notification_jobs(id) ON DELETE SET NULL;

-- Partial index makes idempotency check (job_id + recipient + status) fast
CREATE INDEX IF NOT EXISTS idx_comm_log_job_recipient
  ON communications_log (notification_job_id, recipient)
  WHERE notification_job_id IS NOT NULL AND status = 'sent';

-- ── 3. pg_net extension (required for HTTP calls from pg_cron) ───────────────

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── 4. Helper function called by pg_cron ─────────────────────────────────────
--
-- Reads the cron secret from the database setting 'app.cron_secret'.
-- Set it once with:
--   ALTER DATABASE postgres SET "app.cron_secret" = 'your-secret-value';
-- Then restart the DB connection (or reconnect) for the setting to take effect.

CREATE OR REPLACE FUNCTION public.trigger_notification_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _secret TEXT;
BEGIN
  _secret := current_setting('app.cron_secret', true);

  PERFORM net.http_post(
    url     := 'https://nrjizzfkhficvhiiqvtl.supabase.co/functions/v1/process-notification-jobs',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-cron-secret', COALESCE(_secret, '')
    ),
    body    := '{"source":"pg_cron"}'::jsonb
  );
END;
$$;

-- ── 5. pg_cron schedule: every minute ────────────────────────────────────────
--
-- Idempotent: DROP + re-CREATE so re-running this migration is safe.

SELECT cron.unschedule('process-notification-jobs') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-notification-jobs'
);

SELECT cron.schedule(
  'process-notification-jobs',
  '* * * * *',
  'SELECT public.trigger_notification_jobs()'
);
