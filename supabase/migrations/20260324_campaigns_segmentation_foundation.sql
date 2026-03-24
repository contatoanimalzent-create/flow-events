-- ============================================================
-- ANIMALZ EVENTS - Campaigns segmentation foundation
-- Migration: 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audience_segments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id   UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  filter_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  audience_count    INTEGER NOT NULL DEFAULT 0,
  last_previewed_at TIMESTAMPTZ,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_drafts (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id   UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  segment_id        UUID REFERENCES public.audience_segments(id) ON DELETE SET NULL,
  event_id          UUID REFERENCES public.events(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  channel           TEXT NOT NULL DEFAULT 'email'
                    CHECK (channel IN ('email', 'whatsapp', 'sms', 'push')),
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  subject           TEXT,
  message_body      TEXT,
  audience_count    INTEGER NOT NULL DEFAULT 0,
  scheduled_at      TIMESTAMPTZ,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audience_segments_org ON public.audience_segments(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_org ON public.campaign_drafts(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_segment ON public.campaign_drafts(segment_id);

ALTER TABLE public.audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_audience_segments" ON public.audience_segments
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "org_access_campaign_drafts" ON public.campaign_drafts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS audience_segments_updated_at ON public.audience_segments;
CREATE TRIGGER audience_segments_updated_at
  BEFORE UPDATE ON public.audience_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS campaign_drafts_updated_at ON public.campaign_drafts;
CREATE TRIGGER campaign_drafts_updated_at
  BEFORE UPDATE ON public.campaign_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
