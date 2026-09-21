-- DR-012: allow Cursor/ENG actors on ticket_events (status flip audit)
ALTER TABLE support.ticket_events DROP CONSTRAINT IF EXISTS ticket_events_actor_check;
ALTER TABLE support.ticket_events ADD CONSTRAINT ticket_events_actor_check
  CHECK (actor = ANY (ARRAY[
    'system'::text,
    'operator'::text,
    'customer'::text,
    'bricely'::text,
    'cursor'::text,
    'eng'::text,
    'ai'::text
  ]));
