/**
 * Inicializa todos os hooks nativos: push notifications, deep links, app state.
 * Chamado uma vez no boot. Seguro chamar em web (no-op).
 */
import { isNative, setupPushNotifications, setupDeepLinks, setupAppStateListener } from './capacitor'
import { supabase } from '@/lib/supabase'

let cleanupFns: Array<() => void> = []

export async function initNativeBridge() {
  if (!isNative()) return
  // Evita duplicar listeners em hot-reload
  cleanupFns.forEach((fn) => fn())
  cleanupFns = []

  // 1. Push notifications
  const pushCleanup = await setupPushNotifications({
    onToken: async (token) => {
      try {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth?.user) return
        const platform = (window as any).Capacitor?.getPlatform?.() ?? 'unknown'
        await supabase
          .from('push_tokens')
          .upsert(
            {
              user_id: auth.user.id,
              token,
              platform,
              last_active_at: new Date().toISOString(),
            },
            { onConflict: 'token' },
          )
      } catch (err) {
        console.warn('[push-token-save]', err)
      }
    },
    onReceived: (notification) => {
      console.info('[push-received]', notification)
    },
    onTapped: (data) => {
      // Quando usuario toca na notificacao, navega pra rota indicada
      const path = typeof data?.path === 'string' ? data.path : null
      const url = typeof data?.url === 'string' ? data.url : null
      const target = url ?? (path ? `${window.location.origin}${path}` : null)
      if (target) {
        try {
          const parsed = new URL(target)
          window.location.assign(parsed.pathname + parsed.search + parsed.hash)
        } catch {
          // ignora url invalida
        }
      }
    },
  })
  cleanupFns.push(pushCleanup)

  // 2. Deep links (Universal Links iOS + App Links Android + pulse://)
  const deepLinkCleanup = await setupDeepLinks((url) => {
    // Suporta:
    // - https://pulse.animalzgroup.com/e/festa-x → /e/festa-x
    // - pulse://callback?session=xyz → /callback?session=xyz
    // - pulse.animalzgroup.com://... → trata como path direto
    let targetPath = ''
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      targetPath = url.pathname + url.search + url.hash
    } else if (url.protocol === 'pulse:') {
      // pulse://callback => host=callback, pathname='/'
      // pulse://e/slug => host=e, pathname=/slug
      const host = url.host || url.pathname.replace(/^\/+/, '').split('/')[0]
      const rest = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`
      targetPath = `/${host}${rest === '/' ? '' : rest}${url.search}${url.hash}`
    }
    if (targetPath && targetPath !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', targetPath)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  })
  cleanupFns.push(deepLinkCleanup)

  // 3. App state (refresh dados quando volta do background)
  const stateCleanup = await setupAppStateListener(({ isActive }) => {
    if (isActive) {
      // Quando volta do background, dispara evento que React Query pode escutar
      window.dispatchEvent(new CustomEvent('pulse:app-resumed'))
    }
  })
  cleanupFns.push(stateCleanup)
}

export function teardownNativeBridge() {
  cleanupFns.forEach((fn) => fn())
  cleanupFns = []
}
