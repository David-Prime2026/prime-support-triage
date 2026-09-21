-- DR-013 Stage 1: durable Cursor staging outbox (staging fence; never auto qcefkox)
CREATE TABLE IF NOT EXISTS support.cursor_staging_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support.support_tickets (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES support.clients (id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status = ANY (ARRAY['pending'::text, 'claimed'::text, 'in_staging'::text, 'done'::text, 'cancelled'::text])),
  proposal jsonb NOT NULL,
  approved_by text,
  claimed_by text,
  claimed_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cursor_staging_outbox_status_idx
  ON support.cursor_staging_outbox (status, created_at DESC);
CREATE INDEX IF NOT EXISTS cursor_staging_outbox_ticket_idx
  ON support.cursor_staging_outbox (ticket_id);

GRANT SELECT, INSERT, UPDATE ON support.cursor_staging_outbox TO anon, authenticated, service_role;

COMMENT ON TABLE support.cursor_staging_outbox IS
  'DR-013 durable Cursor staging proposals. Staging fence only; never auto qcefkox.';
