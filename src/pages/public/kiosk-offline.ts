/**
 * Offline queue para o Kiosk — usa IndexedDB pra não perder batidas se Wi-Fi cair.
 *
 * Fluxo:
 * 1. Tentativa online → se sucesso, salva no DB direto
 * 2. Se falhar (network/timeout), enqueue local
 * 3. Service worker / interval tenta reenviar a cada 30s
 * 4. Quando volta online, drena a fila
 */

const DB_NAME = 'pulse_kiosk_offline'
const STORE = 'pending_checkins'
const DB_VERSION = 1

export interface OfflineCheckin {
  client_id: string
  event_slug: string
  staff_member_id: string
  type: 'checkin' | 'checkout'
  photo_base64: string | null
  latitude: number | null
  longitude: number | null
  role_at_checkin: string | null
  captured_at: string
  attempts: number
  last_error: string | null
  staff_name: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'client_id' })
        store.createIndex('by_event', 'event_slug')
        store.createIndex('by_attempts', 'attempts')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function enqueueCheckin(item: Omit<OfflineCheckin, 'attempts' | 'last_error'>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ ...item, attempts: 0, last_error: null })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listPending(): Promise<OfflineCheckin[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as OfflineCheckin[])
    req.onerror = () => reject(req.error)
  })
}

export async function removePending(clientId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(clientId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updatePending(clientId: string, updates: Partial<OfflineCheckin>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const getReq = store.get(clientId)
    getReq.onsuccess = () => {
      const existing = getReq.result as OfflineCheckin | undefined
      if (existing) {
        store.put({ ...existing, ...updates })
      }
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function countPending(): Promise<number> {
  const items = await listPending()
  return items.length
}

/**
 * Tenta enviar uma batida pro Supabase. Se falhar, fica na fila.
 */
export async function trySendOne(
  item: OfflineCheckin,
  endpointUrl: string,
  anonKey: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({
        event_slug: item.event_slug,
        staff_member_id: item.staff_member_id,
        type: item.type,
        photo_base64: item.photo_base64,
        latitude: item.latitude,
        longitude: item.longitude,
        role_at_checkin: item.role_at_checkin,
        client_id: item.client_id,
        captured_at: item.captured_at,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: body?.error ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' }
  }
}

/**
 * Drena toda a fila. Chamada periodicamente OU quando volta online.
 * Retorna quantos foram sincronizados.
 */
export async function drainQueue(endpointUrl: string, anonKey: string): Promise<{ synced: number; failed: number }> {
  const pending = await listPending()
  let synced = 0
  let failed = 0
  for (const item of pending) {
    const result = await trySendOne(item, endpointUrl, anonKey)
    if (result.ok) {
      await removePending(item.client_id)
      synced++
    } else {
      await updatePending(item.client_id, { attempts: item.attempts + 1, last_error: result.error })
      failed++
    }
  }
  return { synced, failed }
}
