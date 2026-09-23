-- Roda a vigilância do site do BSB Fight a cada 5 minutos, 24h.
-- Pré-requisito (feito uma vez, fora do git): segredo MONITOR_KEY na edge function e o
-- mesmo valor no Vault com o nome bsb_site_monitor_key:
--   select vault.create_secret('<chave>', 'bsb_site_monitor_key', '...');
-- Aplicado em produção via MCP em 2026-09-23.
select cron.unschedule(jobid) from cron.job where jobname = 'bsb-site-monitor';

select cron.schedule(
  'bsb-site-monitor',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://nrjizzfkhficvhiiqvtl.supabase.co/functions/v1/bsb-site-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-monitor-key', (select decrypted_secret from vault.decrypted_secrets where name = 'bsb_site_monitor_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 150000
  );
  $cron$
);

-- Limpeza: guarda 14 dias de histórico das rodadas e 30 dias de erros do navegador.
select cron.unschedule(jobid) from cron.job where jobname = 'bsb-site-monitor-cleanup';
select cron.schedule(
  'bsb-site-monitor-cleanup',
  '17 4 * * *',
  $cron$
  delete from public.site_monitor_runs where created_at < now() - interval '14 days';
  delete from public.site_client_errors where created_at < now() - interval '30 days';
  $cron$
);
