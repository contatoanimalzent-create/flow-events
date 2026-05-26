-- Pulse / Flow Events
-- Fecha vazamento publico de tokens de convite de staff.

ALTER TABLE public.staff_invite_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_invite_links_public_read" ON public.staff_invite_links;
DROP POLICY IF EXISTS "staff_invite_links_public_select" ON public.staff_invite_links;
DROP POLICY IF EXISTS "staff_invite_links_select" ON public.staff_invite_links;
DROP POLICY IF EXISTS "staff_invite_links_open" ON public.staff_invite_links;
DROP POLICY IF EXISTS "staff_invite_links_org_read" ON public.staff_invite_links;

CREATE POLICY "staff_invite_links_org_read"
  ON public.staff_invite_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = staff_invite_links.organization_id
        AND om.is_active = true
    )
  );

DROP POLICY IF EXISTS "staff_invite_links_org_write" ON public.staff_invite_links;

CREATE POLICY "staff_invite_links_org_write"
  ON public.staff_invite_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = staff_invite_links.organization_id
        AND om.is_active = true
        AND om.role IN ('super_admin', 'org_admin', 'org_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = staff_invite_links.organization_id
        AND om.is_active = true
        AND om.role IN ('super_admin', 'org_admin', 'org_manager')
    )
  );
