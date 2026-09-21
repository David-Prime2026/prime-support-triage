-- DR-012 Stage 1: Cursor desk execution status (staging fence; human owns promote)
ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS cursor_execution_status text;

ALTER TABLE support.support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_cursor_execution_status_check;

ALTER TABLE support.support_tickets
  ADD CONSTRAINT support_tickets_cursor_execution_status_check
  CHECK (
    cursor_execution_status IS NULL
    OR cursor_execution_status = ANY (ARRAY[
      'idle'::text,
      'received'::text,
      'in_staging'::text,
      'preview_ready'::text,
      'awaiting_promote'::text,
      'blocked'::text,
      'done'::text
    ])
  );

COMMENT ON COLUMN support.support_tickets.cursor_execution_status IS
  'DR-012 Cursor desk execution state (staging fence). Human still owns promote.';
