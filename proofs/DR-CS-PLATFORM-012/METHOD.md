# DR-CS-PLATFORM-012 — Console Cursor desk (HITL / DEV / ENG → Cursor execution)

**Status:** Stage 1 COMPLETE — GATE-1 for PRIME bake. **STOP before Stage 2/3.**  
**Date:** 2026-09-21  
**Authority:** PRIME GO (design-aligned; do not rush)  
**Runtime:** `apx…` sole · never auto `qcefkox…`

## Design intent — CONFIRMED ALIGNED

| Surface | Role |
|---------|------|
| **Bricely (customer)** | Prediagnosis · ≤5 Qs · permission · exact_issue · real-time fix **within fence** · escalate with package |
| **Triage console (admin)** | HITL assess/approve · optional DEV/ENG discourse · **not** customer chat |
| **Cursor** | Reads code / schema / PRs · executes **staging** · updates **CONTROL_PLANE** · returns status |
| **Approve gate** | Human still owns promote / production; Cursor never auto-deploys `qcefkox…` |

This matches DR-BRICELY / DR-010–011 doctrine: console = operator face; Cursor = execution; CONTROL_PLANE = system of record; staging-first fence.

### What we are **not** building in this DR
- Customer-facing live agent desk inside Bricely  
- Unattended production merges  
- Replacing Approve with auto-dispatch  

### Gap vs today (honest)
Today: Approve → download JSON → human/Cursor async.  
Target: **in-console discourse** (HITL/DEV/ENG notes + Cursor status) that still **executes via Cursor** against repo/schema/PRs and CONTROL_PLANE — not a second chat engine inventing fixes in the browser.

## Sequencing (separable; stop between stages)

| Stage | What | Risk |
|-------|------|------|
| **0** | Method + alignment (this file) | None — **Done** |
| **1** | Ticket-linked **Cursor desk** thread: operator notes + Cursor status events (apx tables + console panel). Still no auto-exec. | Low — **Done · GATE-1** |
| **2** | Wire desk → **staging proposal** / outbox (reuse `cursor_staging_proposal`); Cursor agent picks up or operator pastes | Low |
| **3** | Resolve → **notify requester** via Bricely thread message (exact_issue resolved). Email later optional. | Med (user-visible) |
| **4** | DEV/ENG roles on desk (assign, @mention) + richer status machine (`received` → `in_staging` → `preview_ready` → `awaiting_promote`) | Med |
| **5** | Optional: Cursor posts CONTROL_PLANE snippets back into desk on closure | Low |

**STOP for PRIME bake after Stage 1 and again before Stage 3 (user notification).**

## Guardrails
- Augment console; do not rewrite Bricely customer path  
- Unsure → escalate / ask PRIME  
- Kill switch / never auto qcefkox  
- HITL assess+approve remains; desk is for execution coordination, not re-diagnosing high-confidence captures
