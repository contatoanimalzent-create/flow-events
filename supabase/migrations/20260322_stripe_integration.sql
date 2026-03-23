-- ============================================================
-- ANIMALZ EVENTS — Stripe Connect integration
-- Migration: 2026-03-22
-- ============================================================

-- organizations: add Stripe Connect account ID
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected'
    CHECK (stripe_account_status IN ('not_connected', 'pending', 'active', 'restricted'));

-- orders: add Stripe session/payment intent tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

-- ticket_types: add currency field
ALTER TABLE public.ticket_types
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'brl';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi ON public.orders(stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_account ON public.organizations(stripe_account_id);

-- Helper function: increment sold_tickets counter
CREATE OR REPLACE FUNCTION public.increment_sold_tickets(p_event_id UUID, p_quantity INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET sold_tickets = sold_tickets + p_quantity
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
