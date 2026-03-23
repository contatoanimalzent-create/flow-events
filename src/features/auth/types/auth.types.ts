import type { User } from '@supabase/supabase-js'
import type { Organization, Profile } from '@/lib/supabase'

export interface AuthActionResult {
  error?: string
}

export interface AuthSessionContext {
  user: User | null
  profile: Profile | null
  organization: Organization | null
  loading: boolean
  initialized: boolean
}
