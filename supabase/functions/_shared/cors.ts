const ALLOWED_ORIGIN_PATTERNS: Array<RegExp | string> = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pulse.animalzgroup.com',
  'https://flow-events-ruby.vercel.app',
  'https://flow-events-git-main-juniors-projects-f6805f3a.vercel.app',
  /^https:\/\/flow-events-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/.*\.animalzgroup\.com$/,
  // Capacitor native (iOS WKWebView e Android WebView)
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  'ionic://localhost',
]

const PRODUCTION_FALLBACK = 'https://pulse.animalzgroup.com'

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGIN_PATTERNS.some((pat) =>
    typeof pat === 'string' ? pat === origin : pat.test(origin),
  )
}

export function getCorsHeaders(req?: Request) {
  const origin = req?.headers?.get('Origin') ?? ''
  const allowed = isAllowedOrigin(origin) ? origin : PRODUCTION_FALLBACK
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-cron-secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  }
}

// Backwards-compatible static export — usa origin wildcard pra apps nativos.
// Prefira getCorsHeaders(req) em codigo novo para validar origin.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-cron-secret',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Vary': 'Origin',
}
