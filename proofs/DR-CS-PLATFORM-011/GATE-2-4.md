# DR-011 Stages 2–4 GATE — Automations→Approve + Cursor staging

**At:** 2026-09-21  
**Accelerated** after PRIME GO.

## Delivered

| Stage | Outcome |
|-------|---------|
| **2** | Prediagnosis panel: **Accept Bricely routing** + Approve labeled **Accept routing → Approve → Cursor staging** |
| **3** | Automations: Open first ticket · **Apply routing (batch ≤20)** for `routing_apply` · still never auto-dispatch |
| **4** | `cursor_staging_proposal` JSON (fence: staging only, never qcefkox) on Approve + download from panel |

## HITL unchanged
Assess + Approve. Re-diagnose only if capture confidence is low. Cursor executes in **staging** after Approve.

## Operator path
1. Automations → Open / Apply routing  
2. Ticket → Accept Bricely routing (optional if Approve applies it)  
3. Approve → downloads dispatch + `cursor-staging-*.json` for outbox / Cursor
