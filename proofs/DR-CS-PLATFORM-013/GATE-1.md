# DR-013 Stage 1 GATE — Durable Cursor staging outbox

**At:** 2026-09-21  
**STOP for PRIME bake** before Stage 2 polish / Stage 3 live-fix expansion.

## Shipped
| Item | Behavior |
|------|----------|
| Table | `support.cursor_staging_outbox` on apx |
| Approve / Package | Inserts durable `pending` row + desk `[RECORD]` + JSON download |
| Console | **Cursor outbox** module — Claim / Mark done / Download / Open ticket |
| Claim | Desk ack + ticket `in_staging` + proposal download |
| Complete | Desk note + ticket `awaiting_promote` (human still owns promote) |

## Bake
1. Hard-refresh console
2. Approve (or Package) a ticket → row appears under **Cursor outbox**
3. Claim → desk shows Cursor claimed; status in_staging
4. Mark done → awaiting_promote
5. Confirm never touches qcefkox
