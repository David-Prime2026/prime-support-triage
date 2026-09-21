# DR-013 Stage 4 GATE — Cursor poll/watch helper

**At:** 2026-09-21  
**DR-013 COMPLETE** (Stages 0–4). Optional Stage 4 delivered as doc-only.

## Delivered
| Item | Path |
|------|------|
| Poll / watch helper | `proofs/DR-CS-PLATFORM-013/CURSOR-OUTBOX-WATCH.md` |
| Outbox README pointer | `dispatches/outbox/README.md` |

## What it covers
- One-shot `node scripts/sync-cursor-outbox.mjs`
- Status table (pending → claim → execute → mark done → human promote)
- Manual watch cadence (no unattended daemon)
- Hard stops: empty queue, never auto qcefkox

## Explicitly not built
- Background poller / Cursor Automation daemon
- Auto-claim / auto-complete
- Auto-promote to production

## Bake
Operator: sync once; confirm artifacts or `0` rows; follow watch doc on next Approve.
