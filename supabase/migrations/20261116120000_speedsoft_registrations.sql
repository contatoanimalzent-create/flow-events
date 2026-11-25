-- Campeonato Nacional de Speedsoft · Capital Strike (19 e 20/12/2026)
-- Pré-cadastro de times pelo Pulse: entra como 'pendente'; na aprovação, cada atleta
-- recebe um ingresso nominal gratuito com QR (pedido 'paid'/'free', igual à Nos Confins da Terra).

-- ── Evento ───────────────────────────────────────────────────────────────────
insert into public.events (
  organization_id, name, slug, subtitle, short_description, category,
  starts_at, ends_at, timezone, venue_name, venue_address,
  status, published_at, is_free, registration_mode, is_private, settings
)
select
  '00000000-0000-0000-0000-000000000001',
  'Campeonato Nacional de Speedsoft · Capital Strike',
  'capital-strike-speedsoft-2026',
  '19 e 20 de dezembro de 2026 · Brasília/DF',
  'Rounds de 90 segundos, decisões no VAR e até R$ 100 mil em premiação.',
  'esportivo',
  '2026-12-19 11:00:00+00', '2026-12-20 23:00:00+00', 'America/Sao_Paulo',
  'Local a confirmar', '{"city":"Brasília","state":"DF","country":"BR"}'::jsonb,
  'published', now(), true, 'registration', false,
  jsonb_build_object(
    'external_source', 'speedsoft',
    'horario_provisorio', true,
    'site', 'https://capitalstrikespeedsoft.com',
    'email_theme', jsonb_build_object('bg_color', '#0a0b08', 'text_color', '#ecebe4', 'accent_color', '#F9AE00')
  )
where not exists (
  select 1 from public.events
  where organization_id = '00000000-0000-0000-0000-000000000001' and slug = 'capital-strike-speedsoft-2026'
);

-- ── Tipos de ingresso (um por modalidade) e lote gratuito oculto ─────────────
with ev as (
  select id, organization_id from public.events
  where organization_id = '00000000-0000-0000-0000-000000000001' and slug = 'capital-strike-speedsoft-2026'
), tipos(nome, pos) as (
  values ('Team 5x5', 0), ('Speed CQB', 1), ('Team 3x3 Pistola', 2), ('Pistola Individual', 3)
)
insert into public.ticket_types (event_id, organization_id, name, description, is_nominal, is_transferable, max_per_order, position, is_active, currency)
select ev.id, ev.organization_id, t.nome, 'Atleta · ' || t.nome, true, false, 7, t.pos, true, 'brl'
from ev, tipos t
where not exists (select 1 from public.ticket_types x where x.event_id = ev.id and x.name = t.nome);

insert into public.ticket_batches (ticket_type_id, event_id, name, price, quantity, sold_count, reserved_count, is_active, is_visible, position, max_per_order)
select tt.id, tt.event_id, 'Inscrição aprovada', 0, 1000, 0, 0, true, false, 0, 7
from public.ticket_types tt
join public.events e on e.id = tt.event_id and e.slug = 'capital-strike-speedsoft-2026'
where not exists (select 1 from public.ticket_batches b where b.ticket_type_id = tt.id);

-- ── Pré-cadastros (time + jogadores) ─────────────────────────────────────────
create table if not exists public.speedsoft_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  event_id uuid not null references public.events(id),
  modalidade text not null check (modalidade in ('squad_5x5', 'speed_cqb', 'pistola_squad_3x3', 'pistola_individual')),
  squad_nome text,
  logo_url text,
  cidade text,
  uf text,
  responsavel_nome text not null,
  responsavel_email text not null,
  responsavel_telefone text not null,
  responsavel_data_nascimento text,
  jogadores jsonb not null default '[]'::jsonb,
  observacoes text,
  aceite_termos boolean not null default true,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
  order_id uuid references public.orders(id),
  aprovado_em timestamptz,
  source_site text,
  legacy_id uuid unique,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists speedsoft_registrations_event_status_idx on public.speedsoft_registrations (event_id, status);
create index if not exists speedsoft_registrations_ip_idx on public.speedsoft_registrations (ip_hash, created_at);

alter table public.speedsoft_registrations enable row level security;

drop policy if exists speedsoft_registrations_org_all on public.speedsoft_registrations;
create policy speedsoft_registrations_org_all on public.speedsoft_registrations
  for all using ((organization_id = get_user_org_id()) or is_super_admin())
  with check ((organization_id = get_user_org_id()) or is_super_admin());

drop trigger if exists set_updated_at_speedsoft_registrations on public.speedsoft_registrations;
create trigger set_updated_at_speedsoft_registrations
  before update on public.speedsoft_registrations
  for each row execute function public.trigger_set_updated_at();

-- ── Aprovação: um ingresso nominal com QR por atleta ─────────────────────────
create or replace function public.approve_speedsoft_registration(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
set statement_timeout to '15s'
as $$
declare
  v_reg public.speedsoft_registrations%rowtype;
  v_event public.events%rowtype;
  v_type_name text;
  v_type uuid;
  v_batch public.ticket_batches%rowtype;
  v_order_id uuid;
  v_item_id uuid;
  v_ticket_id uuid;
  v_seq int;
  v_code text;
  v_j jsonb;
  v_cpf text;
  v_n int;
  v_tickets jsonb := '[]'::jsonb;
begin
  select * into v_reg from public.speedsoft_registrations where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'nao_encontrado'); end if;
  if v_reg.status = 'aprovado' then return jsonb_build_object('ok', false, 'error', 'ja_aprovado', 'order_id', v_reg.order_id); end if;
  if v_reg.status = 'recusado' then return jsonb_build_object('ok', false, 'error', 'recusado'); end if;

  select * into v_event from public.events where id = v_reg.event_id;
  v_type_name := case v_reg.modalidade
    when 'squad_5x5' then 'Team 5x5'
    when 'speed_cqb' then 'Speed CQB'
    when 'pistola_squad_3x3' then 'Team 3x3 Pistola'
    when 'pistola_individual' then 'Pistola Individual'
  end;
  select id into v_type from public.ticket_types where event_id = v_event.id and name = v_type_name and is_active limit 1;
  select * into v_batch from public.ticket_batches where event_id = v_event.id and ticket_type_id = v_type and is_active order by position, created_at limit 1 for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'lote_indisponivel'); end if;

  v_n := jsonb_array_length(v_reg.jogadores);
  if v_n = 0 then return jsonb_build_object('ok', false, 'error', 'sem_jogadores'); end if;
  if coalesce(v_batch.quantity, 0) < coalesce(v_batch.sold_count, 0) + v_n then
    return jsonb_build_object('ok', false, 'error', 'esgotado');
  end if;

  insert into public.orders (
    event_id, organization_id, buyer_name, buyer_email, buyer_phone, buyer_cpf,
    subtotal, discount_amount, fee_amount, customer_fee_amount, absorbed_fee_amount, total_amount,
    status, payment_method, source_channel, paid_at, confirmed_at, expires_at, metadata
  ) values (
    v_event.id, v_event.organization_id, v_reg.responsavel_nome, lower(v_reg.responsavel_email),
    regexp_replace(v_reg.responsavel_telefone, '\D', '', 'g'), null,
    0, 0, 0, 0, 0, 0,
    'paid', 'free', coalesce(v_reg.source_site, 'speedsoft'), now(), now(), null,
    jsonb_build_object('external_source', 'speedsoft', 'speedsoft_registration_id', v_reg.id,
                       'modalidade', v_reg.modalidade, 'squad_nome', v_reg.squad_nome)
  ) returning id into v_order_id;

  perform pg_advisory_xact_lock(hashtext('capital_strike_speedsoft_numero'));
  select coalesce(max(nullif(regexp_replace(ticket_number, '\D', '', 'g'), '')::int), 0)
    into v_seq from public.digital_tickets where event_id = v_event.id;

  for v_j in select * from jsonb_array_elements(v_reg.jogadores) loop
    v_seq := v_seq + 1;
    v_code := 'CSSP-' || lpad(v_seq::text, 4, '0');
    v_cpf := regexp_replace(coalesce(v_j->>'cpf', ''), '\D', '', 'g');

    insert into public.order_items (
      order_id, event_id, ticket_type_id, batch_id,
      holder_name, holder_email, holder_cpf, holder_phone,
      unit_price, quantity, subtotal, discount_amount, fee_amount, total_amount, total_price
    ) values (
      v_order_id, v_event.id, v_type, v_batch.id,
      v_j->>'nome', lower(v_j->>'email'), nullif(v_cpf, ''), regexp_replace(coalesce(v_j->>'telefone', ''), '\D', '', 'g'),
      0, 1, 0, 0, 0, 0, 0
    ) returning id into v_item_id;

    insert into public.digital_tickets (
      order_id, order_item_id, ticket_type_id, batch_id, event_id,
      ticket_number, qr_token, status, is_vip,
      holder_name, holder_email, holder_cpf, metadata
    ) values (
      v_order_id, v_item_id, v_type, v_batch.id, v_event.id,
      v_code, gen_random_uuid()::text, 'confirmed', false,
      v_j->>'nome', lower(v_j->>'email'), nullif(v_cpf, ''),
      jsonb_build_object(
        'external_source', 'speedsoft',
        'speedsoft_registration_id', v_reg.id,
        'modalidade', v_reg.modalidade,
        'squad_nome', v_reg.squad_nome,
        'capitao', coalesce((v_j->>'capitao')::boolean, false),
        'holder_phone', v_j->>'telefone'
      )
    ) returning id into v_ticket_id;

    -- o e-mail com QR é o do Speedsoft (Edge Function); o genérico da fila é cancelado
    update public.notification_queue set status = 'cancelled'
    where dedup_key = 'ticket_email_' || v_ticket_id::text and status not in ('sent', 'cancelled');

    v_tickets := v_tickets || jsonb_build_object('ticket_id', v_ticket_id, 'ticket_number', v_code);
  end loop;

  update public.ticket_batches set sold_count = coalesce(sold_count, 0) + v_n where id = v_batch.id;
  update public.events set sold_tickets = coalesce(sold_tickets, 0) + v_n where id = v_event.id;
  update public.speedsoft_registrations set status = 'aprovado', order_id = v_order_id, aprovado_em = now() where id = v_reg.id;

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'tickets', v_tickets);
end;
$$;

revoke all on function public.approve_speedsoft_registration(uuid) from public, anon, authenticated;
grant execute on function public.approve_speedsoft_registration(uuid) to service_role;
