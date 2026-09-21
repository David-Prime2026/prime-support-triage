# DR-012 Stage 5 GATE — CONTROL_PLANE snippet on desk closure

**At:** 2026-09-21  
**STOP for PRIME bake** — then DR-012 may close.

## Shipped
| Item | Behavior |
|------|----------|
| Closure snippet | On **Resolve → notify** and on status → **done**, Cursor posts `[CONTROL_PLANE · closure]` into desk chat |
| Download | Companion JSON `control-plane-closure-*.json` for SoR / paste into CONTROL_PLANE |
| Doctrine | Desk = discourse; Approve = record work package; Closure = CONTROL_PLANE snippet returns to desk |

## Bake
1. Hard-refresh
2. Open a ticket → advance or Resolve
3. Confirm newest desk line is `[CONTROL_PLANE · closure]` with ticket / exact_issue / fence
4. Confirm JSON download
