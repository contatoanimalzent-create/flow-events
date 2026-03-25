-- ============================================================
-- ANIMALZ EVENTS - Unicidade ativa de cover e hero
-- Migration: 2026-03-25
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_assets_one_active_cover
  ON public.event_assets(event_id)
  WHERE usage_type = 'cover' AND is_active = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_assets_one_active_hero
  ON public.event_assets(event_id)
  WHERE usage_type = 'hero' AND is_active = TRUE;
