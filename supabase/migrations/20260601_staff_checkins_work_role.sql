ALTER TABLE public.staff_checkins
  ADD COLUMN IF NOT EXISTS work_role text;

CREATE INDEX IF NOT EXISTS idx_staff_checkins_event_work_role_created
  ON public.staff_checkins(event_id, work_role, created_at DESC);
