-- ============================================================
-- ANIMALZ EVENTS - Check-in operational foundation
-- Migration: 2026-03-23
-- Validation, audit and atomic QR processing
-- ============================================================

ALTER TABLE public.checkins
  ADD COLUMN IF NOT EXISTS reason_code TEXT,
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_checkins_event_checked_at
  ON public.checkins(event_id, checked_in_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkins_ticket_checked_at
  ON public.checkins(digital_ticket_id, checked_in_at DESC);

CREATE OR REPLACE FUNCTION public.validate_digital_ticket_access(
  p_event_id UUID,
  p_qr_token TEXT,
  p_gate_id UUID DEFAULT NULL,
  p_is_exit BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket RECORD;
  v_last_success RECORD;
BEGIN
  SELECT
    dt.id,
    dt.order_id,
    dt.order_item_id,
    dt.event_id,
    dt.ticket_number,
    dt.qr_token,
    dt.holder_name,
    dt.holder_email,
    dt.status,
    dt.checked_in_at,
    dt.is_vip,
    tt.name AS ticket_type_name
  INTO v_ticket
  FROM public.digital_tickets dt
  LEFT JOIN public.ticket_types tt ON tt.id = dt.ticket_type_id
  WHERE dt.event_id = p_event_id
    AND dt.qr_token = TRIM(p_qr_token)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'validation_status', 'invalid',
      'result', 'invalid',
      'reason_code', 'ticket_not_found',
      'gate_id', p_gate_id,
      'is_exit', p_is_exit,
      'can_check_in', FALSE,
      'can_reenter', FALSE,
      'already_checked_in', FALSE,
      'digital_ticket', NULL
    );
  END IF;

  SELECT id, is_exit, checked_in_at
  INTO v_last_success
  FROM public.checkins
  WHERE digital_ticket_id = v_ticket.id
    AND result = 'success'
  ORDER BY checked_in_at DESC
  LIMIT 1;

  IF p_is_exit THEN
    IF v_ticket.status IN ('cancelled', 'refunded') THEN
      RETURN jsonb_build_object(
        'validation_status', 'cancelled',
        'result', 'blocked',
        'reason_code', CASE WHEN v_ticket.status = 'refunded' THEN 'ticket_refunded' ELSE 'ticket_cancelled' END,
        'gate_id', p_gate_id,
        'is_exit', TRUE,
        'can_check_in', FALSE,
        'can_reenter', FALSE,
        'already_checked_in', FALSE,
        'digital_ticket', jsonb_build_object(
          'id', v_ticket.id,
          'order_id', v_ticket.order_id,
          'order_item_id', v_ticket.order_item_id,
          'event_id', v_ticket.event_id,
          'ticket_number', v_ticket.ticket_number,
          'qr_token', v_ticket.qr_token,
          'holder_name', v_ticket.holder_name,
          'holder_email', v_ticket.holder_email,
          'status', v_ticket.status,
          'checked_in_at', v_ticket.checked_in_at,
          'is_vip', v_ticket.is_vip,
          'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
        )
      );
    END IF;

    IF v_ticket.status = 'expired' THEN
      RETURN jsonb_build_object(
        'validation_status', 'expired',
        'result', 'expired',
        'reason_code', 'ticket_expired',
        'gate_id', p_gate_id,
        'is_exit', TRUE,
        'can_check_in', FALSE,
        'can_reenter', FALSE,
        'already_checked_in', FALSE,
        'digital_ticket', jsonb_build_object(
          'id', v_ticket.id,
          'order_id', v_ticket.order_id,
          'order_item_id', v_ticket.order_item_id,
          'event_id', v_ticket.event_id,
          'ticket_number', v_ticket.ticket_number,
          'qr_token', v_ticket.qr_token,
          'holder_name', v_ticket.holder_name,
          'holder_email', v_ticket.holder_email,
          'status', v_ticket.status,
          'checked_in_at', v_ticket.checked_in_at,
          'is_vip', v_ticket.is_vip,
          'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
        )
      );
    END IF;

    IF v_ticket.status = 'used' AND v_last_success IS NOT NULL AND v_last_success.is_exit = TRUE THEN
      RETURN jsonb_build_object(
        'validation_status', 'already_used',
        'result', 'already_used',
        'reason_code', 'duplicate_exit',
        'gate_id', p_gate_id,
        'is_exit', TRUE,
        'can_check_in', FALSE,
        'can_reenter', FALSE,
        'already_checked_in', TRUE,
        'digital_ticket', jsonb_build_object(
          'id', v_ticket.id,
          'order_id', v_ticket.order_id,
          'order_item_id', v_ticket.order_item_id,
          'event_id', v_ticket.event_id,
          'ticket_number', v_ticket.ticket_number,
          'qr_token', v_ticket.qr_token,
          'holder_name', v_ticket.holder_name,
          'holder_email', v_ticket.holder_email,
          'status', v_ticket.status,
          'checked_in_at', v_ticket.checked_in_at,
          'is_vip', v_ticket.is_vip,
          'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
        )
      );
    END IF;

    IF v_ticket.status = 'used' THEN
      RETURN jsonb_build_object(
        'validation_status', 'valid',
        'result', 'success',
        'reason_code', 'ticket_valid',
        'gate_id', p_gate_id,
        'is_exit', TRUE,
        'can_check_in', TRUE,
        'can_reenter', FALSE,
        'already_checked_in', TRUE,
        'digital_ticket', jsonb_build_object(
          'id', v_ticket.id,
          'order_id', v_ticket.order_id,
          'order_item_id', v_ticket.order_item_id,
          'event_id', v_ticket.event_id,
          'ticket_number', v_ticket.ticket_number,
          'qr_token', v_ticket.qr_token,
          'holder_name', v_ticket.holder_name,
          'holder_email', v_ticket.holder_email,
          'status', v_ticket.status,
          'checked_in_at', v_ticket.checked_in_at,
          'is_vip', v_ticket.is_vip,
          'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
        )
      );
    END IF;

    RETURN jsonb_build_object(
      'validation_status', 'blocked',
      'result', 'blocked',
      'reason_code', 'exit_without_entry',
      'gate_id', p_gate_id,
      'is_exit', TRUE,
      'can_check_in', FALSE,
      'can_reenter', FALSE,
      'already_checked_in', FALSE,
      'digital_ticket', jsonb_build_object(
        'id', v_ticket.id,
        'order_id', v_ticket.order_id,
        'order_item_id', v_ticket.order_item_id,
        'event_id', v_ticket.event_id,
        'ticket_number', v_ticket.ticket_number,
        'qr_token', v_ticket.qr_token,
        'holder_name', v_ticket.holder_name,
        'holder_email', v_ticket.holder_email,
        'status', v_ticket.status,
        'checked_in_at', v_ticket.checked_in_at,
        'is_vip', v_ticket.is_vip,
        'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
      )
    );
  END IF;

  IF v_ticket.status = 'confirmed' THEN
    RETURN jsonb_build_object(
      'validation_status', 'valid',
      'result', 'success',
      'reason_code', 'ticket_valid',
      'gate_id', p_gate_id,
      'is_exit', FALSE,
      'can_check_in', TRUE,
      'can_reenter', FALSE,
      'already_checked_in', FALSE,
      'digital_ticket', jsonb_build_object(
        'id', v_ticket.id,
        'order_id', v_ticket.order_id,
        'order_item_id', v_ticket.order_item_id,
        'event_id', v_ticket.event_id,
        'ticket_number', v_ticket.ticket_number,
        'qr_token', v_ticket.qr_token,
        'holder_name', v_ticket.holder_name,
        'holder_email', v_ticket.holder_email,
        'status', v_ticket.status,
        'checked_in_at', v_ticket.checked_in_at,
        'is_vip', v_ticket.is_vip,
        'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
      )
    );
  END IF;

  IF v_ticket.status = 'used' AND v_last_success IS NOT NULL AND v_last_success.is_exit = TRUE THEN
    RETURN jsonb_build_object(
      'validation_status', 'reentry_allowed',
      'result', 'success',
      'reason_code', 'reentry_allowed',
      'gate_id', p_gate_id,
      'is_exit', FALSE,
      'can_check_in', TRUE,
      'can_reenter', TRUE,
      'already_checked_in', TRUE,
      'digital_ticket', jsonb_build_object(
        'id', v_ticket.id,
        'order_id', v_ticket.order_id,
        'order_item_id', v_ticket.order_item_id,
        'event_id', v_ticket.event_id,
        'ticket_number', v_ticket.ticket_number,
        'qr_token', v_ticket.qr_token,
        'holder_name', v_ticket.holder_name,
        'holder_email', v_ticket.holder_email,
        'status', v_ticket.status,
        'checked_in_at', v_ticket.checked_in_at,
        'is_vip', v_ticket.is_vip,
        'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
      )
    );
  END IF;

  IF v_ticket.status = 'used' THEN
    RETURN jsonb_build_object(
      'validation_status', 'already_used',
      'result', 'already_used',
      'reason_code', 'already_checked_in',
      'gate_id', p_gate_id,
      'is_exit', FALSE,
      'can_check_in', FALSE,
      'can_reenter', FALSE,
      'already_checked_in', TRUE,
      'digital_ticket', jsonb_build_object(
        'id', v_ticket.id,
        'order_id', v_ticket.order_id,
        'order_item_id', v_ticket.order_item_id,
        'event_id', v_ticket.event_id,
        'ticket_number', v_ticket.ticket_number,
        'qr_token', v_ticket.qr_token,
        'holder_name', v_ticket.holder_name,
        'holder_email', v_ticket.holder_email,
        'status', v_ticket.status,
        'checked_in_at', v_ticket.checked_in_at,
        'is_vip', v_ticket.is_vip,
        'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
      )
    );
  END IF;

  IF v_ticket.status IN ('cancelled', 'refunded') THEN
    RETURN jsonb_build_object(
      'validation_status', 'cancelled',
      'result', 'blocked',
      'reason_code', CASE WHEN v_ticket.status = 'refunded' THEN 'ticket_refunded' ELSE 'ticket_cancelled' END,
      'gate_id', p_gate_id,
      'is_exit', FALSE,
      'can_check_in', FALSE,
      'can_reenter', FALSE,
      'already_checked_in', FALSE,
      'digital_ticket', jsonb_build_object(
        'id', v_ticket.id,
        'order_id', v_ticket.order_id,
        'order_item_id', v_ticket.order_item_id,
        'event_id', v_ticket.event_id,
        'ticket_number', v_ticket.ticket_number,
        'qr_token', v_ticket.qr_token,
        'holder_name', v_ticket.holder_name,
        'holder_email', v_ticket.holder_email,
        'status', v_ticket.status,
        'checked_in_at', v_ticket.checked_in_at,
        'is_vip', v_ticket.is_vip,
        'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
      )
    );
  END IF;

  IF v_ticket.status = 'expired' THEN
    RETURN jsonb_build_object(
      'validation_status', 'expired',
      'result', 'expired',
      'reason_code', 'ticket_expired',
      'gate_id', p_gate_id,
      'is_exit', FALSE,
      'can_check_in', FALSE,
      'can_reenter', FALSE,
      'already_checked_in', FALSE,
      'digital_ticket', jsonb_build_object(
        'id', v_ticket.id,
        'order_id', v_ticket.order_id,
        'order_item_id', v_ticket.order_item_id,
        'event_id', v_ticket.event_id,
        'ticket_number', v_ticket.ticket_number,
        'qr_token', v_ticket.qr_token,
        'holder_name', v_ticket.holder_name,
        'holder_email', v_ticket.holder_email,
        'status', v_ticket.status,
        'checked_in_at', v_ticket.checked_in_at,
        'is_vip', v_ticket.is_vip,
        'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'validation_status', 'blocked',
    'result', 'blocked',
    'reason_code', 'ticket_blocked',
    'gate_id', p_gate_id,
    'is_exit', FALSE,
    'can_check_in', FALSE,
    'can_reenter', FALSE,
    'already_checked_in', FALSE,
    'digital_ticket', jsonb_build_object(
      'id', v_ticket.id,
      'order_id', v_ticket.order_id,
      'order_item_id', v_ticket.order_item_id,
      'event_id', v_ticket.event_id,
      'ticket_number', v_ticket.ticket_number,
      'qr_token', v_ticket.qr_token,
      'holder_name', v_ticket.holder_name,
      'holder_email', v_ticket.holder_email,
      'status', v_ticket.status,
      'checked_in_at', v_ticket.checked_in_at,
      'is_vip', v_ticket.is_vip,
      'ticket_type', jsonb_build_object('name', v_ticket.ticket_type_name)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_digital_ticket_checkin(
  p_event_id UUID,
  p_qr_token TEXT,
  p_gate_id UUID DEFAULT NULL,
  p_operator_id UUID DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_is_exit BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation JSONB;
  v_result TEXT;
  v_reason_code TEXT;
  v_can_check_in BOOLEAN;
  v_ticket_id UUID;
  v_checkin RECORD;
BEGIN
  v_validation := public.validate_digital_ticket_access(p_event_id, p_qr_token, p_gate_id, p_is_exit);
  v_result := COALESCE(v_validation->>'result', 'invalid');
  v_reason_code := v_validation->>'reason_code';
  v_can_check_in := COALESCE((v_validation->>'can_check_in')::BOOLEAN, FALSE);
  v_ticket_id := NULLIF(v_validation->'digital_ticket'->>'id', '')::UUID;

  IF v_can_check_in THEN
    INSERT INTO public.checkins (
      event_id,
      digital_ticket_id,
      gate_id,
      operator_id,
      device_id,
      result,
      reason_code,
      is_exit,
      checked_in_at
    )
    VALUES (
      p_event_id,
      v_ticket_id,
      p_gate_id,
      p_operator_id,
      p_device_id,
      'success',
      v_reason_code,
      p_is_exit,
      NOW()
    )
    RETURNING id, checked_in_at INTO v_checkin;

    IF NOT p_is_exit AND v_ticket_id IS NOT NULL THEN
      UPDATE public.digital_tickets
      SET
        status = 'used',
        checked_in_at = NOW()
      WHERE id = v_ticket_id;
    END IF;
  ELSE
    INSERT INTO public.checkins (
      event_id,
      digital_ticket_id,
      gate_id,
      operator_id,
      device_id,
      result,
      reason_code,
      is_exit,
      checked_in_at
    )
    VALUES (
      p_event_id,
      v_ticket_id,
      p_gate_id,
      p_operator_id,
      p_device_id,
      CASE
        WHEN v_result IN ('already_used', 'invalid', 'expired', 'blocked') THEN v_result
        ELSE 'blocked'
      END,
      v_reason_code,
      p_is_exit,
      NOW()
    )
    RETURNING id, checked_in_at INTO v_checkin;
  END IF;

  RETURN v_validation || jsonb_build_object(
    'checkin_id', v_checkin.id,
    'checked_in_at', v_checkin.checked_in_at
  );
END;
$$;
