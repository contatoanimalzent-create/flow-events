alter table public.capital_strike_registrations
  add column if not exists kit_status text;

alter table public.capital_strike_registrations
  drop constraint if exists capital_strike_registrations_kit_status_check;

alter table public.capital_strike_registrations
  add constraint capital_strike_registrations_kit_status_check
  check (kit_status is null or kit_status in ('Com kit', 'Sem kit'));
