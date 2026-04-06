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
  global: {
    // Timeout de 10s para todas as requisições (vs 30s padrão)
    headers: {
      'X-Request-Timeout': '10',
    },
  },
  db: {
    // Pool de conexão mais agressivo
    schema: 'public',
  },
})

export type Database = {
  public: {
    Tables: {
      subscription_plans:        { Row: SubscriptionPlan;        Insert: Partial<SubscriptionPlan>;        Update: Partial<SubscriptionPlan> }
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
      audience_segments:                { Row: AudienceSegment;                Insert: Partial<AudienceSegment>;                Update: Partial<AudienceSegment> }
      campaign_drafts:                  { Row: CampaignDraft;                  Insert: Partial<CampaignDraft>;                  Update: Partial<CampaignDraft> }
      campaign_runs:                    { Row: CampaignRun;                    Insert: Partial<CampaignRun>;                    Update: Partial<CampaignRun> }
      campaign_run_recipients:          { Row: CampaignRunRecipient;           Insert: Partial<CampaignRunRecipient>;           Update: Partial<CampaignRunRecipient> }
      audience_resolution_jobs:         { Row: AudienceResolutionJob;          Insert: Partial<AudienceResolutionJob>;          Update: Partial<AudienceResolutionJob> }
      campaigns:                        { Row: Campaign;                       Insert: Partial<Campaign>;                       Update: Partial<Campaign> }
      audit_logs:                       { Row: AuditLog;                       Insert: Partial<AuditLog>;                       Update: Partial<AuditLog> }
      organization_members:             { Row: OrganizationMember;             Insert: Partial<OrganizationMember>;             Update: Partial<OrganizationMember> }
      incidents:                        { Row: Incident;                       Insert: Partial<Incident>;                       Update: Partial<Incident> }
      internal_notifications:           { Row: InternalNotification;           Insert: Partial<InternalNotification>;           Update: Partial<InternalNotification> }
      growth_leads:                     { Row: GrowthLead;                     Insert: Partial<GrowthLead>;                     Update: Partial<GrowthLead> }
      referral_links:                   { Row: ReferralLink;                   Insert: Partial<ReferralLink>;                   Update: Partial<ReferralLink> }
      referral_conversions:             { Row: ReferralConversion;             Insert: Partial<ReferralConversion>;             Update: Partial<ReferralConversion> }
      executive_dashboard_snapshots:    { Row: ExecutiveDashboardSnapshot;     Insert: Partial<ExecutiveDashboardSnapshot>;     Update: Partial<ExecutiveDashboardSnapshot> }
      data_integrity_checks:            { Row: DataIntegrityCheck;             Insert: Partial<DataIntegrityCheck>;             Update: Partial<DataIntegrityCheck> }
      data_integrity_issues:            { Row: DataIntegrityIssue;             Insert: Partial<DataIntegrityIssue>;             Update: Partial<DataIntegrityIssue> }
      intelligence_action_executions:   { Row: IntelligenceActionExecution;    Insert: Partial<IntelligenceActionExecution>;    Update: Partial<IntelligenceActionExecution> }
      campaign_automation_rules:        { Row: CampaignAutomationRule;         Insert: Partial<CampaignAutomationRule>;         Update: Partial<CampaignAutomationRule> }
      campaign_automation_executions:   { Row: CampaignAutomationExecution;    Insert: Partial<CampaignAutomationExecution>;    Update: Partial<CampaignAutomationExecution> }
      event_assets:                     { Row: EventAsset;                     Insert: Partial<EventAsset>;                     Update: Partial<EventAsset> }
      capital_strike_registrations:     { Row: CapitalStrikeRegistration;      Insert: Partial<CapitalStrikeRegistration>;      Update: Partial<CapitalStrikeRegistration> }
      sponsors:                         { Row: Sponsor;                        Insert: Partial<Sponsor>;                        Update: Partial<Sponsor> }
      // ── Operational schema (20260403) ──────────────────────────────────────
      event_editions:                   { Row: EventEdition;                   Insert: Partial<EventEdition>;                   Update: Partial<EventEdition> }
      venues:                           { Row: Venue;                          Insert: Partial<Venue>;                          Update: Partial<Venue> }
      venue_maps:                       { Row: VenueMap;                       Insert: Partial<VenueMap>;                       Update: Partial<VenueMap> }
      venue_zones:                      { Row: VenueZone;                      Insert: Partial<VenueZone>;                      Update: Partial<VenueZone> }
      venue_items:                      { Row: VenueItem;                      Insert: Partial<VenueItem>;                      Update: Partial<VenueItem> }
      stages:                           { Row: Stage;                          Insert: Partial<Stage>;                          Update: Partial<Stage> }
      stands:                           { Row: Stand;                          Insert: Partial<Stand>;                          Update: Partial<Stand> }
      checkpoints:                      { Row: Checkpoint;                     Insert: Partial<Checkpoint>;                     Update: Partial<Checkpoint> }
      teams:                            { Row: Team;                           Insert: Partial<Team>;                           Update: Partial<Team> }
      shifts:                           { Row: Shift;                          Insert: Partial<Shift>;                          Update: Partial<Shift> }
      staff_invite_links:               { Row: StaffInviteLink;                Insert: Partial<StaffInviteLink>;                Update: Partial<StaffInviteLink> }
      staff_applications:               { Row: StaffApplication;               Insert: Partial<StaffApplication>;               Update: Partial<StaffApplication> }
      credentials:                      { Row: Credential;                     Insert: Partial<Credential>;                     Update: Partial<Credential> }
      credential_access_rules:          { Row: CredentialAccessRule;           Insert: Partial<CredentialAccessRule>;           Update: Partial<CredentialAccessRule> }
      qr_tokens:                        { Row: QrToken;                        Insert: Partial<QrToken>;                        Update: Partial<QrToken> }
      checkin_logs:                     { Row: CheckinLog;                     Insert: Partial<CheckinLog>;                     Update: Partial<CheckinLog> }
      event_geofences:                  { Row: EventGeofence;                  Insert: Partial<EventGeofence>;                  Update: Partial<EventGeofence> }
      timeclock_sessions:               { Row: TimeclockSession;               Insert: Partial<TimeclockSession>;               Update: Partial<TimeclockSession> }
      timeclock_entries:                { Row: TimeclockEntry;                 Insert: Partial<TimeclockEntry>;                 Update: Partial<TimeclockEntry> }
      timeclock_exceptions:             { Row: TimeclockException;             Insert: Partial<TimeclockException>;             Update: Partial<TimeclockException> }
      email_templates:                  { Row: EmailTemplate;                  Insert: Partial<EmailTemplate>;                  Update: Partial<EmailTemplate> }
      whatsapp_templates:               { Row: WhatsappTemplate;               Insert: Partial<WhatsappTemplate>;               Update: Partial<WhatsappTemplate> }
      communications_log:               { Row: CommunicationsLog;              Insert: Partial<CommunicationsLog>;              Update: Partial<CommunicationsLog> }
      notification_jobs:                { Row: NotificationJob;                Insert: Partial<NotificationJob>;                Update: Partial<NotificationJob> }
      documents:                        { Row: Document;                       Insert: Partial<Document>;                       Update: Partial<Document> }
      financial_entries:                { Row: FinancialEntry;                 Insert: Partial<FinancialEntry>;                 Update: Partial<FinancialEntry> }
      vendors:                          { Row: Vendor;                         Insert: Partial<Vendor>;                         Update: Partial<Vendor> }
      person_event_profiles:            { Row: PersonEventProfile;             Insert: Partial<PersonEventProfile>;             Update: Partial<PersonEventProfile> }
    }
  }
}

export interface SubscriptionPlan {
  id: string
  slug: string
  name: string
  description?: string | null
  price: number
  billing_cycle: 'monthly' | 'annual' | 'custom'
  features: string[]
  limits: Record<string, number | null>
  is_active: boolean
  created_at: string
  updated_at: string
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
  subscription_plan_id?: string | null
  feature_flags?: Record<string, boolean> | null
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
  fee_type: 'fixed' | 'percentage'
  fee_value: number
  absorb_fee: boolean
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
  platform_fee_amount: number
  customer_fee_amount: number
  absorbed_fee_amount: number
  fee_type: 'fixed' | 'percentage'
  fee_value: number
  absorb_fee: boolean
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

export type CampaignRunStatus     = 'pending' | 'resolving' | 'sending' | 'completed' | 'failed' | 'cancelled'
export type CampaignRecipientStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped'
export type AudienceJobStatus     = 'pending' | 'running' | 'completed' | 'failed'

export interface CampaignRun {
  id: string
  organization_id: string
  campaign_draft_id?: string | null
  segment_id?: string | null
  event_id?: string | null
  name: string
  channel: CampaignChannel
  status: CampaignRunStatus
  audience_count: number
  sent_count: number
  delivered_count: number
  failed_count: number
  skipped_count: number
  started_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface CampaignRunRecipient {
  id: string
  organization_id: string
  campaign_run_id: string
  customer_id?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  status: CampaignRecipientStatus
  error_message?: string | null
  provider_message_id?: string | null
  payload_snapshot?: Record<string, unknown> | null
  sent_at?: string | null
  delivered_at?: string | null
  failed_at?: string | null
  created_at: string
  updated_at: string
}

export interface AudienceResolutionJob {
  id: string
  organization_id: string
  segment_id?: string | null
  campaign_run_id?: string | null
  status: AudienceJobStatus
  input_snapshot: Record<string, unknown>
  result_count: number
  started_at?: string | null
  completed_at?: string | null
  error_message?: string | null
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

// ─── Audit & Access ──────────────────────────────────────────────────────────

export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'
export type AuditSource   = 'app' | 'api' | 'edge_function' | 'webhook' | 'system' | 'migration'

export interface AuditLog {
  id: string
  organization_id?: string | null
  user_id?: string | null
  event_id?: string | null
  action: string
  entity_type?: string | null
  entity_id?: string | null
  old_data?: Record<string, unknown> | null
  new_data?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  device_id?: string | null
  session_id?: string | null
  metadata?: Record<string, unknown>
  severity?: AuditSeverity
  source?: AuditSource
  created_at: string
}

export type OrgMemberRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'finance'
  | 'marketing'
  | 'checkin_operator'
  | 'pdv_operator'
  | 'staff'
  | 'viewer'

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgMemberRole
  invited_by?: string | null
  invited_at?: string | null
  accepted_at?: string | null
  is_active?: boolean
  permissions?: Record<string, unknown>
  event_permissions?: Record<string, unknown>
  created_at: string
  updated_at?: string | null
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus   = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Incident {
  id: string
  organization_id?: string | null
  event_id: string
  reported_by?: string | null
  assigned_to?: string | null
  title: string
  description?: string | null
  severity?: IncidentSeverity
  status?: IncidentStatus
  location?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

// ─── Internal Notifications ───────────────────────────────────────────────────

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface InternalNotification {
  id: string
  organization_id: string
  user_id: string
  type: string
  severity: NotificationSeverity
  title: string
  body?: string | null
  action_url?: string | null
  reference_type?: string | null
  reference_id?: string | null
  is_read: boolean
  read_at?: string | null
  created_at: string
}

export type GrowthLeadStatus = 'new' | 'qualified' | 'contacted' | 'converted' | 'archived'

export interface GrowthLead {
  id: string
  organization_id?: string | null
  event_id?: string | null
  email: string
  full_name?: string | null
  source: string
  status: GrowthLeadStatus
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ReferralBenefitType = 'discount' | 'cashback' | 'future_credit' | 'vip_upgrade'

export interface ReferralLink {
  id: string
  organization_id: string
  event_id: string
  referrer_id: string
  code: string
  benefit_type: ReferralBenefitType
  benefit_value: number
  benefit_description?: string | null
  conversion_count: number
  revenue_generated: number
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ReferralConversion {
  id: string
  organization_id: string
  referral_link_id: string
  referrer_id: string
  event_id: string
  order_id: string
  buyer_email?: string | null
  conversion: boolean
  gross_amount: number
  reward_status: 'pending' | 'granted' | 'rejected' | 'expired'
  metadata: Record<string, unknown>
  created_at: string
}

// ─── Executive Dashboard Snapshots ──────────────────────────────────────────

export type SnapshotPeriod = 'daily' | 'weekly' | 'monthly'

export interface ExecutiveDashboardSnapshot {
  id: string
  organization_id: string
  snapshot_period: SnapshotPeriod
  snapshot_date: string              // ISO date string
  total_events: number
  active_events: number
  upcoming_events: number
  gross_revenue: number
  net_revenue: number
  platform_fees: number
  tickets_sold: number
  tickets_checked_in: number
  total_customers: number
  new_customers: number
  returning_customers: number
  campaigns_sent: number
  emails_delivered: number
  campaign_open_rate?: number | null  // 0.0000–1.0000
  revenue_by_event: Record<string, unknown>[]
  revenue_by_day: Record<string, unknown>[]
  top_ticket_types: Record<string, unknown>[]
  metadata: Record<string, unknown>
  generated_by: string
  created_at: string
}

// ─── Data Integrity ──────────────────────────────────────────────────────────

export type IntegrityCheckType =
  | 'orphan_detection'
  | 'count_mismatch'
  | 'stale_data'
  | 'financial_reconciliation'
  | 'duplicate_detection'
  | 'custom'

export type IntegrityCheckResult = 'pass' | 'fail' | 'error' | 'skip'
export type IntegrityCheckScope  = 'organization' | 'event' | 'global'
export type IntegrityIssueStatus = 'open' | 'acknowledged' | 'resolved' | 'ignored'
export type IntegrityIssueSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface DataIntegrityCheck {
  id: string
  organization_id?: string | null
  check_name: string
  check_type: IntegrityCheckType
  description?: string | null
  scope: IntegrityCheckScope
  is_active: boolean
  schedule_cron?: string | null
  last_run_at?: string | null
  next_run_at?: string | null
  last_result?: IntegrityCheckResult | null
  last_issue_count: number
  created_at: string
  updated_at: string
}

export interface DataIntegrityIssue {
  id: string
  organization_id: string
  check_id?: string | null
  event_id?: string | null
  severity: IntegrityIssueSeverity
  title: string
  description?: string | null
  entity_type?: string | null
  entity_id?: string | null
  details: Record<string, unknown>
  status: IntegrityIssueStatus
  acknowledged_by?: string | null
  acknowledged_at?: string | null
  resolved_by?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

// ─── Intelligence Action Executions ─────────────────────────────────────────

export type IntelligenceActionResult = 'success' | 'failed' | 'partial' | 'pending' | 'reverted'

export interface IntelligenceActionExecution {
  id: string
  organization_id: string
  event_id?: string | null
  recommendation_id?: string | null
  alert_id?: string | null
  action_type: string
  action_payload: Record<string, unknown>
  executed_by: string
  executed_at: string
  result_status: IntelligenceActionResult
  result_payload: Record<string, unknown>
  reverted_at?: string | null
  reverted_by?: string | null
  notes?: string | null
  created_at: string
}

// ─── Campaign Automation ─────────────────────────────────────────────────────

export type AutomationTriggerType =
  | 'ticket_purchased'
  | 'order_confirmed'
  | 'checkin_completed'
  | 'event_created'
  | 'days_before_event'
  | 'days_after_event'
  | 'segment_joined'
  | 'order_abandoned'
  | 'refund_issued'
  | 'custom'

export type AutomationExecutionStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'cancelled'

export interface CampaignAutomationRule {
  id: string
  organization_id: string
  name: string
  description?: string | null
  is_active: boolean
  trigger_type: AutomationTriggerType
  trigger_conditions: Record<string, unknown>
  campaign_draft_id?: string | null
  audience_segment_id?: string | null
  delay_minutes: number
  max_executions?: number | null
  total_executions: number
  last_triggered_at?: string | null
  created_at: string
  updated_at: string
}

export interface CampaignAutomationExecution {
  id: string
  organization_id: string
  rule_id: string
  campaign_run_id?: string | null
  trigger_type: string
  trigger_entity_type?: string | null
  trigger_entity_id?: string | null
  trigger_payload: Record<string, unknown>
  scheduled_for: string
  executed_at?: string | null
  status: AutomationExecutionStatus
  error_message?: string | null
  created_at: string
}

// ─── Event Media Assets ───────────────────────────────────────────────────────

export type AssetType     = 'image' | 'video'
export type AssetUsage    = 'cover' | 'hero' | 'gallery' | 'thumbnail'
export type AssetProvider = 'cloudinary' | 'supabase_storage' | 's3' | 'url'

export interface EventAsset {
  id: string
  organization_id: string
  event_id: string
  asset_type: AssetType
  usage_type: AssetUsage
  provider: AssetProvider
  provider_asset_id?: string | null
  url: string
  secure_url?: string | null
  thumbnail_url?: string | null
  width?: number | null
  height?: number | null
  duration?: number | null
  mime_type?: string | null
  alt_text?: string | null
  caption?: string | null
  sort_order: number
  is_active: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
}

// ─── Inscricoes (External Registrations — Capital Strike) ────────────────────

export type CapitalStrikeArmy = 'coalizao' | 'alianca'

export interface CapitalStrikeRegistration {
  id: string
  full_name: string
  cpf: string
  email: string
  phone: string
  mother_name: string
  address: string
  squad?: string | null
  army: CapitalStrikeArmy
  created_at: string
  updated_at?: string | null
}

// ─── Sponsors ────────────────────────────────────────────────────────────────

export type SponsorTier = 'title' | 'gold' | 'silver' | 'bronze' | 'media' | 'support'
export type SponsorStatus = 'prospect' | 'negotiating' | 'confirmed' | 'active' | 'completed' | 'cancelled'

export interface Sponsor {
  id: string
  organization_id: string
  event_id?: string | null
  company_name: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  tier: SponsorTier
  status: SponsorStatus
  investment_value?: number | null
  deliverables?: string | null
  logo_url?: string | null
  website_url?: string | null
  notes?: string | null
  contract_signed_at?: string | null
  created_at: string
  updated_at: string
}

// ─── Venues ───────────────────────────────────────────────────────────────────

export interface Venue {
  id: string
  organization_id: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  capacity?: number | null
  floor_plan_url?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface VenueMap {
  id: string
  venue_id: string
  name: string
  floor?: number | null
  map_image_url?: string | null
  width_px?: number | null
  height_px?: number | null
  scale_meters_per_px?: number | null
  created_at: string
  updated_at: string
}

export type VenueZoneType = 'general' | 'vip' | 'backstage' | 'staff' | 'restricted' | 'food' | 'parking'

export interface VenueZone {
  id: string
  venue_map_id: string
  name: string
  zone_type: VenueZoneType
  color?: string | null
  polygon_coords?: Array<{ x: number; y: number }> | null
  capacity?: number | null
  created_at: string
  updated_at: string
}

export type VenueItemKind = 'stage' | 'stand' | 'checkpoint'

export interface VenueItem {
  id: string
  venue_map_id: string
  zone_id?: string | null
  kind: VenueItemKind
  name: string
  x_px?: number | null
  y_px?: number | null
  width_px?: number | null
  height_px?: number | null
  rotation_deg?: number | null
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Stage {
  id: string
  venue_map_id: string
  zone_id?: string | null
  name: string
  x_px?: number | null
  y_px?: number | null
  width_px?: number | null
  height_px?: number | null
  created_at: string
  updated_at: string
}

export interface Stand {
  id: string
  venue_map_id: string
  zone_id?: string | null
  name: string
  number?: string | null
  x_px?: number | null
  y_px?: number | null
  width_px?: number | null
  height_px?: number | null
  created_at: string
  updated_at: string
}

export interface Checkpoint {
  id: string
  venue_map_id: string
  zone_id?: string | null
  name: string
  x_px?: number | null
  y_px?: number | null
  created_at: string
  updated_at: string
}

// ─── Event Editions ───────────────────────────────────────────────────────────

export interface EventEdition {
  id: string
  event_id: string
  organization_id: string
  name: string
  edition_number?: number | null
  starts_at: string
  ends_at: string
  venue_id?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Event Geofences ──────────────────────────────────────────────────────────

export interface EventGeofence {
  id: string
  event_id: string
  organization_id: string
  name: string
  fence_type: 'circle' | 'polygon'
  center_lat?: number | null
  center_lng?: number | null
  radius_meters?: number | null
  polygon_coords?: Array<{ lat: number; lng: number }> | null
  buffer_seconds: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string
  event_id: string
  organization_id: string
  name: string
  description?: string | null
  color?: string | null
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  event_id: string
  organization_id: string
  name: string
  starts_at: string
  ends_at: string
  description?: string | null
  max_staff?: number | null
  created_at: string
  updated_at: string
}

export type StaffInviteSendStatus = 'pending' | 'sent' | 'failed' | 'expired' | 'skipped'

export interface StaffInviteLink {
  id: string
  event_id: string
  organization_id: string
  token: string
  role_type: string
  team_id?: string | null
  shift_id?: string | null
  custom_fields?: unknown
  expires_at?: string | null
  is_active: boolean
  used_count: number
  max_uses?: number | null
  created_by?: string | null
  created_at: string
  updated_at: string
  // batch-email columns (migration 20260405)
  send_status: StaffInviteSendStatus
  target_email?: string | null
  target_name?: string | null
  sent_at?: string | null
  send_error?: string | null
}

export type StaffApplicationStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted'

export interface StaffApplication {
  id: string
  event_id: string
  organization_id?: string | null
  invite_link_id?: string | null
  role_type: string
  team_id?: string | null
  shift_id?: string | null
  full_name: string
  email: string
  phone?: string | null
  document_number?: string | null
  birth_date?: string | null
  bio?: string | null
  experience?: string | null
  t_shirt_size?: string | null
  custom_field_answers?: Record<string, unknown> | null
  terms_accepted: boolean
  terms_accepted_at?: string | null
  status: StaffApplicationStatus
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at: string
}

// ─── Credentials ──────────────────────────────────────────────────────────────

export type CredentialFormat = 'badge' | 'qrcode'
export type CredentialState = 'active' | 'revoked'

export interface Credential {
  id: string
  staff_id: string
  type: string
  format: CredentialFormat
  status: CredentialState
  issued_at: string
  expires_at?: string | null
  created_at?: string
}

export interface CredentialAccessRule {
  id: string
  credential_id: string
  zone_id: string
  valid_from?: string | null
  valid_until?: string | null
  created_at: string
}

export interface QrToken {
  id: string
  token: string
  ref_type: string
  ref_id: string
  event_id: string
  is_active: boolean
  expires_at?: string | null
  used_count: number
  max_uses?: number | null
  created_at: string
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export type CheckinLogAction = 'entry' | 'exit' | 'denied'
export type CheckinLogResult = 'valid' | 'duplicated' | 'invalid'

export interface CheckinLog {
  id: string
  event_id: string
  qr_token?: string | null
  credential_id?: string | null
  action: CheckinLogAction
  denial_reason?: string | null
  gate_id?: string | null
  checkpoint_id?: string | null
  operator_id?: string | null
  device_id?: string | null
  lat?: number | null
  lng?: number | null
  accuracy?: number | null
  occurred_at: string
  metadata?: Record<string, unknown> | null
}

// ─── Timeclock ────────────────────────────────────────────────────────────────

export type TimeclockPunchType = 'start' | 'pause' | 'resume' | 'end'
export type TimeclockSessionStatus = 'open' | 'closed' | 'exception'

export interface TimeclockSession {
  id: string
  organization_id: string
  event_id: string
  staff_member_id: string
  opened_at: string
  closed_at?: string | null
  total_minutes?: number | null
  status: TimeclockSessionStatus
  created_at: string
  updated_at: string
}

export interface TimeclockEntry {
  id: string
  session_id: string
  punch_type: TimeclockPunchType
  recorded_at: string
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  device_id?: string | null
  note?: string | null
}

export type TimeclockExceptionStatus = 'pending' | 'approved' | 'rejected'

export interface TimeclockException {
  id: string
  session_id: string
  staff_member_id: string
  event_id: string
  organization_id: string
  reason: string
  requested_minutes?: number | null
  status: TimeclockExceptionStatus
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at: string
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: string
  organization_id: string
  slug: string
  name: string
  subject: string
  html_body: string
  text_body?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── WhatsApp Templates ───────────────────────────────────────────────────────

export interface WhatsappTemplate {
  id: string
  organization_id?: string | null
  slug: string
  name: string
  body_template: string
  meta_template_name?: string | null
  meta_content_sid?: string | null
  language_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Communications Log ───────────────────────────────────────────────────────

export type CommunicationsChannel = 'email' | 'whatsapp'
export type CommunicationsStatus  = 'pending' | 'sent' | 'failed'

export interface CommunicationsLog {
  id: string
  organization_id: string
  template_key: string
  channel: CommunicationsChannel
  recipient: string
  status: CommunicationsStatus
  created_at: string
  // extended columns (migration 20260405_extend_communications_log)
  notification_job_id?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  subject?: string | null
  body_preview?: string | null
  message_sid?: string | null
  error_message?: string | null
  metadata?: Record<string, unknown> | null
  sent_at?: string | null
}

// ─── Notification Jobs ────────────────────────────────────────────────────────

export type NotificationJobStatus = 'pending' | 'running' | 'completed' | 'failed'
export type NotificationJobChannel = 'email' | 'whatsapp'

export interface NotificationJob {
  id: string
  organization_id: string
  template_key: string
  audience_segment_id?: string | null
  scheduled_at: string
  status: NotificationJobStatus
  created_at: string
  // extended columns (migration 20260405_extend_notification_jobs)
  channel: NotificationJobChannel
  event_id?: string | null
  variables: Record<string, string | number | boolean>
  started_at?: string | null
  completed_at?: string | null
  error_message?: string | null
  processed_count: number
  failed_count: number
}

// ─── Documents ────────────────────────────────────────────────────────────────

export type DocumentStatus = 'draft' | 'published' | 'archived'

export interface Document {
  id: string
  organization_id: string
  event_id?: string | null
  title: string
  slug?: string | null
  content?: string | null
  status: DocumentStatus
  created_by?: string | null
  created_at: string
  updated_at: string
}

// ─── Financial Entries ────────────────────────────────────────────────────────

export type FinancialEntryKind = 'revenue' | 'cost'

export interface FinancialEntry {
  id: string
  organization_id: string
  event_id?: string | null
  kind: FinancialEntryKind
  category?: string | null
  description?: string | null
  amount: number
  currency: string
  reference_date: string
  reference_id?: string | null
  reference_type?: string | null
  is_reconciled: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export type VendorStatus = 'active' | 'inactive' | 'pending'

export interface Vendor {
  id: string
  organization_id: string
  name: string
  category?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  document?: string | null
  status: VendorStatus
  notes?: string | null
  created_at: string
  updated_at: string
}

// ─── Person Event Profiles ────────────────────────────────────────────────────

export type PersonEventRole = 'attendee' | 'staff' | 'vendor'

export interface PersonEventProfile {
  id: string
  organization_id: string
  event_id: string
  profile_id?: string | null
  email: string
  full_name?: string | null
  phone?: string | null
  role: PersonEventRole
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
