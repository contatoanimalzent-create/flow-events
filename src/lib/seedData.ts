import { logError } from '@/shared/lib'

export async function seedTestEventIfNeeded() {
  try {
    // Automatic placeholder event seeding is intentionally disabled.
    // Real operations should start from a clean event base.
  } catch (error) {
    logError(error, { scope: 'seed', action: 'seed-test-event' })
  }
}
