# DR-011 Stage 1 GATE — Prediagnosis package + writeback

**At:** 2026-09-21  
**STOP for PRIME bake** after WMG PR merge + console Pages redeploy.

## Doctrine applied
- Bricely ≤5 Qs; asks **permission** before more intel  
- Locks **exact_issue** for ticket  
- HITL = assess + approve (console prediagnosis panel)  
- Suggested priority / lane / assignee hint on intake  
- Automations add routing_apply + low_capture digests  

## Shipped
| Surface | Change |
|---------|--------|
| WMG `feat/bricely-dr011-prediagnosis` | prediagnosis.ts · permission chips · intake payload |
| apx `intake-ticket` | **v5** stores `human_override.prediagnosis` + sets priority/ai_lane/ai_summary |
| Console | Prediagnosis panel + Automations routing suggestions |

## Prod note (DR-010)
Vercel production already on `6ffaa14` (Stage 7). This Stage is additive PR for DR-011.
