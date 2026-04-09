const ALLOWED_ORIGINS = [
  'https://flow-events-git-main-juniors-projects-f6805f3a.vercel.app',
  'http://localhost:5173',
]

function getAllowedOrigin(request?: Request): string {
  const origin = request?.headers?.get('Origin') ?? ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

export function getCorsHeaders(req?: Request) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Vary': 'Origin',
  }
}

// Static fallback for existing code that imports corsHeaders directly.
// Uses the production origin as default when no request context is available.
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Vary': 'Origin',
}
