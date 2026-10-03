-- DR-CS-WIDGET-016 — widget intake 500 on apxbwdxszmdffbduhjen ONLY.
-- NEVER apply to qcefkoxqkfwnlqfmwzmi.
--
-- Proved 2026-10-01 against live apx (anon INSERT into support.support_tickets):
--   42501 permission denied for table support.ticket_number_seq
--   hint named GRANT ... TO anon. PostgREST names support.allocate_ticket_number.
-- The git kernel function support.assign_ticket_number is NOT what is live.
-- Trigger is SECURITY INVOKER. Widget insert leaves ticket_number null, so the
-- trigger runs. Desk/email rows that already have ticket_number skip it.
--
-- Choice: SECURITY DEFINER + locked search_path (do not GRANT the counter to
-- anon — support is an exposed schema). Also GRANT the counter to service_role,
-- which is the role intake-ticket uses, so the invoker path works if the
-- function owner cannot be switched.
-- Does not renumber existing rows and does not require the browser to send
-- WMG-YYYY-MM-NNN.

DO $widget016$
DECLARE
  fn regprocedure;
  relkind "char";
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'support'
      AND p.proname IN ('allocate_ticket_number', 'assign_ticket_number')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SECURITY DEFINER', fn);
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = support, pg_catalog, pg_temp',
      fn
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %s TO service_role, authenticated, anon',
      fn
    );
  END LOOP;

  SELECT c.relkind
  INTO relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'support'
    AND c.relname = 'ticket_number_seq';

  IF relkind = 'r' THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON TABLE support.ticket_number_seq TO service_role';
  ELSIF relkind = 'S' THEN
    EXECUTE 'GRANT USAGE, SELECT, UPDATE ON SEQUENCE support.ticket_number_seq TO service_role';
  END IF;
END
$widget016$;

CREATE OR REPLACE FUNCTION support.clear_terminal_open_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = support, pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.status NOT IN ('resolved', 'closed', 'auto_resolved') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  UPDATE support.bricely_threads bt
    SET
      open_ticket_id = CASE
        WHEN bt.open_ticket_id = NEW.id THEN NULL
        ELSE bt.open_ticket_id
      END,
      diag_state = CASE
        WHEN jsonb_typeof(bt.diag_state) = 'object'
             AND bt.diag_state->>'openTicketId' = NEW.id::text
          THEN bt.diag_state - 'openTicketId'
        ELSE bt.diag_state
      END,
      updated_at = now()
    WHERE bt.open_ticket_id = NEW.id
       OR (
         jsonb_typeof(bt.diag_state) = 'object'
         AND bt.diag_state->>'openTicketId' = NEW.id::text
       );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION support.clear_terminal_open_ticket() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION support.clear_terminal_open_ticket() TO service_role, authenticated, anon;

DROP TRIGGER IF EXISTS trg_support_tickets_clear_open_on_terminal ON support.support_tickets;
CREATE TRIGGER trg_support_tickets_clear_open_on_terminal
  AFTER INSERT OR UPDATE OF status ON support.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION support.clear_terminal_open_ticket();

-- Threads already pointing at a terminal ticket (proved: resolved widget rows
-- still have open_ticket_id). Clear those locks now.
UPDATE support.bricely_threads bt
SET
  open_ticket_id = NULL,
  diag_state = CASE
    WHEN jsonb_typeof(bt.diag_state) = 'object'
         AND bt.diag_state->>'openTicketId' = bt.open_ticket_id::text
      THEN bt.diag_state - 'openTicketId'
    ELSE bt.diag_state
  END,
  updated_at = now()
FROM support.support_tickets st
WHERE bt.open_ticket_id = st.id
  AND st.status IN ('resolved', 'closed', 'auto_resolved');

UPDATE support.bricely_threads bt
SET
  diag_state = bt.diag_state - 'openTicketId',
  updated_at = now()
FROM support.support_tickets st
WHERE jsonb_typeof(bt.diag_state) = 'object'
  AND st.id::text = bt.diag_state->>'openTicketId'
  AND st.status IN ('resolved', 'closed', 'auto_resolved');

NOTIFY pgrst, 'reload schema';
