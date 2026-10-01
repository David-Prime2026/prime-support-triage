# Support Triage / CS Platform — status

| Area | State | Notes |
|------|-------|-------|
| Desk `ticket_number` | **on `main` + `gh-pages`** | PR #11 / `4099360`. Hosted `332950f`. List, Find, detail read `ticket_number`. Do not re-apply SQL. |
| DR-015 | **IN FORCE** | Support ship rules. Completeness = this repo + `main`. Deploy = `apxbwdxszmdffbduhjen`. Nested `wmg-backend/support-triage` is a freeze. |
| Backlog | **DRAINED** | 0 awaiting_approval. 329 / 7b80 / af441 closed. Open: `9f2ca521` (live F$ + diagnose behind), `08a999c0` (reassign drop-in pushed, unproven live), `5dc41a1a` (code live; Alisa example draft) |
| DR-010 | **CLOSED** | Stages 0–7 |
| DR-011 | **CLOSED** | Prediagnosis + routing + staging JSON |
| DR-012 | **CLOSED** | Desk discourse · Approve record · Resolve notify |
| DR-013 | **CLOSED** | Durable outbox · live-fix SF1–SF5 · Cursor watch doc |
| DR-008 | **LIVE diagnose on apx (A done)** | Skip five-line LIVE PASS. Widget `F$` catch still on Wmsosv2 (B). |
| Bricely Gmail | **Designated intake in this repo** | `bricely@prime-timesystems.com` → `apxbwdx` only. Never WMG inbound-email / SendGrid. Support sends; operator does not. |
| Bricely | **LIVE on support project** | Diagnose + intake on `apxbwdxszmdffbduhjen`. Widget wiring is operator Wmsosv2. |
| Knowledge Base | **HITL seed** | Promote on Resolve → `knowledge_base_refs`; search/SOP UI deferred |
| Console | **LIVE** | Hosted `gh-pages` `332950f` (2026-10-01) from `main` `4099360`. Asset `index-Dsjhl9ii.js` reads `ticket_number`. |
| HITL | **Assess + Approve** | Approver session gated |
| Full auto-dispatch / qcefkox | **HELD** | Never autonomous |

## Production guard
Never `db push` / `apply_migration` / `deploy_edge_function` against `qcefkoxqkfwnlqfmwzmi`.

## FLAG — schema
CS schema stays on the isolated support project. Not applied to WMG OS production.

## Phase 2 (CS repo — maturation)
Notes, SLA, COs on this repo. CS `main` already has the stack (#8, desk #11). Nothing else to merge from the jessica / #9 lane. Drafts #1–#6, #10 left alone. Remaining live WMG work is `handoffs/BACKEND-REQUESTS/WMG-CURRENT-STATE.md`. `email-intake` is **parked** — Bricely owns mail. Alisa split-load draft unsent until PRIME says send. This VM stays git-only.
