-- ============================================================
-- ANIMALZ EVENTS - Growth loops, referrals and lead capture
-- Migration: 2026-03-26
-- Shared links, referral conversions and organic acquisition
-- ============================================================

CREATE TABLE IF NOT EXISTS public.growth_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  source TEXT NOT NULL DEFAULT 'public_exit_capture',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'qualified', 'contacted', 'converted', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  benefit_type TEXT NOT NULL DEFAULT 'discount'
    CHECK (benefit_type IN ('discount', 'cashback', 'future_credit', 'vip_upgrade')),
  benefit_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  benefit_description TEXT,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  revenue_generated NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  referral_link_id UUID NOT NULL REFERENCES public.referral_links(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_email TEXT,
  conversion BOOLEAN NOT NULL DEFAULT TRUE,
  gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  reward_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (reward_status IN ('pending', 'granted', 'rejected', 'expired')),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id)
);

ALTER TABLE public.growth_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_growth_leads" ON public.growth_leads;
CREATE POLICY "authenticated_manage_growth_leads" ON public.growth_leads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_manage_referral_links" ON public.referral_links;
CREATE POLICY "authenticated_manage_referral_links" ON public.referral_links
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated_manage_referral_conversions" ON public.referral_conversions;
CREATE POLICY "authenticated_manage_referral_conversions" ON public.referral_conversions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "anon_insert_growth_leads" ON public.growth_leads;
CREATE POLICY "anon_insert_growth_leads" ON public.growth_leads
  FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "anon_read_public_referral_links" ON public.referral_links;
CREATE POLICY "anon_read_public_referral_links" ON public.referral_links
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "anon_insert_referral_conversions" ON public.referral_conversions;
CREATE POLICY "anon_insert_referral_conversions" ON public.referral_conversions
  FOR INSERT
  WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_growth_leads_org_created
  ON public.growth_leads(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_growth_leads_event_created
  ON public.growth_leads(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_links_org_event
  ON public.referral_links(organization_id, event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_conversions_org_created
  ON public.referral_conversions(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_conversions_event_created
  ON public.referral_conversions(event_id, created_at DESC);

DROP TRIGGER IF EXISTS growth_leads_updated_at ON public.growth_leads;
CREATE TRIGGER growth_leads_updated_at
  BEFORE UPDATE ON public.growth_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS referral_links_updated_at ON public.referral_links;
CREATE TRIGGER referral_links_updated_at
  BEFORE UPDATE ON public.referral_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.sync_referral_link_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.referral_links
    SET
      conversion_count = conversion_count + 1,
      revenue_generated = revenue_generated + COALESCE(NEW.gross_amount, 0),
      updated_at = NOW()
    WHERE id = NEW.referral_link_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.referral_links
    SET
      conversion_count = GREATEST(conversion_count - 1, 0),
      revenue_generated = GREATEST(revenue_generated - COALESCE(OLD.gross_amount, 0), 0),
      updated_at = NOW()
    WHERE id = OLD.referral_link_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS referral_conversions_sync_counters ON public.referral_conversions;
CREATE TRIGGER referral_conversions_sync_counters
  AFTER INSERT OR DELETE ON public.referral_conversions
  FOR EACH ROW EXECUTE FUNCTION public.sync_referral_link_counters();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE OR REPLACE FUNCTION public.create_order_draft_with_reservations(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_quantity INTEGER;
  v_batch_id UUID;
  v_platform_fee NUMERIC := COALESCE((p_payload->>'platform_fee_amount')::NUMERIC, COALESCE((p_payload->>'fee_amount')::NUMERIC, 0));
  v_customer_fee NUMERIC := COALESCE((p_payload->>'customer_fee_amount')::NUMERIC, v_platform_fee);
  v_absorbed_fee NUMERIC := COALESCE((p_payload->>'absorbed_fee_amount')::NUMERIC, GREATEST(v_platform_fee - v_customer_fee, 0));
BEGIN
  INSERT INTO public.orders (
    organization_id,
    event_id,
    buyer_name,
    buyer_email,
    buyer_phone,
    buyer_cpf,
    subtotal,
    discount_amount,
    fee_amount,
    platform_fee_amount,
    customer_fee_amount,
    absorbed_fee_amount,
    fee_type,
    fee_value,
    absorb_fee,
    total_amount,
    status,
    payment_method,
    source_channel,
    expires_at,
    notes,
    metadata
  )
  VALUES (
    NULLIF(p_payload->>'organization_id', '')::UUID,
    NULLIF(p_payload->>'event_id', '')::UUID,
    COALESCE(NULLIF(TRIM(p_payload->'buyer'->>'name'), ''), 'Comprador'),
    COALESCE(NULLIF(TRIM(p_payload->'buyer'->>'email'), ''), 'checkout@animalz.local'),
    NULLIF(TRIM(p_payload->'buyer'->>'phone'), ''),
    NULLIF(TRIM(p_payload->'buyer'->>'cpf'), ''),
    COALESCE((p_payload->>'subtotal')::NUMERIC, 0),
    COALESCE((p_payload->>'discount_amount')::NUMERIC, 0),
    v_platform_fee,
    v_platform_fee,
    v_customer_fee,
    v_absorbed_fee,
    COALESCE(NULLIF(p_payload->>'fee_type', ''), 'percentage'),
    COALESCE((p_payload->>'fee_value')::NUMERIC, 0),
    COALESCE((p_payload->>'absorb_fee')::BOOLEAN, FALSE),
    COALESCE((p_payload->>'total_amount')::NUMERIC, 0),
    COALESCE(NULLIF(p_payload->>'status', ''), 'draft'),
    NULLIF(p_payload->>'payment_method', ''),
    NULLIF(p_payload->>'source_channel', ''),
    COALESCE(NULLIF(p_payload->>'expires_at', '')::TIMESTAMPTZ, NOW() + INTERVAL '15 minutes'),
    NULLIF(p_payload->>'notes', ''),
    COALESCE(p_payload->'metadata', '{}'::JSONB)
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(COALESCE(p_payload->'items', '[]'::JSONB))
  LOOP
    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 0), 0);
    v_batch_id := NULLIF(v_item->>'batch_id', '')::UUID;

    IF v_batch_id IS NOT NULL AND v_quantity > 0 THEN
      UPDATE public.ticket_batches
      SET reserved_count = COALESCE(reserved_count, 0) + v_quantity
      WHERE id = v_batch_id
        AND is_active = TRUE
        AND (COALESCE(quantity, 0) - COALESCE(sold_count, 0) - COALESCE(reserved_count, 0)) >= v_quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'inventory_unavailable_for_batch:%', v_batch_id;
      END IF;
    END IF;

    INSERT INTO public.order_items (
      order_id,
      ticket_type_id,
      batch_id,
      holder_name,
      holder_email,
      unit_price,
      quantity,
      total_price
    )
    VALUES (
      v_order_id,
      NULLIF(v_item->>'ticket_type_id', '')::UUID,
      v_batch_id,
      NULLIF(TRIM(v_item->>'holder_name'), ''),
      NULLIF(TRIM(v_item->>'holder_email'), ''),
      COALESCE((v_item->>'unit_price')::NUMERIC, 0),
      v_quantity,
      COALESCE((v_item->>'total_price')::NUMERIC, COALESCE((v_item->>'unit_price')::NUMERIC, 0) * v_quantity)
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;
