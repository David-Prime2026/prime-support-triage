# DR-010 / next slice — Stage 7 proposal (honest disclosure + comprehension)

**Status:** PROPOSED — STOP for PRIME **GO Stage 7**  
**At:** 2026-09-21  
**Basis:** PR #9 bake PASS (page-aware intro). PRIME: open AI disclosure missing; do not confuse context chips with comprehension.

## Charter we already have (diluted in prod)

**Posture:** `honest_ai_intro` in `config/catch-net-posture.json`  
**Original customer-facing charter (DR-BRICELY-001 era):**

> I'm Bricely, your WMG AI assistant. If it's easy I may be able to fix it right now — I'll ask a few questions to see if it's in my capabilities. If I can't, I'll escalate into a ticket and determine urgency.

**What shipped after soft UX:** short page-aware line (`You're on Command Center. What's going on?`) + tiny footer (`AI assistant · keep going or open ticket…`). Footer is not the open disclosure.

**Keep:** page context, no yes-gate (“Does that work for you?” stays gone).  
**Restore:** AI identity + real-time help + ask-questions / ticket honesty in the **first bubble**.

## Proposed Stage 7 (two tracks — do not merge claims)

| Track | What | Not |
|-------|------|-----|
| **7a — Honest intro (P0)** | Merge charter into `bricelyIntroForPage` / `BRICELY_INTRO` | Not LLM comprehension |
| **7b — Claude assist (P1 / G3)** | Enable fenced assist (`VITE_BRICELY_CLAUDE_ASSIST=1` + URL) behind diagnostic state machine; fallback = regex | Not “auto-dispatch”; never invent money/scope/SLA |

## Explicit honesty line (do not blur)

- **7a alone** = clearer disclosure + context wrapping. Testers may still feel canned.  
- **Comprehension solved** only when **7b** is ON and bake-proven.

## Guardrails unchanged
- Never auto-deploy `qcefkox…`
- Kill switch / unsure→escalate
- Augment not rewrite

## GO shape
Reply **GO Stage 7a** (disclosure only) or **GO Stage 7** (7a + 7b plan/wire) or **GO 7b only**.
