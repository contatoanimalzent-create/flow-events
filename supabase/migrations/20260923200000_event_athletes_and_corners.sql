-- Cadastro de atletas e corners por evento.
--
-- O corner se liga ao atleta por um codigo curto que o atleta recebe ao se
-- cadastrar e repassa para a equipe dele. O limite de 2 corners por atleta e
-- garantido por trigger, nao pela aplicacao, para nao depender de quem chama.

create table if not exists public.event_athletes (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null,
  event_id          uuid not null references public.events(id) on delete cascade,

  kind              text not null check (kind in ('athlete', 'corner')),

  -- comuns
  full_name         text not null,
  cpf               text,
  phone             text,
  email             text,
  photo_url         text,
  gym               text,
  city              text,
  state             text,
  notes             text,

  -- atleta
  athlete_code      text,
  birth_date        date,
  instagram         text,
  sherdog_url       text,
  weight_class      text,
  weight_kg         numeric(5,2),
  record_wins       integer,
  record_losses     integer,
  record_draws      integer,

  -- corner: a quem pertence
  athlete_id        uuid references public.event_athletes(id) on delete cascade,

  status            text not null default 'active' check (status in ('active', 'cancelled')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Um atleta tem codigo; um corner nao.
alter table public.event_athletes drop constraint if exists event_athletes_kind_shape;
alter table public.event_athletes add constraint event_athletes_kind_shape check (
  (kind = 'athlete' and athlete_code is not null and athlete_id is null)
  or
  (kind = 'corner' and athlete_code is null and athlete_id is not null)
);

create unique index if not exists event_athletes_code_uk
  on public.event_athletes (event_id, athlete_code)
  where athlete_code is not null;

-- Mesmo CPF nao se cadastra duas vezes no mesmo evento.
create unique index if not exists event_athletes_cpf_uk
  on public.event_athletes (event_id, cpf)
  where cpf is not null and status = 'active';

create index if not exists event_athletes_event_kind_idx
  on public.event_athletes (event_id, kind, created_at desc);

create index if not exists event_athletes_athlete_idx
  on public.event_athletes (athlete_id)
  where athlete_id is not null;

create index if not exists event_athletes_org_idx
  on public.event_athletes (organization_id);

-- ── Limite de 2 corners por atleta ───────────────────────────────────────────
-- O lock na linha do atleta serializa dois corners enviando ao mesmo tempo, que
-- de outra forma passariam os dois pela contagem.

create or replace function public.enforce_corner_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing integer;
  v_athlete  record;
begin
  if new.kind <> 'corner' then
    return new;
  end if;

  select id, event_id, full_name into v_athlete
  from public.event_athletes
  where id = new.athlete_id and kind = 'athlete'
  for update;

  if not found then
    raise exception 'Atleta nao encontrado para vincular o corner.'
      using errcode = 'P0002';
  end if;

  if v_athlete.event_id <> new.event_id then
    raise exception 'O corner e o atleta precisam ser do mesmo evento.'
      using errcode = 'P0001';
  end if;

  select count(*) into v_existing
  from public.event_athletes
  where athlete_id = new.athlete_id
    and kind = 'corner'
    and status = 'active'
    and (tg_op = 'INSERT' or id <> new.id);

  if v_existing >= 2 then
    raise exception 'O atleta % ja tem 2 corners cadastrados.', v_athlete.full_name
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_corner_limit on public.event_athletes;
create trigger trg_enforce_corner_limit
  before insert or update on public.event_athletes
  for each row execute function public.enforce_corner_limit();

create or replace function public.touch_event_athletes_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_event_athletes on public.event_athletes;
create trigger trg_touch_event_athletes
  before update on public.event_athletes
  for each row execute function public.touch_event_athletes_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Escrita publica so acontece pela edge function, que usa service_role e passa
-- ao largo da RLS. Pelo cliente, so a organizacao dona do evento enxerga.

alter table public.event_athletes enable row level security;

drop policy if exists event_athletes_org_all on public.event_athletes;
create policy event_athletes_org_all on public.event_athletes
  for all
  using (organization_id = public.get_user_org_id() or public.is_super_admin())
  with check (organization_id = public.get_user_org_id() or public.is_super_admin());

comment on table public.event_athletes is
  'Atletas e corners de um evento. Corner se liga ao atleta por athlete_id; o limite de 2 e garantido pelo trigger enforce_corner_limit.';
