-- ============================================================
-- ANIMALZ EVENTS - Staff + Gates + Command Center foundation
-- Migration: 2026-03-23
-- Base operacional para equipe, portarias e visao central
-- ============================================================

ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS gate_id UUID REFERENCES public.gates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS shift_label TEXT,
  ADD COLUMN IF NOT EXISTS shift_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shift_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linked_device_id TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;

ALTER TABLE public.gates
  ADD COLUMN IF NOT EXISTS gate_type TEXT NOT NULL DEFAULT 'mixed',
  ADD COLUMN IF NOT EXISTS throughput_per_hour INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS operational_status TEXT NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS supervisor_staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT;

DO $$
BEGIN
  ALTER TABLE public.gates
    ADD CONSTRAINT gates_gate_type_check
    CHECK (gate_type IN ('entry', 'exit', 'mixed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.gates
    ADD CONSTRAINT gates_operational_status_check
    CHECK (operational_status IN ('ready', 'attention', 'paused', 'offline'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS gate_id UUID REFERENCES public.gates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_staff_members_event_gate
  ON public.staff_members(event_id, gate_id);

CREATE INDEX IF NOT EXISTS idx_gates_event_status
  ON public.gates(event_id, operational_status, is_active);

CREATE INDEX IF NOT EXISTS idx_time_entries_staff_event
  ON public.time_entries(staff_id, event_id, recorded_at DESC);
