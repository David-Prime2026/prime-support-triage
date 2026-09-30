-- DR-CS-PLATFORM-016 follow-on — public ticket numbers
-- Isolated support schema ONLY. NEVER apply to qcefkoxqkfwnlqfmwzmi.
--
-- Format: {client_prefix}-{YYYY}-{MM}-{seq}  e.g. WMG-2026-09-022
-- Seq is per client per UTC month, real tickets only.
-- Purge is_mock tickets. Do not number mocks.

ALTER TABLE support.clients
  ADD COLUMN IF NOT EXISTS ticket_prefix text;

UPDATE support.clients
SET ticket_prefix = 'WMG'
WHERE id = 'a1000001-0001-4001-8001-000000000001'
  AND coalesce(nullif(ticket_prefix, ''), '') = '';

UPDATE support.clients
SET ticket_prefix = upper(regexp_replace(split_part(system_name, ' ', 1), '[^A-Za-z0-9]', '', 'g'))
WHERE ticket_prefix IS NULL OR ticket_prefix = '';

ALTER TABLE support.clients
  ALTER COLUMN ticket_prefix SET DEFAULT 'SUP';

ALTER TABLE support.clients
  ALTER COLUMN ticket_prefix SET NOT NULL;

ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS ticket_code text;

ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS ticket_seq integer;

-- Child rows cascade. Threads that pointed at mock tickets get open_ticket_id nulled.
DELETE FROM support.support_tickets WHERE is_mock IS TRUE;
DELETE FROM support.bricely_threads WHERE is_mock IS TRUE;

CREATE OR REPLACE FUNCTION support.ticket_period_utc(ts timestamptz)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT to_char(ts AT TIME ZONE 'UTC', 'YYYY-MM');
$$;

CREATE OR REPLACE FUNCTION support.assign_ticket_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  prefix text;
  ym text;
  next_seq int;
BEGIN
  IF NEW.is_mock IS TRUE THEN
    NEW.ticket_code := NULL;
    NEW.ticket_seq := NULL;
    RETURN NEW;
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  SELECT upper(regexp_replace(coalesce(c.ticket_prefix, 'SUP'), '[^A-Za-z0-9]', '', 'g'))
  INTO prefix
  FROM support.clients c
  WHERE c.id = NEW.client_id;

  IF prefix IS NULL OR prefix = '' THEN
    prefix := 'SUP';
  END IF;

  ym := support.ticket_period_utc(NEW.created_at);

  PERFORM pg_advisory_xact_lock(hashtext(NEW.client_id::text || ':' || ym));

  SELECT coalesce(max(t.ticket_seq), 0) + 1
  INTO next_seq
  FROM support.support_tickets t
  WHERE t.client_id = NEW.client_id
    AND t.is_mock IS NOT TRUE
    AND support.ticket_period_utc(t.created_at) = ym
    AND t.id IS DISTINCT FROM NEW.id;

  NEW.ticket_seq := next_seq;
  NEW.ticket_code := prefix || '-' || ym || '-' || lpad(next_seq::text, 3, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_tickets_assign_code ON support.support_tickets;
CREATE TRIGGER support_tickets_assign_code
  BEFORE INSERT ON support.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION support.assign_ticket_code();

-- Backfill remaining real tickets in created order, per client per month.
WITH numbered AS (
  SELECT
    t.id,
    upper(regexp_replace(coalesce(c.ticket_prefix, 'SUP'), '[^A-Za-z0-9]', '', 'g')) AS prefix,
    support.ticket_period_utc(t.created_at) AS ym,
    row_number() OVER (
      PARTITION BY t.client_id, support.ticket_period_utc(t.created_at)
      ORDER BY t.created_at ASC, t.id ASC
    ) AS seq
  FROM support.support_tickets t
  JOIN support.clients c ON c.id = t.client_id
  WHERE t.is_mock IS NOT TRUE
)
UPDATE support.support_tickets t
SET
  ticket_seq = n.seq,
  ticket_code = n.prefix || '-' || n.ym || '-' || lpad(n.seq::text, 3, '0')
FROM numbered n
WHERE t.id = n.id;

CREATE UNIQUE INDEX IF NOT EXISTS support_tickets_ticket_code_uidx
  ON support.support_tickets (ticket_code)
  WHERE ticket_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS support_tickets_ticket_code_idx
  ON support.support_tickets (ticket_code);

COMMENT ON COLUMN support.support_tickets.ticket_code IS
  'Public number: {prefix}-{YYYY}-{MM}-{seq} (real tickets only). UUID remains PK.';
COMMENT ON COLUMN support.clients.ticket_prefix IS
  'Client code in ticket_code, e.g. WMG.';

GRANT EXECUTE ON FUNCTION support.ticket_period_utc(timestamptz) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION support.assign_ticket_code() TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
