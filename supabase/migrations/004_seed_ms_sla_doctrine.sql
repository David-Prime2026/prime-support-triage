-- 004 — Seed WMG contract from doctrine M&S §18/§19 + Exhibit A response targets
-- Isolated support-triage DB only. NEVER apply to WMG OS production.

UPDATE support.client_contracts
SET
  contract_version = 'M&S-WMG-v1',
  covered_scope = jsonb_build_array(
    jsonb_build_object('code', 'defect_fix', 'label', 'Troubleshooting reproducible defects / commercially reasonable bug fixes', 'section', '18'),
    jsonb_build_object('code', 'config_in_product', 'label', 'Reasonable configuration assistance', 'section', '18'),
    jsonb_build_object('code', 'security_patch', 'label', 'Security patches PRIME determines appropriate', 'section', '18'),
    jsonb_build_object('code', 'compat_update', 'label', 'Compatibility updates for supported environments', 'section', '18'),
    jsonb_build_object('code', 'third_party_coord', 'label', 'Reasonable coordination with applicable third-party providers', 'section', '18'),
    jsonb_build_object('code', 'channel_support', 'label', 'Support through PRIME designated support channels', 'section', '18'),
    jsonb_build_object('code', 'order_form_extra', 'label', 'Other services expressly identified in Order Form', 'section', '18'),
    jsonb_build_object('code', 'how_to', 'label', 'How-to / operator guidance on shipped features (channel support)', 'section', '18'),
    jsonb_build_object('code', 'login_access', 'label', 'Login / access assistance within supported Software', 'section', '18')
  ),
  excluded_scope = jsonb_build_array(
    jsonb_build_object('code', 'new_feature', 'label', 'New features', 'section', '19'),
    jsonb_build_object('code', 'redesign_rewrite', 'label', 'Product redesigns or rewrites', 'section', '19'),
    jsonb_build_object('code', 'custom_dev', 'label', 'Custom development', 'section', '19'),
    jsonb_build_object('code', 'integration_new', 'label', 'New integrations', 'section', '19'),
    jsonb_build_object('code', 'data_migration', 'label', 'Data migration or data cleanup', 'section', '19'),
    jsonb_build_object('code', 'training', 'label', 'Training', 'section', '19'),
    jsonb_build_object('code', 'consulting', 'label', 'Consulting', 'section', '19'),
    jsonb_build_object('code', 'unsupported_env', 'label', 'Support for unsupported environments', 'section', '19'),
    jsonb_build_object('code', 'customer_mod', 'label', 'Support for Customer-created modifications', 'section', '19'),
    jsonb_build_object('code', 'third_party_sw', 'label', 'Support for third-party software not controlled by PRIME', 'section', '19'),
    jsonb_build_object('code', 'after_hours', 'label', 'Emergency or after-hours services (unless Order Form)', 'section', '19'),
    jsonb_build_object('code', 'misuse', 'label', 'Issues caused by misuse', 'section', '19'),
    jsonb_build_object('code', 'bad_customer_data', 'label', 'Issues caused by inaccurate Customer Data', 'section', '19'),
    jsonb_build_object('code', 'third_party_infra', 'label', 'Issues caused by third-party AI, database, hosting, or cloud providers', 'section', '19'),
    jsonb_build_object('code', 'outside_sla', 'label', 'Services outside the SLA', 'section', '19')
  ),
  sla_terms = jsonb_build_object(
    'support_hours', 'Mon-Fri 09:00-17:00 America/New_York excluding US federal holidays',
    'support_email', 'support@prime-timesystems.com',
    'sev1_initial_response_hours', 3,
    'sev2_initial_response_hours', 24,
    'sev3_initial_response_hours', 48,
    'sev4_initial_response_business_days', 3,
    'availability_target_pct', 99.5,
    'note', 'Initial response targets only — not resolution guarantees. Doctrine: doctrine/MS_SLA_EXHIBIT_A.md'
  ),
  notes = 'Seeded from doctrine/MS_SLA_EXHIBIT_A.md (§§18–35 + Exhibit A). INTERNAL classifier use only.'
WHERE client_id = 'a1000001-0001-4001-8001-000000000001'
  AND contract_version IN ('M&S-WMG-v1-DRAFT', 'M&S-WMG-v1');

INSERT INTO support.client_contracts (
  client_id, contract_version, effective_date, covered_scope, excluded_scope, sla_terms, notes
)
SELECT
  'a1000001-0001-4001-8001-000000000001',
  'M&S-WMG-v1',
  CURRENT_DATE,
  (SELECT covered_scope FROM support.client_contracts WHERE client_id = 'a1000001-0001-4001-8001-000000000001' LIMIT 1),
  (SELECT excluded_scope FROM support.client_contracts WHERE client_id = 'a1000001-0001-4001-8001-000000000001' LIMIT 1),
  (SELECT sla_terms FROM support.client_contracts WHERE client_id = 'a1000001-0001-4001-8001-000000000001' LIMIT 1),
  'Seeded from doctrine/MS_SLA_EXHIBIT_A.md'
WHERE NOT EXISTS (
  SELECT 1 FROM support.client_contracts
  WHERE client_id = 'a1000001-0001-4001-8001-000000000001'
);
