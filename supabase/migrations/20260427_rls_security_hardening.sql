-- ============================================================================
-- Flow Events / Pulse — RLS Security Hardening
-- Migration: 2026-04-27
-- Purpose: Enable RLS on tables that were created without it and lock them
-- down to organization-scoped access. Edge functions using SERVICE_ROLE_KEY
-- continue to work (service role bypasses RLS).
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: ensure auth_org_id() exists (created in earlier migrations).
-- If not present this migration should fail loudly.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'auth_org_id'
  ) THEN
    RAISE EXCEPTION 'auth_org_id() function is missing — apply earlier migrations first';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. payments — organization_id present
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_org_access ON public.payments;
CREATE POLICY payments_org_access ON public.payments
  FOR ALL
  TO authenticated
  USING (
    organization_id IS NULL
    OR organization_id = auth_org_id()
  )
  WITH CHECK (
    organization_id IS NULL
    OR organization_id = auth_org_id()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. payment_webhook_events — written by service role only.
-- Lock down completely; service role bypasses RLS.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_webhook_events_org_read ON public.payment_webhook_events;
CREATE POLICY payment_webhook_events_org_read ON public.payment_webhook_events
  FOR SELECT
  TO authenticated
  USING (
    order_id IS NULL OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payment_webhook_events.order_id
        AND o.organization_id = auth_org_id()
    )
  );

-- No INSERT/UPDATE/DELETE for authenticated; only service role writes.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. transactional_messages — link via order_id
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.transactional_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS transactional_messages_org_read ON public.transactional_messages;
CREATE POLICY transactional_messages_org_read ON public.transactional_messages
  FOR SELECT
  TO authenticated
  USING (
    order_id IS NULL OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = transactional_messages.order_id
        AND o.organization_id = auth_org_id()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. event_payouts — organization_id
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.event_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_payouts_org_access ON public.event_payouts;
CREATE POLICY event_payouts_org_access ON public.event_payouts
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. financial_forecasts — organization_id
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.financial_forecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS financial_forecasts_org_access ON public.financial_forecasts;
CREATE POLICY financial_forecasts_org_access ON public.financial_forecasts
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. event_financial_closures — organization_id
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.event_financial_closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_financial_closures_org_access ON public.event_financial_closures;
CREATE POLICY event_financial_closures_org_access ON public.event_financial_closures
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. intelligence_alert_states — organization_id
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.intelligence_alert_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS intelligence_alert_states_org_access ON public.intelligence_alert_states;
CREATE POLICY intelligence_alert_states_org_access ON public.intelligence_alert_states
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Revoke broad anon permissions on financial tables (defense in depth)
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE ALL ON public.payments               FROM anon;
REVOKE ALL ON public.payment_webhook_events FROM anon;
REVOKE ALL ON public.transactional_messages FROM anon;
REVOKE ALL ON public.event_payouts          FROM anon;
REVOKE ALL ON public.financial_forecasts    FROM anon;
REVOKE ALL ON public.event_financial_closures FROM anon;
REVOKE ALL ON public.intelligence_alert_states FROM anon;
