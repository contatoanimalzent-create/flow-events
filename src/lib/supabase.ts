import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> }
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      digital_tickets: { Row: DigitalTicket; Insert: Partial<DigitalTicket>; Update: Partial<DigitalTicket> }
      checkins: { Row: Checkin; Insert: Partial<Checkin>; Update: Partial<Checkin> }
      staff_members: { Row: StaffMember; Insert: Partial<StaffMember>; Update: Partial<StaffMember> }
      suppliers: { Row: Supplier; Insert: Partial<Supplier>; Update: Partial<Supplier> }
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
    }
  }
}

export interface Organization {
  id: string
  name: string
  slug: string
  document?: string
  email?: string
  phone?: string
  logo_url?: string
  plan: string
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  organization_id?: string
  role: UserRole
  first_name?: string
  last_name?: string
  cpf?: string
  phone?: string
  avatar_url?: string
  must_change_password: boolean
  is_active: boolean
  created_at: string
}

export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'org_manager'
  | 'checkin_operator'
  | 'pdv_operator'
  | 'staff_member'
  | 'supplier'
  | 'attendee'

export type EventStatus = 'draft' | 'review' | 'published' | 'ongoing' | 'finished' | 'archived' | 'cancelled'

export interface Event {
  id: string
  organization_id: string
  name: string
  slug: string
  subtitle?: string
  short_description?: string
  full_description?: string
  category?: string
  starts_at: string
  ends_at?: string
  doors_open_at?: string
  venue_name?: string
  venue_address?: Record<string, string>
  total_capacity?: number
  sold_tickets: number
  checked_in_count: number
  logo_url?: string
  cover_url?: string
  status: EventStatus
  published_at?: string
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'chargeback'

export interface Order {
  id: string
  event_id: string
  organization_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  subtotal: number
  discount_amount: number
  fee_amount: number
  total_amount: number
  status: OrderStatus
  payment_method?: string
  paid_at?: string
  created_at: string
}

export type TicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used' | 'transferred' | 'expired'

export interface DigitalTicket {
  id: string
  order_id: string
  ticket_type_id: string
  event_id: string
  ticket_number: string
  qr_token: string
  holder_name?: string
  holder_email?: string
  status: TicketStatus
  is_vip: boolean
  checked_in_at?: string
  email_sent_at?: string
  created_at: string
}

export interface Checkin {
  id: string
  event_id: string
  digital_ticket_id?: string
  gate_id?: string
  operator_id?: string
  result: string
  checked_in_at: string
  is_exit: boolean
}

export interface StaffMember {
  id: string
  organization_id: string
  event_id?: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  role_title?: string
  area?: string
  status: string
  qr_token?: string
  created_at: string
}

export interface Supplier {
  id: string
  organization_id: string
  event_id?: string
  company_name: string
  contact_name?: string
  email?: string
  phone?: string
  service_type: string
  contract_value?: number
  status: string
  created_at: string
}

export interface Product {
  id: string
  organization_id: string
  event_id?: string
  name: string
  sku?: string
  price: number
  stock_quantity: number
  is_active: boolean
  created_at: string
}
