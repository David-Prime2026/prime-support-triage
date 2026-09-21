-- FIX-C — Schema API grants + open-item test seed (DR-CS-PLATFORM-001)
-- Isolated support-triage DB ONLY. NEVER apply to WMG OS production.
--
-- Root cause of "Invalid schema: support":
-- After a hand-recovery wipe, tables existed but GRANT USAGE on schema `support`
-- was never restored for anon (console uses VITE anon key). PostgREST then
-- rejects Accept-Profile: support. Do not hand-apply migrations as normal practice;
-- prefer `supabase db reset` / `migration up` on this isolated stack.

-- ---------------------------------------------------------------------------
-- 1) Restore schema/table/function privileges for API roles
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA support TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA support
  TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA support
  TO anon, authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA support
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA support
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA support
  GRANT USAGE, SELECT ON SEQUENCES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA support
  GRANT EXECUTE ON FUNCTIONS
  TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2) Staging console policies (anon key, no operator JWT yet)
-- Phase 1 local preview only — isolate from production.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS tickets_staging_anon_all ON support.support_tickets;
CREATE POLICY tickets_staging_anon_all ON support.support_tickets
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS events_staging_anon_all ON support.ticket_events;
CREATE POLICY events_staging_anon_all ON support.ticket_events
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS handoffs_staging_anon_all ON support.engineering_handoffs;
CREATE POLICY handoffs_staging_anon_all ON support.engineering_handoffs
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS change_orders_staging_anon_all ON support.change_order_drafts;
CREATE POLICY change_orders_staging_anon_all ON support.change_order_drafts
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS clients_staging_anon_all ON support.clients;
CREATE POLICY clients_staging_anon_all ON support.clients
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS contracts_staging_anon_all ON support.client_contracts;
CREATE POLICY contracts_staging_anon_all ON support.client_contracts
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allowlist_staging_anon_all ON support.auto_resolve_allowlist;
CREATE POLICY allowlist_staging_anon_all ON support.auto_resolve_allowlist
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS operators_staging_anon_all ON support.prime_operators;
CREATE POLICY operators_staging_anon_all ON support.prime_operators
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Phase 2 stub tables — enable RLS + anon staging access
ALTER TABLE support.retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.pii_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support.ai_disclosures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS retention_staging_anon_all ON support.retention_policies;
CREATE POLICY retention_staging_anon_all ON support.retention_policies
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pii_staging_anon_all ON support.pii_flags;
CREATE POLICY pii_staging_anon_all ON support.pii_flags
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS access_log_staging_anon_all ON support.access_log;
CREATE POLICY access_log_staging_anon_all ON support.access_log
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS dsr_staging_anon_all ON support.data_subject_requests;
CREATE POLICY dsr_staging_anon_all ON support.data_subject_requests
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ai_disc_staging_anon_all ON support.ai_disclosures;
CREATE POLICY ai_disc_staging_anon_all ON support.ai_disclosures
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3) Open-item test path (FIX-C §3) — genuine OPEN tickets for triage loop
-- ---------------------------------------------------------------------------
INSERT INTO support.support_tickets (
  id, client_id, requester_name, requester_email, source_channel, raw_message,
  ai_summary, ai_category, ai_risk_tier, ai_lane, ai_billable, ai_confidence,
  ai_suggested_action, ai_contract_clause_ref, ai_reasoning,
  status, priority, escalation_flag, diagnosis_summary, surface,
  assigned_to, human_override, created_at, updated_at
)
VALUES
  (
    'c1000001-0001-4001-8001-000000000001',
    'a1000001-0001-4001-8001-000000000001',
    'PRIME Test Operator',
    'david@primeai.systems',
    'manual',
    'OPEN-TEST-001: Seller cannot submit a load request — Save fails with a red banner. Need triage → approve → dispatch path verified.',
    'OPEN-TEST-001 — Seller load Save failure (staging test)',
    'defect',
    'high',
    'needs_approval',
    false,
    0.88,
    'Reproduce on seller portal; if confirmed defect in delivered scope, Approve → Handoff B to staging.',
    'M&S §18 — Covered (defect)',
    'Seeded open item for FIX-C triage loop proof.',
    'awaiting_approval',
    'P2',
    true,
    'Bricely (seed): Save on load request returns error after multi-commodity select. Likely related to BUG-001 class; confirm before dispatch.',
    'seller_portal',
    NULL,
    jsonb_build_object('test_id', 'OPEN-TEST-001', 'source', 'fix-c-open-seed'),
    now() - interval '45 minutes',
    now() - interval '45 minutes'
  ),
  (
    'c1000001-0001-4001-8001-000000000002',
    'a1000001-0001-4001-8001-000000000001',
    'Ops UAT',
    NULL,
    'manual',
    'OPEN-TEST-002: Manual ticket with NO Bricely diagnosis — operator must still prioritize and approve.',
    'OPEN-TEST-002 — Diagnosis-less manual open item',
    'how_to',
    'medium',
    'needs_approval',
    false,
    NULL,
    'Operator to classify; diagnosis optional for manual path.',
    'M&S §18 — Channel support',
    'Seeded diagnosis-less open item.',
    'new',
    'P3',
    false,
    NULL,
    'internal',
    NULL,
    jsonb_build_object('test_id', 'OPEN-TEST-002', 'source', 'fix-c-open-seed', 'diagnosis', 'none'),
    now() - interval '20 minutes',
    now() - interval '20 minutes'
  ),
  (
    'c1000001-0001-4001-8001-000000000003',
    'a1000001-0001-4001-8001-000000000001',
    'Alisa (test)',
    NULL,
    'widget',
    'OPEN-TEST-003: P1 escalated — buyer cannot see assigned loads after accept.',
    'OPEN-TEST-003 — Buyer visibility P1 (staging test)',
    'defect',
    'high',
    'needs_approval',
    false,
    0.91,
    'Escalate P1; Approve → dispatch if reproducible.',
    'M&S §18 — Covered (defect)',
    'Seeded P1 open item for priority + breach-window UI.',
    'awaiting_approval',
    'P1',
    true,
    'Bricely (seed): Buyer primary role missing assigned load row after accept. Check distribution vs primary assignment.',
    'buyer_portal',
    NULL,
    jsonb_build_object('test_id', 'OPEN-TEST-003', 'source', 'fix-c-open-seed'),
    now() - interval '2 hours',
    now() - interval '2 hours'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  diagnosis_summary = EXCLUDED.diagnosis_summary,
  raw_message = EXCLUDED.raw_message,
  ai_summary = EXCLUDED.ai_summary,
  updated_at = now(),
  resolved_at = NULL;

NOTIFY pgrst, 'reload schema';
