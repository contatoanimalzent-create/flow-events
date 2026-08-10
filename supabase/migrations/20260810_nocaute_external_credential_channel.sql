-- Canal idempotente para credenciais originadas no Seminarios Nocaute.
create unique index if not exists digital_tickets_external_registration_uidx
  on public.digital_tickets (
    (metadata->>'external_source'),
    (metadata->>'external_registration_id')
  )
  where metadata ? 'external_source'
    and metadata ? 'external_registration_id';

do $$
declare
  v_org uuid;
  v_event uuid;
  v_type uuid;
begin
  select id into strict v_org
  from public.organizations
  where slug = 'animalz-events';

  select id into v_event from public.events
  where slug = 'seminarios-nocaute-fabricio-werdum'
  limit 1;

  if v_event is null then
    insert into public.events (
    organization_id, name, slug, short_description, category, starts_at,
    timezone, venue_name, venue_address, status, published_at, is_free,
    registration_mode, settings
  ) values (
    v_org,
    'Seminarios Nocaute - Fabricio Werdum',
    'seminarios-nocaute-fabricio-werdum',
    'Edicao 002 dos Seminarios Nocaute.',
    'Esportes de combate',
    '2026-08-29T10:00:00-03:00',
    'America/Sao_Paulo',
    'Cais do Lago',
    '{"district":"Setor de Clubes Sul","city":"Brasilia","state":"DF"}'::jsonb,
    'published',
    now(),
    true,
    'registration',
    '{"external_source":"seminarios_nocaute","email_theme":{"accent_color":"#D7FF3F","bg_color":"#050505","text_color":"#FFFFFF"}}'::jsonb
    ) returning id into v_event;
  else
    update public.events set
      starts_at = '2026-08-29T10:00:00-03:00',
      venue_name = 'Cais do Lago',
      venue_address = '{"district":"Setor de Clubes Sul","city":"Brasilia","state":"DF"}'::jsonb,
      settings = settings || '{"external_source":"seminarios_nocaute","email_theme":{"accent_color":"#D7FF3F","bg_color":"#050505","text_color":"#FFFFFF"}}'::jsonb
    where id = v_event;
  end if;

  select id into v_type
  from public.ticket_types
  where event_id = v_event and name = 'Participante'
  limit 1;

  if v_type is null then
    insert into public.ticket_types (
      event_id, organization_id, name, description, is_nominal,
      is_transferable, max_per_order, is_active
    ) values (
      v_event, v_org, 'Participante',
      'Credencial individual emitida pelo Pulse.', true, false, 1, true
    ) returning id into v_type;
  end if;

  if not exists (
    select 1 from public.ticket_batches
    where event_id = v_event and ticket_type_id = v_type and name = 'Inscricoes do site'
  ) then
    insert into public.ticket_batches (
      ticket_type_id, event_id, name, price, quantity,
      starts_at, ends_at, is_active, is_visible
    ) values (
      v_type, v_event, 'Inscricoes do site', 0, 100000,
      now(), '2026-08-29T10:00:00-03:00', true, false
    );
  end if;
end $$;
