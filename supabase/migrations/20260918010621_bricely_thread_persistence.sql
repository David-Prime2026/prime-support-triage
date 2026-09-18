-- DR-CS-PLATFORM-004 — Server-side Bricely thread persistence (isolated triage DB ONLY)
-- NEVER apply to WMG OS production (qcefkoxqkfwnlqfmwzmi).

CREATE TABLE IF NOT EXISTS support.bricely_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  surface text NOT NULL CHECK (surface IN ('internal', 'buyer', 'seller')),
  user_key text NOT NULL,
  requester_name text,
  requester_email text,
  linked_account text,
  is_mock boolean NOT NULL DEFAULT false,
  diag_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  open_ticket_id uuid REFERENCES support.support_tickets (id) ON DELETE SET NULL,
  retention_flag text NOT NULL DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, surface, user_key)
);

CREATE TABLE IF NOT EXISTS support.bricely_thread_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES support.bricely_threads (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('bricely', 'user', 'system')),
  body text NOT NULL DEFAULT '',
  card jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  client_msg_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bricely_thread_messages_thread_idx
  ON support.bricely_thread_messages (thread_id, created_at);

ALTER TABLE support.bricely_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.bricely_thread_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bricely_threads_staging_anon_all ON support.bricely_threads;
CREATE POLICY bricely_threads_staging_anon_all ON support.bricely_threads
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS bricely_threads_prime_all ON support.bricely_threads;
CREATE POLICY bricely_threads_prime_all ON support.bricely_threads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS bricely_thread_messages_staging_anon_all ON support.bricely_thread_messages;
CREATE POLICY bricely_thread_messages_staging_anon_all ON support.bricely_thread_messages
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS bricely_thread_messages_prime_all ON support.bricely_thread_messages;
CREATE POLICY bricely_thread_messages_prime_all ON support.bricely_thread_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON support.bricely_threads TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON support.bricely_thread_messages TO anon, authenticated, service_role;

-- Mark mock/test tickets for isolation (no customer-facing mailers)
ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS is_mock boolean NOT NULL DEFAULT false;

COMMENT ON TABLE support.bricely_threads IS 'Server source of truth for Bricely widget threads (survives close/reopen).';
COMMENT ON COLUMN support.support_tickets.is_mock IS 'Test/mock traffic — suppress real customer contact.';

NOTIFY pgrst, 'reload schema';
