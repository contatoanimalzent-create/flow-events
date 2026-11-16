-- Speedsoft: cada equipe (clube) pode inscrever até dois times por modalidade de equipe
-- (Team 5x5, Speed CQB, Team 3x3 Pistola). A coluna identifica a equipe dona do time.
alter table public.speedsoft_registrations add column if not exists clube text;

update public.speedsoft_registrations
set clube = squad_nome
where clube is null and squad_nome is not null;

create index if not exists speedsoft_registrations_clube_idx
  on public.speedsoft_registrations (event_id, modalidade, lower(clube));
