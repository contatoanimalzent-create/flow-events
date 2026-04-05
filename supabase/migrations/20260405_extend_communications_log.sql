-- Migration: extend communications_log with per-channel detail columns
-- Applied: 2026-04-05
--
-- The original table only had: organization_id, template_key, channel,
-- recipient, status, created_at.  The columns below make it useful for
-- both the email batch-sender (process-staff-invite) and the WhatsApp
-- dispatcher (send-whatsapp).

ALTER TABLE communications_log
  -- per-channel recipient fields
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS recipient_phone TEXT,

  -- email-specific
  ADD COLUMN IF NOT EXISTS subject         TEXT,

  -- rendered body preview (first 500 chars, for audit)
  ADD COLUMN IF NOT EXISTS body_preview    TEXT,

  -- provider message id (Twilio SID, Resend id, etc.)
  ADD COLUMN IF NOT EXISTS message_sid     TEXT,

  -- failure details
  ADD COLUMN IF NOT EXISTS error_message   TEXT,

  -- arbitrary structured context (invite_link_id, variables, etc.)
  ADD COLUMN IF NOT EXISTS metadata        JSONB,

  -- when the provider call was made
  ADD COLUMN IF NOT EXISTS sent_at         TIMESTAMPTZ;

-- Useful for provider-level deduplication / webhook matching
CREATE INDEX IF NOT EXISTS idx_communications_log_message_sid
  ON communications_log (message_sid)
  WHERE message_sid IS NOT NULL;

-- Useful for per-recipient history queries
CREATE INDEX IF NOT EXISTS idx_communications_log_recipient_email
  ON communications_log (recipient_email)
  WHERE recipient_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_communications_log_recipient_phone
  ON communications_log (recipient_phone)
  WHERE recipient_phone IS NOT NULL;
