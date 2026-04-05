-- Migration: add batch-email columns to staff_invite_links
-- Applied: 2026-04-05

ALTER TABLE staff_invite_links
  ADD COLUMN IF NOT EXISTS send_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (send_status IN ('pending', 'sent', 'failed', 'expired', 'skipped')),
  ADD COLUMN IF NOT EXISTS target_email TEXT,
  ADD COLUMN IF NOT EXISTS target_name  TEXT,
  ADD COLUMN IF NOT EXISTS sent_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS send_error   TEXT;

-- Fast lookup for the batch processor (only unprocessed rows)
CREATE INDEX IF NOT EXISTS idx_staff_invite_links_send_status
  ON staff_invite_links (send_status)
  WHERE send_status = 'pending';
