# Outbox for Handoff B (Cursor dispatch)

**Mechanism:** flat-file first. Payload shape matches the future webhook/API.

**Watched dir (repo-relative):** `support-triage/dispatches/outbox`  
**[PRIME TO CONFIRM]** absolute path on production/operator hosts.

## File naming
`dispatch-<ticketOrCoId>-<timestamp>.json`

## Guardrails (every payload)
- `target_environment = WMG_OS_STAGING`
- `production_ref_forbidden = qcefkoxqkfwnlqfmwzmi`
- Require `staging_preview_url` before promotion
- Never auto-merge / never target production

Operator flow: Approve in navy console → browser downloads JSON → drop into this folder (or future watcher/API).
