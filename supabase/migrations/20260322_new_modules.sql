-- ============================================================
-- ANIMALZ EVENTS, Novos módulos: cost_entries e campaigns
-- Migration: 2026-03-22
-- Executar no Supabase SQL Editor
-- ============================================================

-- ── Tabela: cost_entries (Financeiro) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.cost_entries (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id   UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id          UUID REFERENCES public.events(id) ON DELETE SET NULL,
  description       TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'other',
  amount            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date          DATE,
  paid_date         DATE,
  status            TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned', 'committed', 'paid', 'cancelled')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_cost_entries" ON public.cost_entries
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cost_entries_updated_at
  BEFORE UPDATE ON public.cost_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Tabela: campaigns (Comunicação) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id   UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id          UUID REFERENCES public.events(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT 'email'
                    CHECK (type IN ('email', 'whatsapp', 'sms', 'push')),
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  subject           TEXT,
  body              TEXT NOT NULL,
  audience_filter   JSONB,
  send_at           TIMESTAMPTZ,
  sent_count        INTEGER DEFAULT 0,
  opened_count      INTEGER DEFAULT 0,
  clicked_count     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access_campaigns" ON public.campaigns
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Adicionar colunas faltantes em tabelas existentes ─────────

-- products: adicionar colunas de categoria, custo, alerta de estoque
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS stock_alert_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- suppliers: adicionar colunas faltantes
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms TEXT,
  ADD COLUMN IF NOT EXISTS doc_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- staff_members: garantir que colunas existam
ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS credential_issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- organizations: adicionar campos de white-label
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#d4ff00',
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS custom_email_from TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_country TEXT DEFAULT 'Brasil';

-- ── Adicionar mais categorias de produtos (enum comment) ─────
-- Valores válidos: 'bar', 'food', 'merch', 'vip', 'service', 'other'

-- ── Índices para performance ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cost_entries_org ON public.cost_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_cost_entries_event ON public.cost_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON public.campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_event ON public.campaigns(event_id);
