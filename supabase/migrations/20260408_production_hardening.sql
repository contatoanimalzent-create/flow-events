-- ============================================================
-- ANIMALZ EVENTS - Production hardening
-- Migration: 2026-04-08
-- Indexes, race condition fix, RLS hardening
-- ============================================================

-- ─── FIX 1: Missing indexes for check-in and order expiration ──────────

CREATE INDEX IF NOT EXISTS idx_digital_tickets_event_qr
  ON public.digital_tickets (event_id, qr_token);

CREATE INDEX IF NOT EXISTS idx_orders_status_expires
  ON public.orders (status, expires_at);

-- ─── FIX 2: Race-condition-safe check-in function ──────────────────────
-- Uses SELECT ... FOR UPDATE to lock the digital_tickets row before
-- validation, preventing two concurrent scans from both succeeding.

CREATE OR REPLACE FUNCTION public.process_digital_ticket_checkin(
  p_event_id UUID,
  p_qr_token TEXT,
  p_gate_id UUID DEFAULT NULL,
  p_operator_id UUID DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_is_exit BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_id UUID;
  v_validation JSONB;
  v_result TEXT;
  v_reason_code TEXT;
  v_can_check_in BOOLEAN;
  v_checkin RECORD;
BEGIN
  -- ── Lock the ticket row FIRST to prevent concurrent check-ins ──
  SELECT dt.id
  INTO v_ticket_id
  FROM public.digital_tickets dt
  WHERE dt.event_id = p_event_id
    AND dt.qr_token = TRIM(p_qr_token)
  FOR UPDATE;

  -- If no ticket found, still call validation to get proper error response
  -- (validate function handles NOT FOUND gracefully)

  -- ── Now run validation with the row locked ──
  v_validation := public.validate_digital_ticket_access(p_event_id, p_qr_token, p_gate_id, p_is_exit);
  v_result := COALESCE(v_validation->>'result', 'invalid');
  v_reason_code := v_validation->>'reason_code';
  v_can_check_in := COALESCE((v_validation->>'can_check_in')::BOOLEAN, FALSE);

  -- Use ticket_id from validation if our lock query missed it
  IF v_ticket_id IS NULL THEN
    v_ticket_id := NULLIF(v_validation->'digital_ticket'->>'id', '')::UUID;
  END IF;

  IF v_can_check_in THEN
    INSERT INTO public.checkins (
      event_id,
      digital_ticket_id,
      gate_id,
      operator_id,
      device_id,
      result,
      reason_code,
      is_exit,
      checked_in_at
    )
    VALUES (
      p_event_id,
      v_ticket_id,
      p_gate_id,
      p_operator_id,
      p_device_id,
      'success',
      v_reason_code,
      p_is_exit,
      NOW()
    )
    RETURNING id, checked_in_at INTO v_checkin;

    IF NOT p_is_exit AND v_ticket_id IS NOT NULL THEN
      UPDATE public.digital_tickets
      SET
        status = 'used',
        checked_in_at = NOW()
      WHERE id = v_ticket_id;
    END IF;
  ELSE
    INSERT INTO public.checkins (
      event_id,
      digital_ticket_id,
      gate_id,
      operator_id,
      device_id,
      result,
      reason_code,
      is_exit,
      checked_in_at
    )
    VALUES (
      p_event_id,
      v_ticket_id,
      p_gate_id,
      p_operator_id,
      p_device_id,
      CASE
        WHEN v_result IN ('already_used', 'invalid', 'expired', 'blocked') THEN v_result
        ELSE 'blocked'
      END,
      v_reason_code,
      p_is_exit,
      NOW()
    )
    RETURNING id, checked_in_at INTO v_checkin;
  END IF;

  RETURN v_validation || jsonb_build_object(
    'checkin_id', v_checkin.id,
    'checked_in_at', v_checkin.checked_in_at
  );
END;
$$;

-- ─── FIX 3: RLS hardening, cross-tenant data isolation ───────────────

-- 3a) capital_strike_registrations, add organization_id and scope SELECT
ALTER TABLE public.capital_strike_registrations
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "authenticated_read_capital_strike_registrations" ON public.capital_strike_registrations;
CREATE POLICY "org_read_capital_strike_registrations"
  ON public.capital_strike_registrations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL  -- legacy rows without org remain visible to any authenticated user
    OR organization_id = auth_org_id()
  );

-- Keep the public INSERT policy (external registrations from anon/authenticated)
-- already exists as "public_insert_capital_strike_registrations"

-- 3b) growth_leads, scope to organization members
DROP POLICY IF EXISTS "authenticated_manage_growth_leads" ON public.growth_leads;
CREATE POLICY "org_manage_growth_leads"
  ON public.growth_leads
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- Keep the anon INSERT policy for public lead capture
-- already exists as "anon_insert_growth_leads"

-- 3c) referral_links, scope to organization members
DROP POLICY IF EXISTS "authenticated_manage_referral_links" ON public.referral_links;
CREATE POLICY "org_manage_referral_links"
  ON public.referral_links
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- Keep the anon SELECT policy for public referral link resolution
-- already exists as "anon_read_public_referral_links"

-- 3d) referral_conversions, scope to organization members
DROP POLICY IF EXISTS "authenticated_manage_referral_conversions" ON public.referral_conversions;
CREATE POLICY "org_manage_referral_conversions"
  ON public.referral_conversions
  FOR ALL
  TO authenticated
  USING (organization_id = auth_org_id())
  WITH CHECK (organization_id = auth_org_id());

-- ─── FIX 5 (dependency): Create qr_tokens table for credential validation ─

CREATE TABLE IF NOT EXISTS public.qr_tokens (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT           NOT NULL UNIQUE,
  ref_type    TEXT           NOT NULL DEFAULT 'credential',
  ref_id      UUID           NOT NULL,
  event_id    UUID           REFERENCES public.events(id) ON DELETE CASCADE,
  is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
  expires_at  TIMESTAMPTZ,
  used_count  INTEGER        NOT NULL DEFAULT 0,
  max_uses    INTEGER,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON public.qr_tokens (token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_ref   ON public.qr_tokens (ref_type, ref_id);

ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_manage_qr_tokens"
  ON public.qr_tokens
  FOR ALL
  TO authenticated
  USING (
    event_id IS NULL
    OR event_org_id(event_id) = auth_org_id()
  )
  WITH CHECK (
    event_id IS NULL
    OR event_org_id(event_id) = auth_org_id()
  );

-- Also add missing columns to checkin_logs for validate-checkin edge function
ALTER TABLE public.checkin_logs
  ADD COLUMN IF NOT EXISTS event_id       UUID REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS qr_token       TEXT,
  ADD COLUMN IF NOT EXISTS action         TEXT,
  ADD COLUMN IF NOT EXISTS denial_reason  TEXT,
  ADD COLUMN IF NOT EXISTS occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS metadata       JSONB NOT NULL DEFAULT '{}'::JSONB;
