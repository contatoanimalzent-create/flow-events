-- Foundation for external registrations and sponsors

CREATE TABLE IF NOT EXISTS public.capital_strike_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  address TEXT NOT NULL,
  squad TEXT,
  army TEXT NOT NULL CHECK (army IN ('coalizao', 'alianca')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.capital_strike_registrations
  ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'capital_strike_registrations'
      AND policyname = 'public_insert_capital_strike_registrations'
  ) THEN
    CREATE POLICY "public_insert_capital_strike_registrations"
      ON public.capital_strike_registrations
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'capital_strike_registrations'
      AND policyname = 'authenticated_read_capital_strike_registrations'
  ) THEN
    CREATE POLICY "authenticated_read_capital_strike_registrations"
      ON public.capital_strike_registrations
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tier TEXT NOT NULL DEFAULT 'gold' CHECK (tier IN ('title', 'gold', 'silver', 'bronze', 'media', 'support')),
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'negotiating', 'confirmed', 'active', 'completed', 'cancelled')),
  investment_value NUMERIC(12, 2),
  deliverables TEXT,
  logo_url TEXT,
  website_url TEXT,
  notes TEXT,
  contract_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sponsors
  ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sponsors'
      AND policyname = 'org_access_sponsors'
  ) THEN
    CREATE POLICY "org_access_sponsors"
      ON public.sponsors
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id
          FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

DROP TRIGGER IF EXISTS capital_strike_registrations_updated_at ON public.capital_strike_registrations;
CREATE TRIGGER capital_strike_registrations_updated_at
  BEFORE UPDATE ON public.capital_strike_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS sponsors_updated_at ON public.sponsors;
CREATE TRIGGER sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_capital_strike_registrations_created_at
  ON public.capital_strike_registrations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_capital_strike_registrations_army
  ON public.capital_strike_registrations(army);

CREATE INDEX IF NOT EXISTS idx_sponsors_organization_id
  ON public.sponsors(organization_id);

CREATE INDEX IF NOT EXISTS idx_sponsors_event_id
  ON public.sponsors(event_id);
