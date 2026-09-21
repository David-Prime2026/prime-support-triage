# DR-012 Stage 1 GATE — Cursor desk (console discourse)

**At:** 2026-09-21  
**STOP for PRIME bake** before Stage 2 (staging outbox wire) and especially before Stage 3 (resolve→notify).

## Design intent — confirmed
| Surface | Role |
|---------|------|
| Triage console | HITL / DEV / ENG discourse (admin) |
| Cursor | Reads code/schema/PRs · executes staging · CONTROL_PLANE |
| Approve / promote | Human; never auto `qcefkox…` |

## Shipped (Stage 1 thin vertical)
| Item | Status |
|------|--------|
| `ticket_messages.author_role` includes `cursor` / `eng` | Live (prior migration `dr012_cursor_desk_roles`) |
| `support_tickets.cursor_execution_status` | Live (`dr012_cursor_execution_status`) |
| Console **Cursor desk** panel | Post as HITL / ENG / Cursor note; status chips; loads `channel=admin` |
| Auto-exec / notify requester | **Not in Stage 1** |

## Bake checklist
1. Open https://david-prime2026.github.io/prime-support-triage/
2. Select a live ticket → see **Cursor desk · HITL / DEV / ENG**
3. Post a HITL note → row appears in desk thread
4. Click a status (e.g. `received`) → status chip + Cursor desk line
5. Confirm customer Bricely path unchanged

## Explicitly NOT next without GO
- Stage 2: desk → Cursor staging outbox pickup
- Stage 3: resolve → notify requester via Bricely
