-- ============================================================
-- ANIMALZ EVENTS - Financial payouts, forecast and event closure
-- Migration: 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  gross_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  refunds_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  chargeback_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
  retained_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payable_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  event_organizer_net NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'paid', 'held', 'divergent')),
  scheduled_at TIMESTAMPTZ,
  paid_out_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT event_payouts_event_unique UNIQUE (event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_payouts_organization_id
  ON public.event_payouts(organization_id);

CREATE TABLE IF NOT EXISTS public.financial_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  projected_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  projected_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  projected_margin NUMERIC(12,2) NOT NULL DEFAULT 0,
  projected_margin_percent NUMERIC(8,2) NOT NULL DEFAULT 0,
  risk_status TEXT NOT NULL DEFAULT 'medium'
    CHECK (risk_status IN ('low', 'medium', 'high')),
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT financial_forecasts_event_unique UNIQUE (event_id)
);

CREATE INDEX IF NOT EXISTS idx_financial_forecasts_organization_id
  ON public.financial_forecasts(organization_id);

CREATE TABLE IF NOT EXISTS public.event_financial_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_closure', 'closed')),
  payments_reconciled BOOLEAN NOT NULL DEFAULT false,
  costs_recorded BOOLEAN NOT NULL DEFAULT false,
  payouts_reviewed BOOLEAN NOT NULL DEFAULT false,
  divergences_resolved BOOLEAN NOT NULL DEFAULT false,
  result_validated BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT event_financial_closures_event_unique UNIQUE (event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_financial_closures_organization_id
  ON public.event_financial_closures(organization_id);

DROP TRIGGER IF EXISTS set_event_payouts_updated_at ON public.event_payouts;
CREATE TRIGGER set_event_payouts_updated_at
BEFORE UPDATE ON public.event_payouts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_financial_forecasts_updated_at ON public.financial_forecasts;
CREATE TRIGGER set_financial_forecasts_updated_at
BEFORE UPDATE ON public.financial_forecasts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_event_financial_closures_updated_at ON public.event_financial_closures;
CREATE TRIGGER set_event_financial_closures_updated_at
BEFORE UPDATE ON public.event_financial_closures
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
