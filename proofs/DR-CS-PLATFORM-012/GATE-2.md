# DR-012 Stage 2 GATE — Desk → Cursor staging + status flip fix

**At:** 2026-09-21  
**STOP for PRIME bake** before Stage 3 (resolve→notify requester).

## Fix (status flip)
- Root cause: `ticket_events.actor_check` rejected `cursor` → flip aborted after DB update
- Fixed: actor allowlist includes `cursor`/`eng`; UI updates even if audit event is soft-fail

## Stage 2 shipped
| Item | Behavior |
|------|----------|
| Desk → Cursor | Staging JSON includes full `desk_thread` (HITL/ENG/Cursor notes on ticket) |
| Package button | **Package desk → Cursor staging** downloads enriched proposal + marks outbox on desk |
| Approve | Same: desk thread rides on dispatch + cursor-staging JSON; status → `received` |
| Billable | **Billable: request hours → re-approve** → CO draft + desk note + `awaiting_approval` |

## Doctrine reminder
- Dialogue stays captured on the ticket (`ticket_messages` channel=`admin`)
- Cursor executes from the package / CONTROL_PLANE — console does not invent fixes
- Never auto `qcefkox…`

## Bake
1. Hard-refresh console
2. Flip status chips (idle → in_staging) — must stick + desk line appears
3. Post HITL note → **Package desk → Cursor staging** → JSON has `desk_thread`
4. Optional: **Billable: request hours → re-approve**
