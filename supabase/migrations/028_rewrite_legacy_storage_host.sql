-- Rewrite storage URLs saved under the retired custom domain.
--
-- Supabase storage used to be served from https://cdn.ie-global.net. That
-- domain no longer resolves, but the objects still exist on the project host,
-- so every stored URL only needs its host prefix swapped.
--
-- Covers every text / text[] column named like *_url* in the public schema
-- (thumbnail_url, gallery_urls, cover_image_url, avatar_url, file_url, ...).
-- Idempotent: rows that no longer contain the legacy prefix are untouched.
--
-- Preview first (optional):
--   SELECT count(*) FROM website_templates WHERE thumbnail_url LIKE 'https://cdn.ie-global.net/%';

DO $$
DECLARE
  legacy_prefix  CONSTANT text := 'https://cdn.ie-global.net/';
  current_prefix CONSTANT text := 'https://vuanlnmdlcgeiarxeklu.supabase.co/';
  col      record;
  affected bigint;
BEGIN
  FOR col IN
    SELECT c.table_name, c.column_name, c.udt_name
    FROM information_schema.columns AS c
    JOIN information_schema.tables AS t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.column_name LIKE '%\_url%' ESCAPE '\'
      AND c.udt_name IN ('text', 'varchar', '_text')
    ORDER BY c.table_name, c.column_name
  LOOP
    IF col.udt_name = '_text' THEN
      EXECUTE format(
        'UPDATE public.%I SET %I = (SELECT array_agg(replace(u, %L, %L)) FROM unnest(%I) AS u) '
        || 'WHERE EXISTS (SELECT 1 FROM unnest(%I) AS u WHERE u LIKE %L)',
        col.table_name, col.column_name, legacy_prefix, current_prefix,
        col.column_name, col.column_name, legacy_prefix || '%'
      );
    ELSE
      EXECUTE format(
        'UPDATE public.%I SET %I = replace(%I, %L, %L) WHERE %I LIKE %L',
        col.table_name, col.column_name, col.column_name, legacy_prefix, current_prefix,
        col.column_name, legacy_prefix || '%'
      );
    END IF;

    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected > 0 THEN
      RAISE NOTICE '%.%: % row(s) rewritten', col.table_name, col.column_name, affected;
    END IF;
  END LOOP;
END
$$;
