# DR-CS-PLATFORM-011 — Prediagnosis, routing writeback, Cursor within fence

**Status:** Stage 0 COMPLETE (method). Stage 1 in progress.  
**Date:** 2026-09-21  
**Authority:** PRIME GO after DR-010 close  
**Runtime:** `apx…` sole · never auto `qcefkox…`

## Doctrine (locked)

1. **Bricely owns diagnosis.** ≤5 questions to see if he can complete the task (real-time fix **within fence** / Cursor Tier A–style safe actions).  
2. **Permission:** If he needs more intel after the early pass, he **asks permission** before continuing.  
3. **Exact issue capture:** Ticket must carry a clear `exact_issue` (what’s wrong in the user’s terms) — not a vague note dump.  
4. **HITL = assess + approve.** Human gate is **not** intended to re-diagnose unless necessary. Console shows Bricely’s prediagnosis package for routing / shape / priority.  
5. **Writeback:** Assist + diagnostic → suggested `priority` + `lane` (+ optional assignee hint) on the ticket; operator confirms.  
6. **Automations:** Beyond download digests — propose routing actions into the Approve path; **never** auto-dispatch / never override Approve.  
7. **Cursor ability:** Real-time fix stays inside existing fences (liveFixes / allowlist / staging handoff). Unsure → escalate with a complete package.

## Sequencing

| Stage | What | Gate |
|-------|------|------|
| **0** | Method + doctrine (this file) | Done |
| **1** | Bricely: permission-to-continue · exact_issue · prediagnosis package on intake | PR → bake |
| **2** | Console: Prediagnosis panel · suggested priority/lane · HITL Approve without re-interview | GH Pages |
| **3** | Automations: routing proposals → Approve path (still suggest-only for dispatch) | STOP PRIME |
| **4** | Optional: expand fenced liveFixes / Cursor staging proposals from package | STOP PRIME |

## Out of scope (still)
- Live human agent desk in-chat  
- Auto-merge / auto-prod without Approve  
- Inventing money / SLA / billable in chat
