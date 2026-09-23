-- O número do ingresso (BSB7-00001...) sai de ticket_batches.sold_count. Se esse
-- contador ficar abaixo do maior número já emitido, a retirada colide com um
-- ingresso existente e falha para todo mundo (aconteceu em 2026-09-23).
-- Aqui o contador se realinha sozinho com o maior número real, dentro do mesmo
-- lock do lote, a cada retirada. Aplicado em produção via MCP.
do $mig$
declare
  v_def text;
  v_old text := $x$if not found then return jsonb_build_object('ok', false, 'error', 'batch_not_found'); end if;$x$;
  v_new text := $x$if not found then return jsonb_build_object('ok', false, 'error', 'batch_not_found'); end if;
  v_batch.sold_count := greatest(
    coalesce(v_batch.sold_count, 0),
    coalesce((select max(substring(dt.ticket_number from '^BSB7-(\d+)$')::int) from public.digital_tickets dt where dt.ticket_number ~ '^BSB7-\d+$'), 0)
  );$x$;
begin
  v_def := pg_get_functiondef('public.claim_bsb_fight_ticket(text,text,text,text,text,text,text,boolean,boolean,text,text,jsonb,integer,text[])'::regprocedure);
  if position('v_batch.sold_count := greatest(' in v_def) > 0 then
    return; -- já aplicado
  end if;
  if position(v_old in v_def) = 0 then
    raise exception 'trecho esperado não encontrado';
  end if;
  execute replace(v_def, v_old, v_new);
end
$mig$;
