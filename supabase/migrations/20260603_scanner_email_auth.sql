CREATE TABLE IF NOT EXISTS public.scanner_auth_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  code_hash text NOT NULL,
  session_token_hash text,
  expires_at timestamptz NOT NULL,
  session_expires_at timestamptz,
  consumed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scanner_auth_codes_event_email_created
  ON public.scanner_auth_codes(event_id, lower(email), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scanner_auth_codes_session
  ON public.scanner_auth_codes(event_id, session_token_hash)
  WHERE session_token_hash IS NOT NULL;

ALTER TABLE public.scanner_auth_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scanner_auth_codes_no_client_access ON public.scanner_auth_codes;
CREATE POLICY scanner_auth_codes_no_client_access
  ON public.scanner_auth_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);
