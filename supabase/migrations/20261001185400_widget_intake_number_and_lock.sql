-- DR-CS-WIDGET-016 — widget insert 500 + terminal open_ticket_id lock
-- Isolated support schema ONLY. NEVER apply to qcefkoxqkfwnlqfmwzmi.
-- Does NOT re-run numbering backfill. Live column is already ticket_number.
--
-- Live trigger: trg_support_tickets_ticket_number → support.allocate_ticket_number
-- (invoker). Widget insert leaves ticket_number null so allocate INSERTs
-- support.ticket_number_seq and 500s. Desk/email that already set a number skip it.
-- Smallest fix: SECURITY DEFINER + tight search_path, plus GRANT on the seq table.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'support'
      AND p.proname = 'allocate_ticket_number'
      AND pg_get_function_identity_arguments(p.oid) = ''
  ) THEN
    EXECUTE 'ALTER FUNCTION support.allocate_ticket_number() SECURITY DEFINER';
    EXECUTE 'ALTER FUNCTION support.allocate_ticket_number() SET search_path = support, pg_temp';
    EXECUTE 'GRANT EXECUTE ON FUNCTION support.allocate_ticket_number() TO anon, authenticated, service_role';
  END IF;

  -- Local kernel copy uses assign_ticket_number (no seq table). Same owner rights.
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'support'
      AND p.proname = 'assign_ticket_number'
      AND pg_get_function_identity_arguments(p.oid) = ''
  ) THEN
    EXECUTE 'ALTER FUNCTION support.assign_ticket_number() SECURITY DEFINER';
    EXECUTE 'ALTER FUNCTION support.assign_ticket_number() SET search_path = support, pg_temp';
    EXECUTE 'GRANT EXECUTE ON FUNCTION support.assign_ticket_number() TO anon, authenticated, service_role';
  END IF;

  IF to_regclass('support.ticket_number_seq') IS NOT NULL THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON TABLE support.ticket_number_seq TO service_role';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION support.clear_locks_for_ticket(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = support, pg_temp
AS $$
BEGIN
  UPDATE support.bricely_threads
  SET
    open_ticket_id = NULL,
    diag_state = CASE
      WHEN diag_state IS NULL THEN jsonb_build_object('openTicketId', NULL)
      WHEN jsonb_typeof(diag_state) = 'object'
        THEN (diag_state - 'openTicketId') || jsonb_build_object('openTicketId', NULL)
      ELSE diag_state
    END,
    updated_at = now()
  WHERE open_ticket_id = p_ticket_id;
END;
$$;

GRANT EXECUTE ON FUNCTION support.clear_locks_for_ticket(uuid) TO anon, authenticated, service_role;

-- A2 one-shot: stale widget lock on terminal tickets.
UPDATE support.bricely_threads t
SET
  open_ticket_id = NULL,
  diag_state = CASE
    WHEN t.diag_state IS NULL THEN jsonb_build_object('openTicketId', NULL)
    WHEN jsonb_typeof(t.diag_state) = 'object'
      THEN (t.diag_state - 'openTicketId') || jsonb_build_object('openTicketId', NULL)
    ELSE t.diag_state
  END,
  updated_at = now()
FROM support.support_tickets s
WHERE t.open_ticket_id = s.id
  AND s.status IN ('resolved', 'closed', 'auto_resolved');

NOTIFY pgrst, 'reload schema';
