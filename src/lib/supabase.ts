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
      organizations:             { Row: Organization;            Insert: Partial<Organization>;            Update: Partial<Organization> }
      profiles:                  { Row: Profile;                 Insert: Partial<Profile>;                 Update: Partial<Profile> }
      events:                    { Row: Event;                   Insert: Partial<Event>;                   Update: Partial<Event> }
      ticket_types:              { Row: TicketType;              Insert: Partial<TicketType>;              Update: Partial<TicketType> }
      ticket_batches:            { Row: TicketBatch;             Insert: Partial<TicketBatch>;             Update: Partial<TicketBatch> }
      orders:                    { Row: Order;                   Insert: Partial<Order>;                   Update: Partial<Order> }
      order_items:               { Row: OrderItem;               Insert: Partial<OrderItem>;               Update: Partial<OrderItem> }
      digital_tickets:           { Row: DigitalTicket;           Insert: Partial<DigitalTicket>;           Update: Partial<DigitalTicket> }
      payments:                  { Row: Payment;                 Insert: Partial<Payment>;                 Update: Partial<Payment> }
      payment_webhook_events:    { Row: PaymentWebhookEvent;     Insert: Partial<PaymentWebhookEvent>;     Update: Partial<PaymentWebhookEvent> }
      transactional_messages:    { Row: TransactionalMessage;    Insert: Partial<TransactionalMessage>;    Update: Partial<TransactionalMessage> }
      checkins:                  { Row: Checkin;                 Insert: Partial<Checkin>;                 Update: Partial<Checkin> }
      gates:                     { Row: Gate;                    Insert: Partial<Gate>;                    Update: Partial<Gate> }
      staff_members:             { Row: StaffMember;             Insert: Partial<StaffMember>;             Update: Partial<StaffMember> }
      time_entries:              { Row: TimeEntry;               Insert: Partial<TimeEntry>;               Update: Partial<TimeEntry> }
      suppliers:                 { Row: Supplier;                Insert: Partial<Supplier>;                Update: Partial<Supplier> }
      products:                  { Row: Product;                 Insert: Partial<Product>;                 Update: Partial<Product> }
      cost_entries:              { Row: CostEntry;               Insert: Partial<CostEntry>;               Update: Partial<CostEntry> }
      event_payouts:             { Row: EventPayout;             Insert: Partial<EventPayout>;             Update: Partial<EventPayout> }
      financial_forecasts:       { Row: FinancialForecast;       Insert: Partial<FinancialForecast>;       Update: Partial<FinancialForecast> }
      event_financial_closures:  { Row: EventFinancialClosure;   Insert: Partial<EventFinancialClosure>;   Update: Partial<EventFinancialClosure> }
      event_health_snapshots:    { Row: EventHealthSnapshot;     Insert: Partial<EventHealthSnapshot>;     Update: Partial<EventHealthSnapshot> }
      operational_alerts:        { Row: OperationalAlert;        Insert: Partial<OperationalAlert>;        Update: Partial<OperationalAlert> }
      recommendation_logs:       { Row: RecommendationLog;       Insert: Partial<RecommendationLog>;       Update: Partial<RecommendationLog> }
      intelligence_alert_states:  { Row: IntelligenceAlertState;       Insert: Partial<IntelligenceAlertState>;       Update: Partial<IntelligenceAlertState> }
      customers:                  { Row: Customer;                    Insert: Partial<Customer>;                    Update: Partial<Customer> }
      customer_event_profiles:    { Row: CustomerEventProfile;        Insert: Partial<CustomerEventProfile>;        Update: Partial<CustomerEventProfile> }
      audience_segments:          { Row: AudienceSegment;             Insert: Partial<AudienceSegment>;             Update: Partial<AudienceSegment> }
      campaign_drafts:            { Row: CampaignDraft;               Insert: Partial<CampaignDraft>;               Update: Partial<CampaignDraft> }
      campaigns:                  { Row: Campaign;                    Insert: Partial<Campaign>;                    Update: Partial<Campaign> }
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
  cover_url?: string
  stripe_account_id?: string | null
  stripe_account_status?: string
  plan: string
  is_active: boolean
  created_at: string
  updated_at: string
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

export type OrderStatus = 'draft' | 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'chargeback' | 'expired'

export interface Order {
  id: string
  event_id: string
  organization_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string | null
  buyer_cpf?: string | null
  subtotal: number
  discount_amount: number
  fee_amount: number
  total_amount: number
  status: OrderStatus
  payment_method?: string | null
  source_channel?: string | null
  expires_at?: string | null
  paid_at?: string | null
  confirmed_at?: string | null
  cancelled_at?: string | null
  notes?: string | null
  customer_id?: string | null
  stripe_payment_intent?: string | null
  stripe_session_id?: string | null
  pagarme_order_id?: string | null
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  event_id?: string | null
  ticket_type_id: string
  batch_id?: string | null
  holder_name?: string | null
  holder_email?: string | null
  holder_cpf?: string | null
  unit_price: number
  quantity: number
  subtotal: number
  discount_amount: number
  fee_amount: number
  total_amount: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface TicketType {
  id: string
  event_id: string
  organization_id?: string | null
  name: string
  description?: string | null
  benefits?: string[] | null
  sector?: string | null
  color?: string | null
  is_transferable: boolean
  is_nominal: boolean
  max_per_order?: number | null
  is_active: boolean
  currency?: string
  position: number
  created_at: string
  updated_at: string
}

export interface TicketBatch {
  id: string
  ticket_type_id: string
  event_id: string
  name: string
  price: number
  quantity: number
  sold_count: number
  reserved_count: number
  starts_at?: string | null
  ends_at?: string | null
  is_active: boolean
  is_visible: boolean
  max_per_order?: number | null
  auto_open_next: boolean
  position: number
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

export interface Payment {
  id: string
  order_id: string
  organization_id?: string | null
  event_id?: string | null
  provider: string
  payment_intent_id?: string | null
  charge_id?: string | null
  status: PaymentStatus
  amount: number
  currency: string
  metadata?: Record<string, unknown>
  paid_at?: string | null
  failed_at?: string | null
  refunded_at?: string | null
  created_at: string
  updated_at: string
}

export interface PaymentWebhookEvent {
  id: string
  provider: string
  provider_event_id: string
  event_type: string
  order_id?: string | null
  payment_id?: string | null
  payload?: Record<string, unknown>
  processing_status: 'received' | 'processed' | 'ignored' | 'failed'
  processed_at?: string | null
  error_message?: string | null
  created_at: string
}

export interface TransactionalMessage {
  id: string
  order_id?: string | null
  event_id?: string | null
  channel: 'email'
  template_key: string
  provider: string
  provider_message_id?: string | null
  recipient: string
  status: 'queued' | 'sent' | 'failed' | 'skipped'
  metadata?: Record<string, unknown>
  sent_at?: string | null
  created_at: string
}

export type TicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used' | 'transferred' | 'expired'

export interface DigitalTicket {
  id: string
  order_id: string
  order_item_id?: string | null
  ticket_type_id: string
  batch_id?: string | null
  event_id: string
  ticket_number: string
  qr_token: string
  holder_name?: string | null
  holder_email?: string | null
  holder_cpf?: string | null
  status: TicketStatus
  is_vip: boolean
  checked_in_at?: string | null
  checked_out_at?: string | null
  transferred_to_name?: string | null
  transferred_to_email?: string | null
  transfer_requested_at?: string | null
  email_sent_at?: string | null
  created_at: string
  updated_at: string
}

export interface Checkin {
  id: string
  event_id: string
  digital_ticket_id?: string | null
  gate_id?: string | null
  operator_id?: string | null
  device_id?: string | null
  reason_code?: string | null
  was_offline?: boolean
  notes?: string | null
  metadata?: Record<string, unknown>
  result: string
  checked_in_at: string
  is_exit: boolean
}

export interface Gate {
  id: string
  organization_id?: string | null
  event_id: string
  name: string
  description?: string | null
  is_entrance: boolean
  is_exit: boolean
  is_active: boolean
  device_count: number
  status: string
  throughput_target?: number | null
  supervisor_staff_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface StaffMember {
  id: string
  organization_id: string
  event_id?: string | null
  first_name: string
  last_name?: string | null
  email?: string | null
  phone?: string | null
  cpf?: string | null
  role_title?: string | null
  department?: string | null
  area?: string | null
  company?: string | null
  gate_id?: string | null
  permissions?: string[] | Record<string, unknown> | null
  shift_label?: string | null
  shift_starts_at?: string | null
  shift_ends_at?: string | null
  linked_device_id?: string | null
  daily_rate?: number | null
  credential_issued_at?: string | null
  checked_in_at?: string | null
  checked_out_at?: string | null
  notes?: string | null
  is_active?: boolean
  status: string
  qr_token?: string | null
  created_at: string
}

export interface TimeEntry {
  id: string
  staff_id: string
  event_id?: string | null
  gate_id?: string | null
  type: string
  recorded_at: string
  method?: string | null
  is_valid?: boolean
  device_id?: string | null
  notes?: string | null
  metadata?: Record<string, unknown>
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
  description?: string
  category: string
  price: number
  cost_price?: number
  stock_quantity: number
  stock_alert_threshold?: number
  is_active: boolean
  image_url?: string
  created_at: string
}

export interface CostEntry {
  id: string
  organization_id: string
  event_id?: string | null
  description: string
  category: string
  amount: number
  due_date?: string | null
  paid_date?: string | null
  status: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface EventPayout {
  id: string
  organization_id: string
  event_id: string
  gross_sales: number
  refunds_amount: number
  chargeback_amount: number
  platform_fees: number
  retained_amount: number
  payable_amount: number
  event_organizer_net: number
  status: 'draft' | 'scheduled' | 'paid' | 'held' | 'divergent'
  scheduled_at?: string | null
  paid_out_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialForecast {
  id: string
  organization_id: string
  event_id: string
  projected_revenue: number
  projected_cost: number
  projected_margin: number
  projected_margin_percent: number
  risk_status: 'low' | 'medium' | 'high'
  assumptions?: Record<string, unknown> | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface EventFinancialClosure {
  id: string
  organization_id: string
  event_id: string
  status: 'open' | 'in_closure' | 'closed'
  payments_reconciled: boolean
  costs_recorded: boolean
  payouts_reviewed: boolean
  divergences_resolved: boolean
  result_validated: boolean
  closed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface IntelligenceAlertState {
  id: string
  organization_id: string
  event_id?: string | null
  alert_id: string
  status: 'active' | 'acknowledged'
  acknowledged_at?: string | null
  acknowledged_by?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface EventHealthSnapshot {
  id: string
  organization_id: string
  event_id: string
  snapshot_at: string
  sales_health_score?: number | null
  ops_health_score?: number | null
  finance_health_score?: number | null
  audience_health_score?: number | null
  overall_health_score?: number | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type AlertSeverity = 'warning' | 'critical' | 'info'
export type AlertStatus   = 'active' | 'resolved' | 'acknowledged' | 'ignored'

export interface OperationalAlert {
  id: string
  organization_id: string
  event_id?: string | null
  gate_id?: string | null
  staff_member_id?: string | null
  type: string
  category: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description?: string | null
  recommendation_summary?: string | null
  source_context: Record<string, unknown>
  first_detected_at: string
  last_detected_at: string
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

export interface RecommendationLog {
  id: string
  organization_id: string
  event_id?: string | null
  alert_id?: string | null
  recommendation_type: string
  priority: string
  title: string
  description?: string | null
  action_payload: Record<string, unknown>
  status: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  organization_id: string
  full_name: string
  email: string
  phone?: string | null
  document?: string | null
  birth_date?: string | null
  city?: string | null
  state?: string | null
  tags: string[] | Record<string, unknown>[]
  notes?: string | null
  first_order_at?: string | null
  last_order_at?: string | null
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface CustomerEventProfile {
  id: string
  organization_id: string
  customer_id: string
  event_id: string
  orders_count: number
  tickets_count: number
  attended_count: number
  no_show_count: number
  gross_revenue: number
  net_revenue: number
  first_interaction_at?: string | null
  last_interaction_at?: string | null
  created_at: string
  updated_at: string
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type CampaignChannel = 'email' | 'whatsapp' | 'sms' | 'push'

export interface AudienceSegment {
  id: string
  organization_id: string
  name: string
  description?: string | null
  filter_definition: Record<string, unknown>
  audience_count?: number | null
  last_previewed_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface CampaignDraft {
  id: string
  organization_id: string
  segment_id?: string | null
  event_id?: string | null
  name: string
  channel: CampaignChannel
  status: string
  subject?: string | null
  message_body?: string | null
  audience_count?: number | null
  scheduled_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  organization_id: string
  event_id?: string | null
  segment_id?: string | null
  name: string
  channel: CampaignChannel
  status: CampaignStatus
  subject?: string | null
  body: string
  message_body?: string | null
  audience_filter?: Record<string, unknown>
  audience_count?: number
  scheduled_at?: string | null
  started_at?: string | null
  finished_at?: string | null
  sent_count?: number
  delivered_count?: number
  opened_count?: number
  clicked_count?: number
  failed_count?: number
  created_by?: string | null
  created_at: string
  updated_at: string
}
