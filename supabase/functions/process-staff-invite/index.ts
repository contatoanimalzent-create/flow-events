import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InviteToken {
  id: string
  token: string
  event_id: string
  role_type: string
  team_id: string | null
  shift_id: string | null
  custom_fields: unknown
  expires_at: string | null
  is_active: boolean
  used_count: number
  max_uses: number | null
  created_by: string | null
}

interface ApplicationBody {
  token: string
  full_name: string
  email: string
  phone?: string
  document_number?: string
  birth_date?: string
  bio?: string
  experience?: string
  t_shirt_size?: string
  custom_field_answers?: Record<string, unknown>
  terms_accepted: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addCors(init: ResponseInit = {}): ResponseInit {
  return { ...init, headers: { ...corsHeaders, ...((init.headers as Record<string, string>) ?? {}) } }
}

/** Validate a token record is usable right now */
function validateTokenRecord(
  token: InviteToken,
): { valid: true } | { valid: false; error: string; status: number } {
  if (!token.is_active) {
    return { valid: false, error: 'This invite link is no longer active', status: 410 }
  }
  if (token.expires_at && new Date(token.expires_at) < new Date()) {
    return { valid: false, error: 'This invite link has expired', status: 410 }
  }
  if (token.max_uses !== null && token.used_count >= token.max_uses) {
    return { valid: false, error: 'This invite link has reached its maximum number of uses', status: 410 }
  }
  return { valid: true }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createSupabaseAdminClient()

  // =========================================================================
  // GET — retrieve invite info
  // =========================================================================
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const tokenParam = url.searchParams.get('token')

    if (!tokenParam) {
      return Response.json({ error: 'token query parameter is required' }, addCors({ status: 400 }))
    }

    try {
      const { data: inviteLink, error } = await supabase
        .from('staff_invite_links')
        .select(
          'id, token, event_id, role_type, team_id, shift_id, custom_fields, expires_at, is_active, used_count, max_uses, created_by',
        )
        .eq('token', tokenParam)
        .single()

      if (error || !inviteLink) {
        return Response.json({ error: 'Invite link not found' }, addCors({ status: 404 }))
      }

      const check = validateTokenRecord(inviteLink as InviteToken)
      if (!check.valid) {
        return Response.json({ error: check.error }, addCors({ status: check.status }))
      }

      // Fetch related event info
      const { data: event } = await supabase
        .from('events')
        .select('id, name, starts_at, ends_at, venue_name, cover_image_url')
        .eq('id', inviteLink.event_id)
        .single()

      // Fetch team info
      let team: { id: string; name: string } | null = null
      if (inviteLink.team_id) {
        const { data } = await supabase
          .from('staff_teams')
          .select('id, name')
          .eq('id', inviteLink.team_id)
          .single()
        team = data ?? null
      }

      // Fetch shift info
      let shift: { id: string; name: string; starts_at: string; ends_at: string } | null = null
      if (inviteLink.shift_id) {
        const { data } = await supabase
          .from('staff_shifts')
          .select('id, name, starts_at, ends_at')
          .eq('id', inviteLink.shift_id)
          .single()
        shift = data ?? null
      }

      return Response.json(
        {
          invite: {
            token: inviteLink.token,
            role_type: inviteLink.role_type,
            custom_fields: inviteLink.custom_fields ?? [],
            expires_at: inviteLink.expires_at,
            is_active: inviteLink.is_active,
            spots_remaining:
              inviteLink.max_uses !== null ? Math.max(0, inviteLink.max_uses - inviteLink.used_count) : null,
          },
          event: event
            ? {
                id: event.id,
                name: event.name,
                starts_at: event.starts_at,
                ends_at: event.ends_at,
                venue_name: event.venue_name,
                cover_image_url: event.cover_image_url,
              }
            : null,
          team,
          shift,
        },
        addCors({ status: 200 }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[process-staff-invite] GET error:', err)
      return Response.json({ error: message }, addCors({ status: 500 }))
    }
  }

  // =========================================================================
  // POST — submit application
  // =========================================================================
  if (req.method === 'POST') {
    let body: ApplicationBody
    try {
      body = await req.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, addCors({ status: 400 }))
    }

    // -----------------------------------------------------------------------
    // Validate required fields
    // -----------------------------------------------------------------------
    const missing: string[] = []
    if (!body.token) missing.push('token')
    if (!body.full_name) missing.push('full_name')
    if (!body.email) missing.push('email')
    if (body.terms_accepted !== true) missing.push('terms_accepted (must be true)')

    if (missing.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        addCors({ status: 400 }),
      )
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return Response.json({ error: 'Invalid email format' }, addCors({ status: 400 }))
    }

    try {
      // ---------------------------------------------------------------------
      // 1. Fetch and validate invite link
      // ---------------------------------------------------------------------
      const { data: inviteLink, error: inviteError } = await supabase
        .from('staff_invite_links')
        .select(
          'id, token, event_id, role_type, team_id, shift_id, custom_fields, expires_at, is_active, used_count, max_uses, created_by',
        )
        .eq('token', body.token)
        .single()

      if (inviteError || !inviteLink) {
        return Response.json({ error: 'Invite link not found' }, addCors({ status: 404 }))
      }

      const check = validateTokenRecord(inviteLink as InviteToken)
      if (!check.valid) {
        return Response.json({ error: check.error }, addCors({ status: check.status }))
      }

      // ---------------------------------------------------------------------
      // 2. Check for duplicate application (same email + event)
      // ---------------------------------------------------------------------
      const { data: existingApp } = await supabase
        .from('staff_applications')
        .select('id, status')
        .eq('event_id', inviteLink.event_id)
        .eq('email', body.email.toLowerCase().trim())
        .maybeSingle()

      if (existingApp) {
        return Response.json(
          {
            error: 'An application with this email already exists for this event',
            existing_status: existingApp.status,
          },
          addCors({ status: 409 }),
        )
      }

      // ---------------------------------------------------------------------
      // 3. Create staff_applications record
      // ---------------------------------------------------------------------
      const now = new Date().toISOString()

      const { data: application, error: appError } = await supabase
        .from('staff_applications')
        .insert({
          event_id: inviteLink.event_id,
          invite_link_id: inviteLink.id,
          role_type: inviteLink.role_type,
          team_id: inviteLink.team_id ?? null,
          shift_id: inviteLink.shift_id ?? null,
          full_name: body.full_name.trim(),
          email: body.email.toLowerCase().trim(),
          phone: body.phone ?? null,
          document_number: body.document_number ?? null,
          birth_date: body.birth_date ?? null,
          bio: body.bio ?? null,
          experience: body.experience ?? null,
          t_shirt_size: body.t_shirt_size ?? null,
          custom_field_answers: body.custom_field_answers ?? null,
          terms_accepted: true,
          terms_accepted_at: now,
          status: 'pending',
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single()

      if (appError || !application) {
        console.error('[process-staff-invite] application insert error:', appError)
        return Response.json(
          { error: 'Failed to create application', details: appError?.message },
          addCors({ status: 500 }),
        )
      }

      // ---------------------------------------------------------------------
      // 4. Increment used_count on staff_invite_links
      // ---------------------------------------------------------------------
      const { error: incrError } = await supabase
        .from('staff_invite_links')
        .update({
          used_count: (inviteLink.used_count ?? 0) + 1,
          updated_at: now,
        })
        .eq('id', inviteLink.id)

      if (incrError) {
        console.warn('[process-staff-invite] failed to increment used_count:', incrError.message)
      }

      // ---------------------------------------------------------------------
      // 5. Queue internal notification
      // ---------------------------------------------------------------------
      const { error: notifError } = await supabase.from('notification_jobs').insert({
        type: 'staff_applied',
        event_id: inviteLink.event_id,
        payload: {
          application_id: application.id,
          applicant_name: body.full_name.trim(),
          applicant_email: body.email.toLowerCase().trim(),
          role_type: inviteLink.role_type,
          team_id: inviteLink.team_id ?? null,
          shift_id: inviteLink.shift_id ?? null,
          invite_link_id: inviteLink.id,
        },
        status: 'pending',
        created_at: now,
      })

      if (notifError) {
        console.warn('[process-staff-invite] notification_jobs insert failed:', notifError.message)
      }

      // ---------------------------------------------------------------------
      // 6. Success
      // ---------------------------------------------------------------------
      return Response.json(
        {
          success: true,
          application_id: application.id,
          message: 'Your application has been received. The event team will review it shortly.',
        },
        addCors({ status: 201 }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      console.error('[process-staff-invite] POST error:', err)
      return Response.json({ error: message }, addCors({ status: 500 }))
    }
  }

  // =========================================================================
  // Other methods
  // =========================================================================
  return Response.json({ error: 'Method not allowed' }, addCors({ status: 405 }))
})
