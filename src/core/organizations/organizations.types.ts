export interface UserOrganization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  plan: string
  userRole: string
  eventCount: number
}
