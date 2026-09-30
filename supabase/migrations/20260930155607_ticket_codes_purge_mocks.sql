-- KERNEL COPY — already live on apxbwdxszmdffbduhjen (2026-09-30).
-- DO NOT RE-APPLY to apx. Re-applying from this VM duplicates work.
-- Isolated support schema ONLY. NEVER apply to qcefkoxqkfwnlqfmwzmi.
--
-- Live column is ticket_number (not ticket_code).
-- Format: {client_prefix}-{YYYY}-{MM}-{NNN}  e.g. WMG-2026-09-039
-- Seq is per client per UTC month. UUID id unchanged.
-- Live: 50/50 rows numbered, new inserts auto-number, leftover open mocks closed.
-- Tenant two needs its own prefix / system_name. See
-- handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md.

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
  ADD COLUMN IF NOT EXISTS ticket_number text;

ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS ticket_seq integer;

-- Live apx closed leftover open mocks; it did not delete numbered mock rows.
UPDATE support.support_tickets
SET status = 'closed'
WHERE is_mock IS TRUE
  AND status IS DISTINCT FROM 'closed'
  AND status IS DISTINCT FROM 'resolved';

CREATE OR REPLACE FUNCTION support.ticket_period_utc(ts timestamptz)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT to_char(ts AT TIME ZONE 'UTC', 'YYYY-MM');
$$;

CREATE OR REPLACE FUNCTION support.assign_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  prefix text;
  ym text;
  next_seq int;
BEGIN
  IF NEW.ticket_number IS NOT NULL AND btrim(NEW.ticket_number) <> '' THEN
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
    AND support.ticket_period_utc(t.created_at) = ym
    AND t.id IS DISTINCT FROM NEW.id;

  NEW.ticket_seq := next_seq;
  NEW.ticket_number := prefix || '-' || ym || '-' || lpad(next_seq::text, 3, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_tickets_assign_code ON support.support_tickets;
DROP TRIGGER IF EXISTS support_tickets_assign_number ON support.support_tickets;
CREATE TRIGGER support_tickets_assign_number
  BEFORE INSERT ON support.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION support.assign_ticket_number();

-- Backfill already ran on apx (50/50). Kept here as kernel copy only.
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
  WHERE t.ticket_number IS NULL OR btrim(t.ticket_number) = ''
)
UPDATE support.support_tickets t
SET
  ticket_seq = n.seq,
  ticket_number = n.prefix || '-' || n.ym || '-' || lpad(n.seq::text, 3, '0')
FROM numbered n
WHERE t.id = n.id;

CREATE UNIQUE INDEX IF NOT EXISTS support_tickets_ticket_number_uidx
  ON support.support_tickets (ticket_number)
  WHERE ticket_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS support_tickets_ticket_number_idx
  ON support.support_tickets (ticket_number);

COMMENT ON COLUMN support.support_tickets.ticket_number IS
  'Public number: {prefix}-{YYYY}-{MM}-{NNN}. UUID remains PK. Live on apx; do not re-apply.';
COMMENT ON COLUMN support.clients.ticket_prefix IS
  'Client code in ticket_number, e.g. WMG. Tenant two needs its own prefix.';

GRANT EXECUTE ON FUNCTION support.ticket_period_utc(timestamptz) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION support.assign_ticket_number() TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
