-- ============================================================
-- ANIMALZ EVENTS - Billing & monetization foundation
-- Migration: 2026-03-26
-- Planos SaaS, fee config por evento e split de taxas nos pedidos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'annual', 'custom')),
  features JSONB NOT NULL DEFAULT '[]'::JSONB,
  limits JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_subscription_plans" ON public.subscription_plans;
CREATE POLICY "authenticated_read_subscription_plans" ON public.subscription_plans
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

INSERT INTO public.subscription_plans (slug, name, description, price, billing_cycle, features, limits)
VALUES
  (
    'starter',
    'Starter',
    'Entrada para produtores em lancamento, com limites enxutos e fee padrao.',
    0,
    'monthly',
    '["standard_checkout","email_support"]'::JSONB,
    '{"events": 2, "tickets_per_event": 4}'::JSONB
  ),
  (
    'pro',
    'Pro',
    'Operacao em crescimento com checkout premium, analytics avancado e automacoes iniciais.',
    149,
    'monthly',
    '["standard_checkout","premium_checkout","advanced_analytics","campaign_automation","priority_support"]'::JSONB,
    '{"events": 12, "tickets_per_event": 12}'::JSONB
  ),
  (
    'business',
    'Business',
    'Suite para operações com white-label, integrações e governanca avancada.',
    499,
    'monthly',
    '["standard_checkout","premium_checkout","advanced_analytics","campaign_automation","priority_support","white_label","api_access","custom_domain"]'::JSONB,
    '{"events": 48, "tickets_per_event": 24}'::JSONB
  ),
  (
    'enterprise',
    'Enterprise',
    'Operacao sem limites praticos, fee negociavel e suporte dedicado.',
    0,
    'custom',
    '["standard_checkout","premium_checkout","advanced_analytics","campaign_automation","priority_support","white_label","api_access","custom_domain","enterprise_support","sso"]'::JSONB,
    '{"events": null, "tickets_per_event": null}'::JSONB
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  billing_cycle = EXCLUDED.billing_cycle,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  is_active = TRUE,
  updated_at = NOW();

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS feature_flags JSONB NOT NULL DEFAULT '{}'::JSONB;

UPDATE public.organizations AS organization
SET subscription_plan_id = subscription_plan.id
FROM public.subscription_plans AS subscription_plan
WHERE subscription_plan.slug = COALESCE(NULLIF(organization.plan, ''), 'starter')
  AND organization.subscription_plan_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_plan
  ON public.organizations(subscription_plan_id);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS fee_type TEXT NOT NULL DEFAULT 'percentage'
    CHECK (fee_type IN ('fixed', 'percentage')),
  ADD COLUMN IF NOT EXISTS fee_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS absorb_fee BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_events_org_fee_config
  ON public.events(organization_id, fee_type, absorb_fee);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS absorbed_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_type TEXT NOT NULL DEFAULT 'percentage'
    CHECK (fee_type IN ('fixed', 'percentage')),
  ADD COLUMN IF NOT EXISTS fee_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS absorb_fee BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.orders
SET
  platform_fee_amount = COALESCE(platform_fee_amount, fee_amount, 0),
  customer_fee_amount = COALESCE(customer_fee_amount, fee_amount, 0),
  absorbed_fee_amount = COALESCE(absorbed_fee_amount, 0)
WHERE COALESCE(platform_fee_amount, 0) = 0
   OR COALESCE(customer_fee_amount, 0) = 0;

CREATE INDEX IF NOT EXISTS idx_orders_org_fee_split
  ON public.orders(organization_id, status, created_at DESC);

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
    notes
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
    NULLIF(p_payload->>'notes', '')
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
