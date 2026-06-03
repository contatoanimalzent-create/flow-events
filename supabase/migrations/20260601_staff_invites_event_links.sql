ALTER TABLE public.staff_invite_links
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role_type text,
  ADD COLUMN IF NOT EXISTS team_id uuid,
  ADD COLUMN IF NOT EXISTS shift_id uuid,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS used_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_uses integer,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_staff_invite_links_event_id
  ON public.staff_invite_links(event_id);
