-- Aplicado em produção em 2026-10-18 (via MCP). Registro no repositório.
-- 1) notification_queue não tem processador; 6.100 itens 'queued' marcados como 'cancelled'
--    com error_message '[limpeza-2026-10-18] ...' (o ingresso já sai pelo fluxo próprio de cada evento).
-- 2) Trigger trg_enqueue_ticket_notification desativado (só gerava cópia sem uso).
-- 3) notification_jobs 'pending' de eventos já realizados marcados 'failed' com '[limpeza-2026-10-18]'.
-- 4) Cron de notificações: Authorization (anon JWT) + x-cron-secret do Vault ('notificacoes_cron_secret'),
--    conferido por public.confere_cron_notificacoes(text) (só service_role).
-- Para desfazer 1/3: update ... set status='queued'/'pending' where error_message like '[limpeza-2026-10-18]%';
-- Para desfazer 2: alter table public.digital_tickets enable trigger trg_enqueue_ticket_notification;
select 1;
