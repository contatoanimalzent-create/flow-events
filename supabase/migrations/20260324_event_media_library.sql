-- ============================================================
-- ANIMALZ EVENTS - Media Library de eventos
-- Migration: 2026-03-24
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_assets (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id   UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id          UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  asset_type        TEXT NOT NULL CHECK (asset_type IN ('image', 'video')),
  usage_type        TEXT NOT NULL DEFAULT 'gallery' CHECK (usage_type IN ('cover', 'hero', 'gallery', 'thumbnail')),
  provider          TEXT NOT NULL DEFAULT 'cloudinary' CHECK (provider IN ('cloudinary', 'supabase_storage', 's3', 'url')),
  provider_asset_id TEXT,
  url               TEXT NOT NULL,
  secure_url        TEXT,
  thumbnail_url     TEXT,
  width             INTEGER,
  height            INTEGER,
  duration          NUMERIC(10, 2),
  mime_type         TEXT,
  alt_text          TEXT,
  caption           TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.event_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_manage_event_assets" ON public.event_assets;
CREATE POLICY "org_manage_event_assets" ON public.event_assets
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "public_read_active_event_assets" ON public.event_assets;
CREATE POLICY "public_read_active_event_assets" ON public.event_assets
  FOR SELECT USING (
    is_active = TRUE
    AND event_id IN (
      SELECT id
      FROM public.events
      WHERE status IN ('published', 'ongoing', 'finished')
    )
  );

CREATE INDEX IF NOT EXISTS idx_event_assets_event_sort ON public.event_assets(event_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_event_assets_org_event ON public.event_assets(organization_id, event_id);
CREATE INDEX IF NOT EXISTS idx_event_assets_usage_active ON public.event_assets(event_id, usage_type, is_active);

DROP TRIGGER IF EXISTS event_assets_updated_at ON public.event_assets;
CREATE TRIGGER event_assets_updated_at
  BEFORE UPDATE ON public.event_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
