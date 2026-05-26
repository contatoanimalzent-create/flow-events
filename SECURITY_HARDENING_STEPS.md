# Security Hardening — Passos Finais (2026-04-27)

## ✅ O que já foi feito automaticamente

1. **Migration RLS aplicada** (`20260427_rls_security_hardening.sql`) — RLS habilitado e policies criadas em `payments`, `payment_webhook_events`, `transactional_messages`, `event_payouts`, `financial_forecasts`, `event_financial_closures`, `intelligence_alert_states`. Permissões `anon` revogadas dessas tabelas.

2. **Frontend auditado** — chamadas a `send-transactional-email` já usam `supabase.functions.invoke` (JWT automático). `validate-checkin` em `QRScannerAdvanced.tsx` foi corrigido para usar `supabase.functions.invoke` em vez de `fetch()` com anon key.

3. **Cron `process-notification-jobs`** já envia `x-cron-secret` (vem de `app.cron_secret` lido pela função `trigger_notification_jobs()` em pg_cron).

---

## ⚠️ AÇÕES MANUAIS — você precisa fazer

### 1. Setar o CRON_SECRET (DOIS lugares — devem ser idênticos)

**Valor gerado:** `fd34b933c2d299f1c7e153f039b529e2d3e1fa413f7ff85cf76e4f605499fe87`

**A) No banco** (Supabase Dashboard → SQL Editor, cole e execute):
```sql
ALTER DATABASE postgres SET "app.cron_secret" = 'fd34b933c2d299f1c7e153f039b529e2d3e1fa413f7ff85cf76e4f605499fe87';
```
Tive que pedir pra você fazer porque a API MCP não tem permissão pra `ALTER DATABASE`.

**B) Como secret das Edge Functions** (Dashboard → Project Settings → Edge Functions → Secrets → Add new secret):
- Name: `CRON_SECRET`
- Value: `fd34b933c2d299f1c7e153f039b529e2d3e1fa413f7ff85cf76e4f605499fe87`

### 2. Cron para `process-staff-invite?run=batch`

Não existe pg_cron job pra isso ainda (verifiquei — só `process-notification-jobs` está agendado). Se você tinha cron externo (cron-job.org, GitHub Actions, etc), adicione header:
```
x-cron-secret: fd34b933c2d299f1c7e153f039b529e2d3e1fa413f7ff85cf76e4f605499fe87
```

Se quiser usar pg_cron interno (recomendado), execute no SQL Editor:
```sql
CREATE OR REPLACE FUNCTION public.trigger_staff_invite_batch()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _secret TEXT;
BEGIN
  _secret := current_setting('app.cron_secret', true);
  PERFORM net.http_get(
    url     := 'https://nrjizzfkhficvhiiqvtl.supabase.co/functions/v1/process-staff-invite?run=batch',
    headers := jsonb_build_object('x-cron-secret', COALESCE(_secret, ''))
  );
END; $$;

SELECT cron.unschedule('process-staff-invite-batch') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-staff-invite-batch'
);
SELECT cron.schedule('process-staff-invite-batch', '*/2 * * * *', 'SELECT public.trigger_staff_invite_batch()');
```

### 3. Auditoria de Storage Buckets — RESULTADO

Buckets atuais e visibilidade:
| Bucket | Public? | Status |
|---|---|---|
| event-assets | ✅ true | OK (capa pública de evento) |
| event-covers | ✅ true | OK |
| organization-assets | ✅ true | OK |
| profile-avatars | ✅ true | OK |
| public-assets | ✅ true | OK |
| **tickets** | ⚠️ **true** | **AVALIE** — ingressos PDF acessíveis por URL. Se os links contêm UUID e você compartilha por email só com o comprador, é ok; se quiser fail-closed, mude pra privado e gere signed URLs |
| event-maps | 🔒 false | OK |
| exports | 🔒 false | OK |
| staff-documents | 🔒 false | OK (era esperado como `documents`) |
| temporary | 🔒 false | OK |
| ticket-assets | 🔒 false | OK |

Não existem buckets chamados `credentials` ou `documents` — os equivalentes são `ticket-assets` (privado) e `staff-documents` (privado), ambos OK.

**Se quiser tornar `tickets` privado** (Dashboard → Storage → tickets → Settings → desliga "Public bucket"). Depois ajuste o frontend pra gerar signed URLs ao baixar.

---

## Resumo do que muda no comportamento

- Tabelas financeiras agora bloqueiam acesso de usuários de outras organizações (RLS).
- Check-in agora roda sob a sessão do operador (JWT real), não mais anon key — isso permite auditoria correta de quem validou cada ticket.
- Edge Functions de cron passam a recusar chamadas sem `x-cron-secret` correto (fail-closed).
