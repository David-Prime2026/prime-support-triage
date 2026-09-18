-- 003 — Phase 1 CS platform schema extensions (DR-CS-PLATFORM-001)
-- Isolated support-triage DB ONLY. NEVER apply to WMG OS production (qcefkoxqkfwnlqfmwzmi).
-- FLAG: schema change in support-triage staging DB (not WMG OS).

-- Priority + escalation + diagnosed context on tickets
ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS priority text
    CHECK (priority IS NULL OR priority IN ('P1', 'P2', 'P3', 'P4'));

ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS escalation_flag boolean NOT NULL DEFAULT false;

ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS diagnosis_summary text;

ALTER TABLE support.support_tickets
  ADD COLUMN IF NOT EXISTS surface text;

COMMENT ON COLUMN support.support_tickets.priority IS 'P1–P4 basic priority (Phase 1 catch-net)';
COMMENT ON COLUMN support.support_tickets.diagnosis_summary IS 'Bricely diagnostic context before routing';

-- Dedicated attachment rows (image|pdf), untrusted data, tenant-scoped via ticket
CREATE TABLE IF NOT EXISTS support.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support.support_tickets (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('image', 'pdf', 'other')),
  file_name text NOT NULL,
  storage_ref text,
  vision_analysis_summary text,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_attachments_ticket_idx
  ON support.ticket_attachments (ticket_id, created_at);

-- Conversation thread storage (Phase 1 stores; Phase 2 surfaces rich thread / rep-takeover)
CREATE TABLE IF NOT EXISTS support.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support.support_tickets (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  author_role text NOT NULL CHECK (author_role IN ('customer', 'bricely', 'rep', 'system')),
  channel text NOT NULL DEFAULT 'widget'
    CHECK (channel IN ('widget', 'email', 'admin', 'system')),
  body text NOT NULL,
  attachment_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_idx
  ON support.ticket_messages (ticket_id, created_at);

-- Knowledge base refs per tenant (Phase 1 stub table)
CREATE TABLE IF NOT EXISTS support.knowledge_base_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  title text NOT NULL,
  source_path text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 2 compliance stubs (designed now; unused in Phase 1)
CREATE TABLE IF NOT EXISTS support.retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES support.clients (id) ON DELETE CASCADE,
  policy_name text NOT NULL,
  retention_days integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.pii_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  record_type text NOT NULL,
  record_id uuid NOT NULL,
  flag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  actor text NOT NULL,
  action text NOT NULL,
  resource text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('export', 'delete')),
  status text NOT NULL DEFAULT 'open',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.ai_disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES support.clients (id) ON DELETE CASCADE,
  surface text,
  disclosed_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE support.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.knowledge_base_refs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ticket_attachments_prime_all ON support.ticket_attachments;
CREATE POLICY ticket_attachments_prime_all ON support.ticket_attachments
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ticket_messages_prime_all ON support.ticket_messages;
CREATE POLICY ticket_messages_prime_all ON support.ticket_messages
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS kb_refs_prime_all ON support.knowledge_base_refs;
CREATE POLICY kb_refs_prime_all ON support.knowledge_base_refs
  FOR ALL USING (true) WITH CHECK (true);
