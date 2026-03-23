-- ============================================================
-- ANIMALZ EVENTS - Checkout foundation
-- Migration: 2026-03-23
-- Base transacional para drafts, reserva de inventario e expiracao
-- ============================================================

ALTER TABLE public.ticket_batches
  ADD COLUMN IF NOT EXISTS reserved_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.digital_tickets
  ADD COLUMN IF NOT EXISTS order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.ticket_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_event_status_expires
  ON public.orders(event_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_batch
  ON public.order_items(order_id, batch_id);

CREATE INDEX IF NOT EXISTS idx_digital_tickets_order_item
  ON public.digital_tickets(order_item_id);

CREATE OR REPLACE FUNCTION public.create_order_draft_with_reservations(p_payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_quantity INTEGER;
  v_batch_id UUID;
BEGIN
  INSERT INTO public.orders (
    organization_id,
    event_id,
    buyer_name,
    buyer_email,
    buyer_phone,
    buyer_cpf,
    subtotal,
    discount_amount,
    fee_amount,
    total_amount,
    status,
    payment_method,
    source_channel,
    expires_at,
    notes
  )
  VALUES (
    NULLIF(p_payload->>'organization_id', '')::UUID,
    NULLIF(p_payload->>'event_id', '')::UUID,
    COALESCE(NULLIF(TRIM(p_payload->'buyer'->>'name'), ''), 'Comprador'),
    COALESCE(NULLIF(TRIM(p_payload->'buyer'->>'email'), ''), 'checkout@animalz.local'),
    NULLIF(TRIM(p_payload->'buyer'->>'phone'), ''),
    NULLIF(TRIM(p_payload->'buyer'->>'cpf'), ''),
    COALESCE((p_payload->>'subtotal')::NUMERIC, 0),
    COALESCE((p_payload->>'discount_amount')::NUMERIC, 0),
    COALESCE((p_payload->>'fee_amount')::NUMERIC, 0),
    COALESCE((p_payload->>'total_amount')::NUMERIC, 0),
    COALESCE(NULLIF(p_payload->>'status', ''), 'draft'),
    NULLIF(p_payload->>'payment_method', ''),
    NULLIF(p_payload->>'source_channel', ''),
    COALESCE(NULLIF(p_payload->>'expires_at', '')::TIMESTAMPTZ, NOW() + INTERVAL '15 minutes'),
    NULLIF(p_payload->>'notes', '')
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(COALESCE(p_payload->'items', '[]'::JSONB))
  LOOP
    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 0), 0);
    v_batch_id := NULLIF(v_item->>'batch_id', '')::UUID;

    IF v_batch_id IS NOT NULL AND v_quantity > 0 THEN
      UPDATE public.ticket_batches
      SET reserved_count = COALESCE(reserved_count, 0) + v_quantity
      WHERE id = v_batch_id
        AND is_active = TRUE
        AND (COALESCE(quantity, 0) - COALESCE(sold_count, 0) - COALESCE(reserved_count, 0)) >= v_quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'inventory_unavailable_for_batch:%', v_batch_id;
      END IF;
    END IF;

    INSERT INTO public.order_items (
      order_id,
      ticket_type_id,
      batch_id,
      holder_name,
      holder_email,
      unit_price,
      quantity,
      total_price
    )
    VALUES (
      v_order_id,
      NULLIF(v_item->>'ticket_type_id', '')::UUID,
      v_batch_id,
      NULLIF(TRIM(v_item->>'holder_name'), ''),
      NULLIF(TRIM(v_item->>'holder_email'), ''),
      COALESCE((v_item->>'unit_price')::NUMERIC, 0),
      v_quantity,
      COALESCE((v_item->>'total_price')::NUMERIC, COALESCE((v_item->>'unit_price')::NUMERIC, 0) * v_quantity)
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_order_and_capture_inventory(
  p_order_id UUID,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
  v_total_quantity INTEGER := 0;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found:%', p_order_id;
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN v_order;
  END IF;

  IF v_order.status IN ('cancelled', 'expired') THEN
    RAISE EXCEPTION 'order_not_confirmable:%', p_order_id;
  END IF;

  FOR v_item IN
    SELECT batch_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
      AND batch_id IS NOT NULL
  LOOP
    UPDATE public.ticket_batches
    SET
      reserved_count = GREATEST(COALESCE(reserved_count, 0) - COALESCE(v_item.quantity, 0), 0),
      sold_count = COALESCE(sold_count, 0) + COALESCE(v_item.quantity, 0)
    WHERE id = v_item.batch_id
      AND COALESCE(reserved_count, 0) >= COALESCE(v_item.quantity, 0);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'reserved_inventory_missing_for_batch:%', v_item.batch_id;
    END IF;

    v_total_quantity := v_total_quantity + COALESCE(v_item.quantity, 0);
  END LOOP;

  UPDATE public.orders
  SET
    status = 'paid',
    payment_method = COALESCE(p_payment_method, payment_method, CASE WHEN COALESCE(total_amount, 0) = 0 THEN 'free' ELSE 'pix' END),
    paid_at = NOW(),
    expires_at = NULL
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  IF v_total_quantity > 0 THEN
    UPDATE public.events
    SET sold_tickets = COALESCE(sold_tickets, 0) + v_total_quantity
    WHERE id = v_order.event_id;
  END IF;

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_order_inventory(
  p_order_id UUID,
  p_target_status TEXT DEFAULT 'cancelled'
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found:%', p_order_id;
  END IF;

  IF v_order.status = 'paid' THEN
    RAISE EXCEPTION 'paid_order_cannot_release_inventory:%', p_order_id;
  END IF;

  IF v_order.status IN ('cancelled', 'expired') THEN
    RETURN v_order;
  END IF;

  FOR v_item IN
    SELECT batch_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
      AND batch_id IS NOT NULL
  LOOP
    UPDATE public.ticket_batches
    SET reserved_count = GREATEST(COALESCE(reserved_count, 0) - COALESCE(v_item.quantity, 0), 0)
    WHERE id = v_item.batch_id;
  END LOOP;

  UPDATE public.orders
  SET
    status = CASE WHEN p_target_status = 'expired' THEN 'expired' ELSE 'cancelled' END,
    expires_at = NULL
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_stale_order_drafts(p_event_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_order IN
    SELECT id
    FROM public.orders
    WHERE status IN ('draft', 'pending')
      AND expires_at IS NOT NULL
      AND expires_at <= NOW()
      AND (p_event_id IS NULL OR event_id = p_event_id)
  LOOP
    PERFORM public.release_order_inventory(v_order.id, 'expired');
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
