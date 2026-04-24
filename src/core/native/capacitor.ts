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

// Geolocation: use native GPS if available, else browser
export async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
  if (isNative()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Geolocation } = await import('@capacitor/geolocation' as any)
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
      return { lat: pos.coords.latitude, lng: pos.coords.longitude }
    } catch {
      return null
    }
  }
  // Fallback to browser geolocation
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
