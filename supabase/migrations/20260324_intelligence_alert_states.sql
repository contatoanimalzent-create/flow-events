-- ============================================================
-- ANIMALZ EVENTS - Intelligence alert acknowledgements
-- Migration: 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS public.intelligence_alert_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  alert_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'acknowledged')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT intelligence_alert_states_unique UNIQUE (organization_id, alert_id)
);

CREATE INDEX IF NOT EXISTS idx_intelligence_alert_states_event_id
  ON public.intelligence_alert_states(event_id);

DROP TRIGGER IF EXISTS set_intelligence_alert_states_updated_at ON public.intelligence_alert_states;
CREATE TRIGGER set_intelligence_alert_states_updated_at
BEFORE UPDATE ON public.intelligence_alert_states
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
