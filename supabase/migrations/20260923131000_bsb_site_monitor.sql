-- Vigilância 24h do site do BSB Fight. Aplicado em produção via MCP em 2026-09-23.
-- site_client_errors: erros de JavaScript que acontecem no navegador de quem usa o site.
-- site_monitor_state/runs: resultado das checagens automáticas (pg_cron + edge function bsb-site-monitor).
-- bsb_site_health(): teste de ponta a ponta da retirada, desfeito no final (não deixa ingresso).

create table if not exists public.site_client_errors (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  host text,
  path text,
  message text,
  source text,
  line int,
  col int,
  stack text,
  user_agent text
);
create index if not exists site_client_errors_created_at_idx on public.site_client_errors (created_at desc);
alter table public.site_client_errors enable row level security;

create table if not exists public.site_monitor_state (
  check_key text primary key,
  ok boolean not null,
  detail text,
  since timestamptz not null default now(),
  last_run timestamptz not null default now(),
  last_alert_at timestamptz
);
alter table public.site_monitor_state enable row level security;

create table if not exists public.site_monitor_runs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ok boolean not null,
  failures jsonb not null default '[]'::jsonb,
  healed jsonb not null default '[]'::jsonb,
  duration_ms int
);
create index if not exists site_monitor_runs_created_at_idx on public.site_monitor_runs (created_at desc);
alter table public.site_monitor_runs enable row level security;

create or replace function public.log_site_client_error(
  p_host text, p_path text, p_message text, p_source text,
  p_line int, p_col int, p_stack text, p_user_agent text
) returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if (select count(*) from public.site_client_errors where created_at > now() - interval '5 minutes') >= 300 then
    return;
  end if;
  insert into public.site_client_errors (host, path, message, source, line, col, stack, user_agent)
  values (left(p_host, 120), left(p_path, 300), left(p_message, 1000), left(p_source, 500),
          p_line, p_col, left(p_stack, 4000), left(p_user_agent, 400));
end;
$$;
revoke all on function public.log_site_client_error(text,text,text,text,int,int,text,text) from public;
grant execute on function public.log_site_client_error(text,text,text,text,int,int,text,text) to anon, service_role;

create or replace function public.bsb_random_valid_cpf() returns text
language plpgsql
as $$
declare
  d int[] := array[]::int[];
  s int; r int; i int;
begin
  for i in 1..9 loop d := d || (floor(random() * 10))::int; end loop;
  s := 0; for i in 1..9 loop s := s + d[i] * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if; d := d || r;
  s := 0; for i in 1..10 loop s := s + d[i] * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if; d := d || r;
  return array_to_string(d, '');
end;
$$;

create or replace function public.bsb_site_health(p_api_secret text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions', 'pg_temp'
as $$
declare
  v_hash text;
  v_event public.events%rowtype;
  v_batch public.ticket_batches%rowtype;
  v_max int;
  v_claim jsonb;
  v_checks jsonb := '{}'::jsonb;
  v_healed jsonb := '[]'::jsonb;
  v_ok boolean := true;
  v_n int;
  v_tag text := substr(md5(random()::text), 1, 10);
begin
  select value_hash into v_hash from public.bsb_fight_ticket_api_config where key = 'api_secret_sha256' limit 1;
  if v_hash is null or coalesce(p_api_secret, '') = ''
     or encode(extensions.digest(convert_to(p_api_secret, 'utf8'), 'sha256'), 'hex') <> v_hash then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select * into v_event from public.events where slug = 'bsb-fight-7' limit 1;
  v_checks := v_checks || jsonb_build_object('evento_publicado', coalesce(v_event.status in ('published', 'ongoing'), false));

  select b.* into v_batch from public.ticket_batches b
  join public.ticket_types t on t.id = b.ticket_type_id and t.name = 'Retirada gratuita' and t.is_active
  where b.event_id = v_event.id and b.is_active order by b.position, b.created_at limit 1;
  v_checks := v_checks || jsonb_build_object(
    'lote_ativo', v_batch.id is not null,
    'lote_com_vaga', coalesce(v_batch.quantity - v_batch.sold_count - coalesce(v_batch.reserved_count, 0) > 50, false)
  );

  -- Contador do número do ingresso nunca pode ficar abaixo do maior número já emitido.
  select max(substring(ticket_number from '^BSB7-(\d+)$')::int) into v_max
  from public.digital_tickets where ticket_number ~ '^BSB7-\d+$';
  if v_batch.id is not null and coalesce(v_batch.sold_count, 0) < coalesce(v_max, 0) then
    update public.ticket_batches set sold_count = v_max where id = v_batch.id and sold_count < v_max;
    v_healed := v_healed || jsonb_build_object('contador_ingresso', jsonb_build_object('de', v_batch.sold_count, 'para', v_max));
  end if;

  -- Retirada real de ponta a ponta (titular + acompanhante), desfeita no final.
  begin
    v_claim := public.claim_bsb_fight_ticket(
      'bsb-fight-7', 'Monitor Saude ' || v_tag, public.bsb_random_valid_cpf(), '(61) 99999-0000',
      'monitor-' || v_tag || '@bsbfight.invalid', 'Brasilia', 'DF', true, true, null, 'monitor',
      '{"origem":"monitor"}'::jsonb, 2, array['Acompanhante Monitor ' || v_tag]
    );
    raise exception using errcode = 'P0099', message = v_claim::text;
  exception
    when sqlstate 'P0099' then
      v_claim := sqlerrm::jsonb;
    when others then
      v_claim := jsonb_build_object('ok', false, 'error', sqlstate || ' ' || sqlerrm);
  end;
  v_checks := v_checks || jsonb_build_object(
    'retirada_ponta_a_ponta', coalesce((v_claim ->> 'ok')::boolean, false)
      and jsonb_array_length(coalesce(v_claim -> 'tickets', '[]'::jsonb)) = 2
  );
  if not coalesce((v_claim ->> 'ok')::boolean, false) then
    v_checks := v_checks || jsonb_build_object('retirada_erro', v_claim ->> 'error');
  end if;

  select count(*) into v_n from public.transactional_messages
  where template_key = 'bsb-fight-7-ticket' and status = 'failed' and created_at > now() - interval '30 minutes';
  v_checks := v_checks || jsonb_build_object('emails_com_falha_30min', v_n);

  select count(*) into v_n from public.site_client_errors where created_at > now() - interval '15 minutes';
  v_checks := v_checks || jsonb_build_object('erros_navegador_15min', v_n);

  v_ok := (v_checks ->> 'evento_publicado')::boolean
      and (v_checks ->> 'lote_ativo')::boolean
      and (v_checks ->> 'lote_com_vaga')::boolean
      and (v_checks ->> 'retirada_ponta_a_ponta')::boolean
      and (v_checks ->> 'emails_com_falha_30min')::int < 3;

  return jsonb_build_object('ok', v_ok, 'checks', v_checks, 'healed', v_healed, 'at', now());
end;
$$;
revoke all on function public.bsb_site_health(text) from public;
grant execute on function public.bsb_site_health(text) to anon, service_role;
