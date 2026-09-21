# DR-CS-PLATFORM-010 — Method & sequencing (Cursor)

**Status:** Stage 0 COMPLETE — preservation method CONFIRMED. Stage 1 in progress (schema on apx). **STOP before data cutover / env promotion.**  
**Date:** 2026-09-21

## Chosen method (cutover-first, separable)

| Stage | What | Risk to live catch-net | Gate |
|-------|------|------------------------|------|
| **0** | Confirm preservation; baseline inventory | None | Done |
| **1** | Apply support schema + seeds to **apx** (empty → ready). Deploy edge fns to apx. **rxhiyd stays live.** | None | Verify schema on apx |
| **2** | Full `support` **data** archive from rxhiyd → restore to apx; count-verify | None (rxhiyd unchanged) | **STOP — PRIME** before env flip |
| **3** | Point Vercel + console + catch-net-posture at apx; smoke new intake | Brief dual-write window avoided — hard cut with rxhiyd kept as read backup | **STOP — PRIME** |
| **4** | Doctrine: apx = true host; rxhiyd retired from runtime (branch may remain as archive) | Low | CONTROL_PLANE pin |
| **5** | Bricely PR #8 + soft continue/ticket + optional Claude assist behind fence | App-only | **STOP — PRIME** merge |
| **6** | Console shows page_context/diagnosis; Cursor Automations **suggest-only** bolt-on (feeds dispatch, never overrides) | Low | After cutover |

**Why cutover-first:** Guardrail requires migration verifiable and separable from new-feature work. Bricely polish on PR #8 does not depend on apx, but **doctrine** does — fix authority before claiming Cursor CS bolt-ons on the “authoritative” host.

## Ticket preservation — CONFIRMED (do not use merge alone)

### What is NOT enough
- Supabase **`merge_branch`**: merges **migrations + edge functions only** — **does not move row data**. Confirmed via tool description + branching model (`rxhiyd` = branch `staging` of parent `apx`).

### What we use (verified tooling exists)
1. **Baseline inventory** (IDs + counts) frozen in this folder — `BASELINE-TICKETS.json`
2. **Full data archive** before restore: `supabase db dump --data-only --schema support` from linked `rxhiyd` **OR** MCP `execute_sql` → JSON export of all `support.*` tables (CLI dump preferred when DB password available; MCP export is confirmed fallback)
3. **Schema on apx** via repo migrations (`apply_migration` / `db push`) — Stage 1
4. **Restore** into apx with identity-preserving inserts (same UUIDs)
5. **Verify:** row counts + every baseline ticket `id` present on apx
6. **rxhiyd left intact** until Stage 3 smoke passes (rollback = keep old env URLs)

### Baseline counts (2026-09-21, live rxhiyd)
| Table | n |
|-------|---|
| support_tickets | **24** (was ~23 in reconcile; +1 since) |
| ticket_messages | 40 |
| ticket_events | 22 |
| ticket_attachments | 1 |
| engineering_handoffs | 1 |
| bricely_threads | 6 |
| bricely_thread_messages | 10 |
| clients | 1 |

Of 24 tickets: mix of `is_mock=true` seeds/tests and `is_mock=false` real catch-net. **All preserved.**

## Cursor native CS (G4) — bolt-on plan (after Stage 3)
- **Augment:** Cursor Automations (DR-009 posture) as **suggest-only** digests / stale-ticket nudges → write into `dispatches/outbox` / CONTROL_PLANE notes
- **Never:** auto-approve outside Lane 1 LOOK; never override fence; never touch qcefkox
- Bricely remaining the customer face; Automations feed **operator/console** side

## Explicit non-goals this DR
- No Look-only string demos
- No rewrite of intake/console/fences
- No autonomous qcefkox touch
