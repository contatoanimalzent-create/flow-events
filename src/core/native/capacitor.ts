/**
 * Capacitor native bridge utilities.
 * Safe to import in web, all calls are no-ops when not in native context.
 */

export const isNative = () => {
  try {
    return (window as any).Capacitor?.isNativePlatform() === true
  } catch {
    return false
  }
}

export const getPlatform = (): 'android' | 'ios' | 'web' => {
  try {
    return (window as any).Capacitor?.getPlatform() ?? 'web'
  } catch {
    return 'web'
  }
}

// Camera: use native camera if available, else HTML5
export async function takePicture(): Promise<string | null> {
  if (!isNative()) return null
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    })
    return photo.dataUrl ?? null
  } catch {
    return null
  }
}

// ── Permissões ──────────────────────────────────────────────────────────────
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable'

export interface PermissionsState {
  camera: PermissionStatus
  location: PermissionStatus
  notifications: PermissionStatus
}

// Pede permissão de localização (GPS)
export async function requestLocationPermission(): Promise<PermissionStatus> {
  if (isNative()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Geolocation } = await import('@capacitor/geolocation' as any)
      const check = await Geolocation.checkPermissions()
      if (check.location === 'granted') return 'granted'
      const req = await Geolocation.requestPermissions({ permissions: ['location'] })
      return (req.location as PermissionStatus) ?? 'denied'
    } catch {
      return 'unavailable'
    }
  }
  // Web: a permissão é pedida ao chamar getCurrentPosition
  if (!navigator.geolocation) return 'unavailable'
  return new Promise<PermissionStatus>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve('granted'),
      (err) => resolve(err.code === err.PERMISSION_DENIED ? 'denied' : 'prompt'),
      { timeout: 10000 },
    )
  })
}

// Pede permissão de câmera
export async function requestCameraPermission(): Promise<PermissionStatus> {
  if (isNative()) {
    try {
      const { Camera } = await import('@capacitor/camera')
      const check = await Camera.checkPermissions()
      if (check.camera === 'granted') return 'granted'
      const req = await Camera.requestPermissions({ permissions: ['camera'] })
      return (req.camera as PermissionStatus) ?? 'denied'
    } catch {
      return 'unavailable'
    }
  }
  // Web: testa via getUserMedia
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach((t) => t.stop())
    return 'granted'
  } catch {
    return 'denied'
  }
}

// Pede permissão de notificações (push)
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (isNative()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { PushNotifications } = await import('@capacitor/push-notifications' as any)
      const check = await PushNotifications.checkPermissions()
      if (check.receive === 'granted') {
        await PushNotifications.register()
        return 'granted'
      }
      const req = await PushNotifications.requestPermissions()
      if (req.receive === 'granted') {
        await PushNotifications.register()
        return 'granted'
      }
      return (req.receive as PermissionStatus) ?? 'denied'
    } catch {
      return 'unavailable'
    }
  }
  // Web: Notification API
  if (typeof Notification === 'undefined') return 'unavailable'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'prompt'
}

// Pede TODAS as permissões necessárias para o staff (câmera + localização + notificações)
export async function requestStaffPermissions(): Promise<PermissionsState> {
  const [location, notifications, camera] = await Promise.all([
    requestLocationPermission(),
    requestNotificationPermission(),
    requestCameraPermission(),
  ])
  return { camera, location, notifications }
}

// Apenas consulta o status atual sem pedir
export async function checkStaffPermissions(): Promise<PermissionsState> {
  const result: PermissionsState = { camera: 'prompt', location: 'prompt', notifications: 'prompt' }
  if (isNative()) {
    try {
      const { Camera } = await import('@capacitor/camera')
      result.camera = ((await Camera.checkPermissions()).camera as PermissionStatus) ?? 'prompt'
    } catch { result.camera = 'unavailable' }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Geolocation } = await import('@capacitor/geolocation' as any)
      result.location = ((await Geolocation.checkPermissions()).location as PermissionStatus) ?? 'prompt'
    } catch { result.location = 'unavailable' }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { PushNotifications } = await import('@capacitor/push-notifications' as any)
      result.notifications = ((await PushNotifications.checkPermissions()).receive as PermissionStatus) ?? 'prompt'
    } catch { result.notifications = 'unavailable' }
    return result
  }
  // Web best-effort
  if (typeof Notification !== 'undefined') {
    result.notifications = Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt'
  }
  return result
}

// Geolocation: use native GPS if available, else browser
export async function getCurrentPosition(): Promise<{ lat: number; lng: number; accuracy?: number } | null> {
  if (isNative()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Geolocation } = await import('@capacitor/geolocation' as any)
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
    } catch {
      return null
    }
  }
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

// Background watch position (continuous GPS while app open)
export async function watchPosition(
  onUpdate: (pos: { lat: number; lng: number; accuracy?: number; battery?: number }) => void,
): Promise<() => void> {
  if (isNative()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Geolocation } = await import('@capacitor/geolocation' as any)
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
        (position: any) => {
          if (position?.coords) {
            onUpdate({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            })
          }
        },
      )
      return () => {
        Geolocation.clearWatch({ id: watchId }).catch(() => {})
      }
    } catch {
      return () => {}
    }
  }
  if (!navigator.geolocation) return () => {}
  const watchId = navigator.geolocation.watchPosition(
    (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
  )
  return () => navigator.geolocation.clearWatch(watchId)
}

// Push notifications: registra device e retorna FCM/APNs token
export interface PushHandlers {
  onToken?: (token: string) => void
  onReceived?: (notification: { title?: string; body?: string; data?: Record<string, unknown> }) => void
  onTapped?: (data: Record<string, unknown>) => void
}

export async function setupPushNotifications(handlers: PushHandlers = {}): Promise<() => void> {
  if (!isNative()) return () => {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PushNotifications } = await import('@capacitor/push-notifications' as any)
    const permStatus = await PushNotifications.checkPermissions()
    let perm = permStatus.receive
    if (perm === 'prompt') {
      const req = await PushNotifications.requestPermissions()
      perm = req.receive
    }
    if (perm !== 'granted') return () => {}

    await PushNotifications.register()

    const subs = [
      await PushNotifications.addListener('registration', (token: { value: string }) => {
        handlers.onToken?.(token.value)
      }),
      await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        handlers.onReceived?.({
          title: notification?.title,
          body: notification?.body,
          data: notification?.data ?? {},
        })
      }),
      await PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        handlers.onTapped?.(action?.notification?.data ?? {})
      }),
    ]

    return () => {
      subs.forEach((sub) => sub?.remove?.())
    }
  } catch {
    return () => {}
  }
}

// Deep links: ouvinte de Universal Links / App Links / pulse://
export async function setupDeepLinks(onUrl: (url: URL) => void): Promise<() => void> {
  if (!isNative()) return () => {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { App } = await import('@capacitor/app' as any)
    const sub = await App.addListener('appUrlOpen', (event: { url: string }) => {
      try {
        const url = new URL(event.url)
        onUrl(url)
      } catch {
        // url inválida — ignora
      }
    })
    return () => sub?.remove?.()
  } catch {
    return () => {}
  }
}

// App state (background/foreground)
export async function setupAppStateListener(
  onChange: (state: { isActive: boolean }) => void,
): Promise<() => void> {
  if (!isNative()) return () => {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { App } = await import('@capacitor/app' as any)
    const sub = await App.addListener('appStateChange', onChange)
    return () => sub?.remove?.()
  } catch {
    return () => {}
  }
}

// Network status
export async function getNetworkStatus(): Promise<{ connected: boolean; type?: string }> {
  if (!isNative()) {
    return { connected: navigator.onLine, type: 'web' }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Network } = await import('@capacitor/network' as any)
    const status = await Network.getStatus()
    return { connected: status.connected, type: status.connectionType }
  } catch {
    return { connected: true }
  }
}
