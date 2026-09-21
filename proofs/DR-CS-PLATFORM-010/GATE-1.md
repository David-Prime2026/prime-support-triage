# DR-010 Stage 1 GATE — apx schema + functions ready (no data move)

**At:** 2026-09-21  
**STOP for PRIME before Stage 2 (ticket data restore / env cutover)**

## Method confirmed (Stage 0)
- `rxhiyd` = Supabase branch `staging` of parent `apx`
- `merge_branch` = schema/functions only — **failed** on parent (`MIGRATIONS_FAILED`); did **not** move data
- Preservation path: baseline inventory + later **data dump/restore with same UUIDs** (CLI `db dump --data-only` preferred when password available; MCP `execute_sql` export/import confirmed fallback)
- Baseline: `BASELINE-TICKETS.json` — **24** tickets on rxhiyd (still intact)

## Stage 1 done on `apxbwdxszmdffbduhjen`
| Item | Status |
|------|--------|
| `support` schema + 18 tables | **YES** |
| WMG client seed | **YES** (1 client) |
| Tickets on apx | **0** (correct — data not moved yet) |
| Edge: `intake-ticket` | **ACTIVE** (`verify_jwt: false`) |
| Edge: `bricely-thread` | **ACTIVE** |
| Edge: `approve-handoff` | **ACTIVE** |
| Live catch-net | **Still on rxhiyd** (24 tickets untouched) |

## Not done (needs PRIME GO)
- **Stage 2:** Copy all support rows (tickets/messages/events/threads/…) rxhiyd → apx; verify every baseline ID
- **Stage 3:** Flip Vercel `VITE_BRICELY_*` + console + posture to apx URLs
- **Stage 4:** Retire rxhiyd from runtime doctrine
- **Stage 5–6:** PR #8 Bricely + soft offramp + Claude assist + console page_context + Automations bolt-on

## Ask PRIME
Reply **GO Stage 2** to authorize ticket data restore onto apx (rxhiyd remains backup until Stage 3 smoke).  
Do **not** flip production env until Stage 2 counts match.
