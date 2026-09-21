# DR-012 Stage 4 GATE — Desk assign / @mention + status pipeline

**At:** 2026-09-21  
**STOP for PRIME bake** before optional Stage 5 (CONTROL_PLANE snippets on desk).

## Shipped
| Item | Behavior |
|------|----------|
| Desk assign | ENG roster + DEV/Cursor + Assign me as HITL → stored in `human_override.desk` + desk system note |
| @mention | `@eng` `@cursor` `@hitl` `@approver` chips prepend into composer |
| Status pipeline | Visual path idle→received→in_staging→preview_ready→awaiting_promote→done; **blocked** side-state |
| Role gate | Non-approvers: forward-only (+ blocked); Approvers may jump |
| Staging package | Includes `desk_assignment` alongside `desk_thread` |

## Bake
1. Hard-refresh console
2. Assign ENG + DEV/Cursor → desk notes appear (newest first)
3. @mention + post
4. Advance status one step as operator session; jump as Approver
5. Package desk → Cursor staging JSON has `desk_assignment`
