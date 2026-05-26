import { createClient } from 'npm:@supabase/supabase-js@2'
import { getCorsHeaders } from './cors.ts'

export interface AuthSuccess {
  ok: true
  userId: string
  email: string | null
  jwt: string
}

export interface AuthFailure {
  ok: false
  response: Response
}

/**
 * Validates a Supabase JWT from the Authorization: Bearer <jwt> header.
 * Returns either { ok: true, userId, email } or { ok: false, response }.
 */
export async function requireAuth(req: Request): Promise<AuthSuccess | AuthFailure> {
  const cors = getCorsHeaders(req)
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!jwt) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }),
    }
  }

  const client = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )
  const { data: { user }, error } = await client.auth.getUser(jwt)

  if (error || !user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }),
    }
  }

  return { ok: true, userId: user.id, email: user.email ?? null, jwt }
}

/**
 * Validates a shared cron secret from the x-cron-secret header.
 * Mandatory — fails closed if env var is missing.
 */
export function requireCronSecret(req: Request): AuthFailure | { ok: true } {
  const cors = getCorsHeaders(req)
  const expected = Deno.env.get('CRON_SECRET') ?? ''

  if (!expected) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'CRON_SECRET not configured on server' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }),
    }
  }

  const incoming = req.headers.get('x-cron-secret') ?? ''
  if (incoming !== expected) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }),
    }
  }

  return { ok: true }
}
