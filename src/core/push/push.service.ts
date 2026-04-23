/**
 * Web Push subscription service.
 * Call initPush() after user logs in to register the service worker
 * and subscribe to push notifications.
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const arr = Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
  return arr.buffer as ArrayBuffer
}

export async function initPush(userId: string, eventId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] Browser does not support push notifications')
    return false
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[push] VITE_VAPID_PUBLIC_KEY not set — push disabled')
    return false
  }

  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    await navigator.serviceWorker.ready

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.info('[push] Permission denied')
      return false
    }

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    // Save subscription to Supabase
    const { supabase } = await import('@/lib/supabase')
    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      event_id: eventId,
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,event_id' })

    console.info('[push] Subscribed successfully')
    return true
  } catch (err) {
    console.error('[push] Init error', err)
    return false
  }
}

export function handleServiceWorkerMessages(callback: (url: string) => void) {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE') {
      callback(event.data.url)
    }
  })
}
