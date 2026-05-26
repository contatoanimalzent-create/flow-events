-- Enforce real CPF values for new personal records without breaking legacy rows.

CREATE OR REPLACE FUNCTION public.only_digits(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(coalesce(value, ''), '\D', '', 'g');
$$;

CREATE OR REPLACE FUNCTION public.is_valid_cpf(value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cpf text := public.only_digits(value);
  sum integer;
  digit integer;
BEGIN
  IF cpf IS NULL OR length(cpf) <> 11 THEN
    RETURN false;
  END IF;

  IF cpf ~ '^(\d)\1{10}$' THEN
    RETURN false;
  END IF;

  sum := 0;
  FOR i IN 1..9 LOOP
    sum := sum + substring(cpf from i for 1)::integer * (11 - i);
  END LOOP;
  digit := CASE WHEN sum % 11 < 2 THEN 0 ELSE 11 - (sum % 11) END;
  IF substring(cpf from 10 for 1)::integer <> digit THEN
    RETURN false;
  END IF;

  sum := 0;
  FOR i IN 1..10 LOOP
    sum := sum + substring(cpf from i for 1)::integer * (12 - i);
  END LOOP;
  digit := CASE WHEN sum % 11 < 2 THEN 0 ELSE 11 - (sum % 11) END;

  RETURN substring(cpf from 11 for 1)::integer = digit;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_cpf_value(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT nullif(public.only_digits(value), '');
$$;

CREATE OR REPLACE FUNCTION public.require_valid_cpf(value text, label text DEFAULT 'CPF')
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned text := public.normalize_cpf_value(value);
BEGIN
  IF cleaned IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT public.is_valid_cpf(cleaned) THEN
    RAISE EXCEPTION '% invalido. Informe um CPF real da propria pessoa.', label
      USING ERRCODE = '22023';
  END IF;

  RETURN cleaned;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_validate_cpf_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  column_name text;
  raw_value text;
  cleaned text;
BEGIN
  FOREACH column_name IN ARRAY TG_ARGV LOOP
    raw_value := to_jsonb(NEW)->>column_name;
    cleaned := public.require_valid_cpf(raw_value, column_name);
    NEW := jsonb_populate_record(NEW, jsonb_build_object(column_name, cleaned));
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_validate_person_metadata_cpf()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  raw_value text;
  cleaned text;
BEGIN
  IF NEW.metadata IS NULL OR NOT (NEW.metadata ? 'cpf') THEN
    RETURN NEW;
  END IF;

  raw_value := NEW.metadata->>'cpf';
  cleaned := public.require_valid_cpf(raw_value, 'cpf');
  NEW.metadata := jsonb_set(coalesce(NEW.metadata, '{}'::jsonb), '{cpf}', to_jsonb(cleaned), true);

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  item record;
  trigger_name text;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('profiles', 'cpf'),
      ('orders', 'buyer_cpf'),
      ('order_items', 'holder_cpf'),
      ('digital_tickets', 'holder_cpf'),
      ('staff_members', 'cpf'),
      ('staff', 'document_number'),
      ('staff_applications', 'document_number'),
      ('inscricoes', 'cpf'),
      ('lista_espera', 'cpf'),
      ('capital_strike_registrations', 'cpf'),
      ('contacts', 'cpf')
    ) AS t(table_name, column_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = item.table_name
        AND column_name = item.column_name
    ) THEN
      trigger_name := item.table_name || '_' || item.column_name || '_cpf_guard';

      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trigger_name, item.table_name);
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE INSERT OR UPDATE OF %I ON public.%I FOR EACH ROW EXECUTE FUNCTION public.normalize_validate_cpf_columns(%L)',
        trigger_name,
        item.column_name,
        item.table_name,
        item.column_name
      );
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'customers'
      AND column_name = 'document'
  ) THEN
    DROP TRIGGER IF EXISTS customers_document_cpf_guard ON public.customers;
    CREATE TRIGGER customers_document_cpf_guard
      BEFORE INSERT OR UPDATE OF document ON public.customers
      FOR EACH ROW
      WHEN (NEW.document IS NOT NULL AND length(public.only_digits(NEW.document)) = 11)
      EXECUTE FUNCTION public.normalize_validate_cpf_columns('document');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'person_event_profiles'
      AND column_name = 'metadata'
  ) THEN
    DROP TRIGGER IF EXISTS person_event_profiles_metadata_cpf_guard ON public.person_event_profiles;
    CREATE TRIGGER person_event_profiles_metadata_cpf_guard
      BEFORE INSERT OR UPDATE OF metadata ON public.person_event_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.normalize_validate_person_metadata_cpf();
  END IF;
END $$;
