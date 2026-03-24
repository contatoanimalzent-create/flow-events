-- ============================================================
-- ANIMALZ EVENTS - CRM customers foundation
-- Migration: 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id   UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  document          TEXT,
  birth_date        DATE,
  city              TEXT,
  state             TEXT,
  tags              JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes             TEXT,
  first_order_at    TIMESTAMPTZ,
  last_order_at     TIMESTAMPTZ,
  total_orders      INTEGER NOT NULL DEFAULT 0,
  total_spent       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_org_email
  ON public.customers (organization_id, email);

CREATE TABLE IF NOT EXISTS public.customer_event_profiles (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id       UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id           UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  event_id              UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  orders_count          INTEGER NOT NULL DEFAULT 0,
  tickets_count         INTEGER NOT NULL DEFAULT 0,
  attended_count        INTEGER NOT NULL DEFAULT 0,
  no_show_count         INTEGER NOT NULL DEFAULT 0,
  gross_revenue         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_revenue           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  first_interaction_at  TIMESTAMPTZ,
  last_interaction_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_event_profiles_org_customer_event
  ON public.customer_event_profiles (organization_id, customer_id, event_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_event_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_customers" ON public.customers
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "org_access_customer_event_profiles" ON public.customer_event_profiles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS customer_event_profiles_updated_at ON public.customer_event_profiles;
CREATE TRIGGER customer_event_profiles_updated_at
  BEFORE UPDATE ON public.customer_event_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
