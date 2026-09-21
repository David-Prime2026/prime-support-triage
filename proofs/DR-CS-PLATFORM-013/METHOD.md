# DR-CS-PLATFORM-013 — Durable Cursor outbox + live-fix fence growth

**Status:** CLOSED — Stages 0–4 complete (GATE-4 poll/watch doc).  
**Date:** 2026-09-21  
**Authority:** PRIME GO after DR-012 (“good — next slice”) + “move to stage 3” + “next slice” Stage 4  
**Runtime:** `apx…` sole · never auto `qcefkox…`

## Why this lane
DR-012 closed the **discourse / Approve → record** loop, but the “record” was mostly a **browser JSON download**.  
Bricely can **diagnose** and **live-fix only inside a thin fence**. Hard fixes still need Cursor + staging.

This DR makes Approve → record **durable and queryable** so Cursor (or an operator pasting into Cursor) has a real outbox — still **staging-only**, still **human promote**.

## Design (aligned)
| Surface | Role |
|---------|------|
| Bricely | Diagnose + Tier-A live-fix only |
| Console desk | Discourse |
| Approve | Writes durable outbox row + desk `[RECORD]` |
| Cursor | Claims outbox · executes staging · posts findings to desk · CONTROL_PLANE on closure |
| Promote | Human only · never auto qcefkox |

## Sequencing
| Stage | What | Risk |
|-------|------|------|
| **0** | Method (this file) | None — **Done** |
| **1** | `cursor_staging_outbox` table on apx · Approve / Package insert · console “Pending for Cursor” queue · claim / complete buttons | Low — **Done · GATE-1** |
| **2** | No-download artifacts (repo sync) · ticket color coding (resolved inactive) | Low — **Done · GATE-2** |
| **3** | Expand Bricely live-fix allowlist (PRIME-ratified list only — additive) | Med — **Done · GATE-3** |
| **4** | Optional: poll/watch helper doc for Cursor agents | Low — **Done · GATE-4** |

**Closeout:** `CLOSEOUT.md`

## Guardrails
- Augment — do not rewrite Bricely customer path  
- No unattended production merges  
- Unsure → escalate / ask PRIME  
- Kill switch / never auto qcefkox  
