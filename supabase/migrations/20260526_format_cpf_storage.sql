-- Store validated CPF values in the canonical display format: 000.000.000-00.

CREATE OR REPLACE FUNCTION public.format_cpf(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN public.only_digits(value) = '' THEN NULL
    ELSE substring(public.only_digits(value) from 1 for 3)
      || '.' || substring(public.only_digits(value) from 4 for 3)
      || '.' || substring(public.only_digits(value) from 7 for 3)
      || '-' || substring(public.only_digits(value) from 10 for 2)
  END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_cpf_value(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.format_cpf(value);
$$;

CREATE OR REPLACE FUNCTION public.require_valid_cpf(value text, label text DEFAULT 'CPF')
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned text := public.only_digits(value);
BEGIN
  IF cleaned IS NULL OR cleaned = '' THEN
    RETURN NULL;
  END IF;

  IF NOT public.is_valid_cpf(cleaned) THEN
    RAISE EXCEPTION '% invalido. Informe um CPF real da propria pessoa.', label
      USING ERRCODE = '22023';
  END IF;

  RETURN public.format_cpf(cleaned);
END;
$$;
