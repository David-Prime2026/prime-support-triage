# DR-013 Stage 2 GATE — No-download artifacts + ticket color coding

**At:** 2026-09-21  
**STOP for PRIME bake** before Stage 3 (live-fix allowlist expansion).

## Shipped
| Item | Behavior |
|------|----------|
| No forced download | Approve / Queue / Claim / Resolve no longer auto-download JSON |
| Artifacts | Durable apx outbox + `node scripts/sync-cursor-outbox.mjs` → `dispatches/outbox/` |
| Command plane | This Cursor exchange / sync script — console is discourse + Approve |
| Color coding | Left bar + tint: amber=awaiting, cyan=dispatched, rose=P1, violet=ambiguous; **resolved muted/struck** |
| Export | Optional “Export copy” remains on outbox cards only |

## Bake
1. Hard-refresh — resolved tickets look inactive
2. Approve a ticket — no download prompt; row in Cursor outbox
3. Run `node scripts/sync-cursor-outbox.mjs` — files appear under `dispatches/outbox/`
