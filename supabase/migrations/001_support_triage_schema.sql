-- 001 — PRIME Support Triage schema (isolated app schema: support)
-- NEVER apply against WMG OS production project.

CREATE SCHEMA IF NOT EXISTS support;

CREATE TABLE IF NOT EXISTS support.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  system_name text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'offboarded')),
  knowledge_base_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.client_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  contract_version text NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  covered_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  excluded_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  sla_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS client_contracts_client_version_uidx
  ON support.client_contracts (client_id, contract_version);

CREATE TABLE IF NOT EXISTS support.auto_resolve_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES support.clients (id) ON DELETE CASCADE,
  request_type text NOT NULL,
  canned_response_template text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS auto_resolve_allowlist_scope_type_uidx
  ON support.auto_resolve_allowlist (COALESCE(client_id, '00000000-0000-0000-0000-000000000000'::uuid), request_type);

CREATE TABLE IF NOT EXISTS support.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE RESTRICT,
  requester_name text,
  requester_email text,
  source_channel text NOT NULL
    CHECK (source_channel IN ('widget', 'email', 'manual')),
  raw_message text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_summary text,
  ai_category text,
  ai_risk_tier text CHECK (ai_risk_tier IS NULL OR ai_risk_tier IN ('low', 'medium', 'high')),
  ai_lane text CHECK (
    ai_lane IS NULL OR ai_lane IN ('auto_resolve', 'needs_approval', 'billable', 'ambiguous')
  ),
  ai_billable boolean,
  ai_confidence numeric(4,3) CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1)),
  ai_suggested_action text,
  ai_contract_clause_ref text,
  ai_reasoning text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN (
      'new', 'ai_processing', 'auto_resolved', 'awaiting_approval',
      'billable_review', 'approved', 'sent_to_engineering',
      'in_progress', 'resolved', 'closed', 'reopened'
    )),
  assigned_to text,
  linked_account text,
  human_override jsonb,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS support_tickets_client_status_idx
  ON support.support_tickets (client_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_lane_idx
  ON support.support_tickets (ai_lane, status);

CREATE TABLE IF NOT EXISTS support.engineering_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support.support_tickets (id) ON DELETE CASCADE,
  structured_issue jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by text,
  approved_at timestamptz,
  cursor_dispatch_status text NOT NULL DEFAULT 'pending'
    CHECK (cursor_dispatch_status IN ('pending', 'dispatched', 'acked', 'done', 'failed')),
  cursor_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.change_order_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support.support_tickets (id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES support.clients (id) ON DELETE CASCADE,
  description text NOT NULL,
  rationale text NOT NULL,
  contract_clause_ref text,
  estimated_scope text,
  estimated_hours numeric(8,2),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support.support_tickets (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor text NOT NULL CHECK (actor IN ('ai', 'operator', 'system')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_events_ticket_idx
  ON support.ticket_events (ticket_id, created_at);

CREATE TABLE IF NOT EXISTS support.prime_operators (
  user_id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION support.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_tickets_touch ON support.support_tickets;
CREATE TRIGGER support_tickets_touch
  BEFORE UPDATE ON support.support_tickets
  FOR EACH ROW EXECUTE FUNCTION support.touch_updated_at();

CREATE OR REPLACE FUNCTION support.log_ticket_event(
  p_ticket_id uuid,
  p_event_type text,
  p_actor text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = support, public
AS $$
  INSERT INTO support.ticket_events (ticket_id, event_type, actor, payload)
  VALUES (p_ticket_id, p_event_type, p_actor, coalesce(p_payload, '{}'::jsonb));
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE support.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.client_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.auto_resolve_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.engineering_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.change_order_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.prime_operators ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION support.is_prime_operator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = support, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM support.prime_operators po
    WHERE po.user_id = auth.uid() AND po.is_active
  );
$$;

CREATE OR REPLACE FUNCTION support.client_id_for_jwt()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = support, public
AS $$
  SELECT nullif(auth.jwt() ->> 'support_client_id', '')::uuid;
$$;

-- PRIME operators: full read/write across tenants
-- Client JWT claim support_client_id: read own tickets only (future portal)

DROP POLICY IF EXISTS clients_prime_all ON support.clients;
CREATE POLICY clients_prime_all ON support.clients
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS contracts_prime_all ON support.client_contracts;
CREATE POLICY contracts_prime_all ON support.client_contracts
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS allowlist_prime_all ON support.auto_resolve_allowlist;
CREATE POLICY allowlist_prime_all ON support.auto_resolve_allowlist
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS tickets_prime_all ON support.support_tickets;
CREATE POLICY tickets_prime_all ON support.support_tickets
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS tickets_client_read ON support.support_tickets;
CREATE POLICY tickets_client_read ON support.support_tickets
  FOR SELECT TO authenticated
  USING (
    NOT support.is_prime_operator()
    AND client_id = support.client_id_for_jwt()
  );

DROP POLICY IF EXISTS handoffs_prime_all ON support.engineering_handoffs;
CREATE POLICY handoffs_prime_all ON support.engineering_handoffs
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS change_orders_prime_all ON support.change_order_drafts;
CREATE POLICY change_orders_prime_all ON support.change_order_drafts
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS events_prime_all ON support.ticket_events;
CREATE POLICY events_prime_all ON support.ticket_events
  FOR ALL TO authenticated
  USING (support.is_prime_operator())
  WITH CHECK (support.is_prime_operator());

DROP POLICY IF EXISTS events_client_read ON support.ticket_events;
CREATE POLICY events_client_read ON support.ticket_events
  FOR SELECT TO authenticated
  USING (
    NOT support.is_prime_operator()
    AND EXISTS (
      SELECT 1 FROM support.support_tickets t
      WHERE t.id = ticket_id AND t.client_id = support.client_id_for_jwt()
    )
  );

DROP POLICY IF EXISTS operators_self_read ON support.prime_operators;
CREATE POLICY operators_self_read ON support.prime_operators
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR support.is_prime_operator());

-- service_role bypasses RLS by default in Supabase
-- Local Phase 1 console uses the anon key (no operator JWT yet).

GRANT USAGE ON SCHEMA support TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA support TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA support TO anon, authenticated;
GRANT EXECUTE ON FUNCTION support.is_prime_operator() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION support.client_id_for_jwt() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION support.log_ticket_event(uuid, text, text, jsonb) TO service_role, authenticated, anon;

-- Expose via API (local config also lists support schema)
NOTIFY pgrst, 'reload schema';
