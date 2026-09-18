-- BSB Fight 7: até 3 ingressos por CPF, cada um com QR próprio.
-- O cadastro (bsb_fight_ticket_claims) continua 1 por CPF; o pedido do titular recebe até 3 digital_tickets.

drop function if exists public.claim_bsb_fight_ticket_public(text, text, text, text, text, text, text, boolean, boolean, text, text, jsonb, text);
drop function if exists public.claim_bsb_fight_ticket(text, text, text, text, text, text, text, boolean, boolean, text, text, jsonb);

create or replace function public.claim_bsb_fight_ticket(
  p_event_slug text,
  p_full_name text,
  p_cpf text,
  p_phone text,
  p_email text,
  p_city text,
  p_state text,
  p_consent_terms boolean,
  p_consent_lgpd boolean,
  p_ip_hash text default null,
  p_source text default 'bsbfight-site',
  p_utm jsonb default '{}'::jsonb,
  p_quantity integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_max_per_cpf constant integer := 3;
  v_qty integer := greatest(1, least(v_max_per_cpf, coalesce(p_quantity, 1)));
  v_event public.events%rowtype;
  v_ticket_type_id uuid;
  v_batch public.ticket_batches%rowtype;
  v_order_id uuid;
  v_order_item_id uuid;
  v_first_ticket_id uuid;
  v_existing record;
  v_current integer := 0;
  v_to_issue integer;
  v_already boolean := false;
  v_index integer;
  v_holder text;
  v_ticket_id uuid;
  v_tickets jsonb;
begin
  if coalesce(p_consent_terms, false) is false or coalesce(p_consent_lgpd, false) is false then
    return jsonb_build_object('ok', false, 'error', 'consent_required');
  end if;

  if p_ip_hash is not null and (
    select count(*)
    from public.bsb_fight_ticket_claims
    where ip_hash = p_ip_hash
      and created_at > now() - interval '10 minutes'
  ) >= 12 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  select * into v_event
  from public.events
  where slug = p_event_slug
    and status in ('published', 'ongoing')
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'event_not_found');
  end if;

  select id into v_ticket_type_id
  from public.ticket_types
  where event_id = v_event.id
    and name = 'Retirada gratuita'
    and is_active = true
  order by position asc, created_at asc
  limit 1;

  select * into v_batch
  from public.ticket_batches
  where event_id = v_event.id
    and ticket_type_id = v_ticket_type_id
    and is_active = true
  order by position asc, created_at asc
  limit 1
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'batch_not_found');
  end if;

  select c.id, c.full_name, dt.order_id
    into v_existing
  from public.bsb_fight_ticket_claims c
  join public.digital_tickets dt on dt.id = c.digital_ticket_id
  where c.event_id = v_event.id
    and (c.cpf = p_cpf or lower(c.email) = lower(p_email))
  order by c.created_at asc
  limit 1
  for update of c;

  if found then
    v_already := true;
    v_order_id := v_existing.order_id;
    v_holder := v_existing.full_name;
    select count(*) into v_current from public.digital_tickets where order_id = v_order_id;
  else
    v_holder := p_full_name;
  end if;

  v_to_issue := greatest(0, v_qty - v_current);

  if v_to_issue > 0 and coalesce(v_batch.quantity, 0) < coalesce(v_batch.sold_count, 0) + coalesce(v_batch.reserved_count, 0) + v_to_issue then
    return jsonb_build_object('ok', false, 'error', 'sold_out');
  end if;

  if not v_already then
    insert into public.orders (
      event_id, organization_id, buyer_name, buyer_email, buyer_phone, buyer_cpf,
      subtotal, discount_amount, fee_amount, customer_fee_amount, absorbed_fee_amount, total_amount,
      status, payment_method, source_channel, paid_at, confirmed_at, expires_at, metadata
    )
    values (
      v_event.id, v_event.organization_id, p_full_name, lower(p_email), p_phone, null,
      0, 0, 0, 0, 0, 0,
      'paid', 'free', p_source, now(), now(), null,
      jsonb_build_object('external_source', 'bsbfight_site', 'event_slug', p_event_slug, 'utm', coalesce(p_utm, '{}'::jsonb))
    )
    returning id into v_order_id;
  end if;

  for v_index in (v_current + 1)..(v_current + v_to_issue) loop
    insert into public.order_items (
      order_id, event_id, ticket_type_id, batch_id,
      holder_name, holder_email, holder_cpf, holder_phone,
      unit_price, quantity, subtotal, discount_amount, fee_amount, total_amount, total_price
    )
    values (
      v_order_id, v_event.id, v_ticket_type_id, v_batch.id,
      case when v_index = 1 then v_holder else v_holder || ' · Acompanhante ' || (v_index - 1) end,
      lower(p_email), p_cpf, p_phone,
      0, 1, 0, 0, 0, 0, 0
    )
    returning id into v_order_item_id;

    v_batch.sold_count := coalesce(v_batch.sold_count, 0) + 1;

    insert into public.digital_tickets (
      order_id, order_item_id, ticket_type_id, batch_id, event_id,
      ticket_number, qr_token, status, is_vip,
      holder_name, holder_email, holder_cpf, metadata
    )
    values (
      v_order_id, v_order_item_id, v_ticket_type_id, v_batch.id, v_event.id,
      'BSB7-' || lpad(v_batch.sold_count::text, 5, '0'),
      gen_random_uuid()::text,
      'confirmed',
      false,
      case when v_index = 1 then v_holder else v_holder || ' · Acompanhante ' || (v_index - 1) end,
      lower(p_email),
      p_cpf,
      jsonb_build_object(
        'external_source', 'bsbfight_site',
        'external_registration_id', case when v_index = 1 then v_order_id::text else v_order_id::text || ':' || v_index end,
        'holder_phone', p_phone,
        'holder_city', p_city,
        'holder_state', p_state,
        'holder_cpf', p_cpf,
        'ticket_index', v_index,
        'companion', v_index > 1
      )
    )
    returning id into v_ticket_id;

    if v_index = 1 then
      v_first_ticket_id := v_ticket_id;
    end if;
  end loop;

  if not v_already then
    insert into public.bsb_fight_ticket_claims (
      event_id, digital_ticket_id, full_name, cpf, phone, email, city, state, source, ip_hash, utm
    )
    values (
      v_event.id, v_first_ticket_id, p_full_name, p_cpf, p_phone, lower(p_email), p_city, p_state,
      coalesce(nullif(p_source, ''), 'bsbfight-site'), p_ip_hash, coalesce(p_utm, '{}'::jsonb)
    );
  end if;

  if v_to_issue > 0 then
    update public.ticket_batches set sold_count = v_batch.sold_count where id = v_batch.id;
    update public.events set sold_tickets = coalesce(sold_tickets, 0) + v_to_issue where id = v_event.id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('ticket_number', ticket_number, 'qr_token', qr_token) order by created_at, ticket_number), '[]'::jsonb)
    into v_tickets
  from public.digital_tickets
  where order_id = v_order_id;

  return jsonb_build_object(
    'ok', true,
    'already', v_already,
    'added', v_to_issue,
    'max_per_cpf', v_max_per_cpf,
    'code', v_tickets -> 0 ->> 'ticket_number',
    'ticket_number', v_tickets -> 0 ->> 'ticket_number',
    'qr_token', v_tickets -> 0 ->> 'qr_token',
    'tickets', v_tickets,
    'order_id', v_order_id
  );
exception
  when unique_violation then
    select dt.order_id into v_order_id
    from public.bsb_fight_ticket_claims c
    join public.digital_tickets dt on dt.id = c.digital_ticket_id
    where c.event_id = v_event.id
      and (c.cpf = p_cpf or lower(c.email) = lower(p_email))
    order by c.created_at asc
    limit 1;

    if v_order_id is null then
      return jsonb_build_object('ok', false, 'error', 'internal_error');
    end if;

    select coalesce(jsonb_agg(jsonb_build_object('ticket_number', ticket_number, 'qr_token', qr_token) order by created_at, ticket_number), '[]'::jsonb)
      into v_tickets
    from public.digital_tickets
    where order_id = v_order_id;

    return jsonb_build_object(
      'ok', true,
      'already', true,
      'added', 0,
      'max_per_cpf', v_max_per_cpf,
      'code', v_tickets -> 0 ->> 'ticket_number',
      'ticket_number', v_tickets -> 0 ->> 'ticket_number',
      'qr_token', v_tickets -> 0 ->> 'qr_token',
      'tickets', v_tickets,
      'order_id', v_order_id
    );
end;
$function$;

create or replace function public.claim_bsb_fight_ticket_public(
  p_event_slug text,
  p_full_name text,
  p_cpf text,
  p_phone text,
  p_email text,
  p_city text,
  p_state text,
  p_consent_terms boolean,
  p_consent_lgpd boolean,
  p_ip_hash text default null,
  p_source text default 'bsbfight-site',
  p_utm jsonb default '{}'::jsonb,
  p_api_secret text default null,
  p_quantity integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions', 'pg_temp'
as $function$
declare
  v_api_secret_hash text;
begin
  select value_hash into v_api_secret_hash
  from public.bsb_fight_ticket_api_config
  where key = 'api_secret_sha256'
  limit 1;

  if v_api_secret_hash is null
    or coalesce(p_api_secret, '') = ''
    or encode(extensions.digest(convert_to(p_api_secret, 'utf8'), 'sha256'), 'hex') <> v_api_secret_hash then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  return public.claim_bsb_fight_ticket(
    p_event_slug, p_full_name, p_cpf, p_phone, p_email, p_city, p_state,
    p_consent_terms, p_consent_lgpd, p_ip_hash, p_source, p_utm, p_quantity
  );
end;
$function$;

revoke all on function public.claim_bsb_fight_ticket(text, text, text, text, text, text, text, boolean, boolean, text, text, jsonb, integer) from public, anon, authenticated;
grant execute on function public.claim_bsb_fight_ticket(text, text, text, text, text, text, text, boolean, boolean, text, text, jsonb, integer) to service_role;
revoke all on function public.claim_bsb_fight_ticket_public(text, text, text, text, text, text, text, boolean, boolean, text, text, jsonb, text, integer) from public, authenticated;
grant execute on function public.claim_bsb_fight_ticket_public(text, text, text, text, text, text, text, boolean, boolean, text, text, jsonb, text, integer) to anon, service_role;
