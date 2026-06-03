alter table public.digital_tickets
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_digital_tickets_metadata_gin
  on public.digital_tickets using gin (metadata);
