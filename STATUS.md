# Support Triage / CS Platform — status

| Area | State | Notes |
|------|-------|-------|
| DR-015 | **IN FORCE** | Support ship rules. Completeness = this repo + `main`. Deploy = `apxbwdxszmdffbduhjen`. Nested `wmg-backend/support-triage` is a freeze. |
| Backlog | **DRAINING** | 2026-09-28 retire smoke/duplicates. Remaining WMG: `handoffs/BACKEND-REQUESTS/WMG-CURRENT-STATE.md` |
| DR-010 | **CLOSED** | Stages 0–7 |
| DR-011 | **CLOSED** | Prediagnosis + routing + staging JSON |
| DR-012 | **CLOSED** | Desk discourse · Approve record · Resolve notify |
| DR-013 | **CLOSED** | Durable outbox · live-fix SF1–SF5 · Cursor watch doc |
| DR-008 | **POLICY + live contract in this repo** | Comprehension-led diagnose; ~5-turn target + continue-or-ticket. Diagnose 200 is not a live widget. |
| Bricely Gmail | **Designated intake in this repo** | `bricely@prime-timesystems.com` → `apxbwdx` only. Never WMG inbound-email / SendGrid. Support sends; operator does not. |
| Bricely | **LIVE on support project** | Diagnose + intake on `apxbwdxszmdffbduhjen`. Widget wiring is operator Wmsosv2. |
| Knowledge Base | **HITL seed** | Promote on Resolve → `knowledge_base_refs`; search/SOP UI deferred |
| Console | **LIVE** | Desk + Cursor outbox module |
| HITL | **Assess + Approve** | Approver session gated |
| Full auto-dispatch / qcefkox | **HELD** | Never autonomous |

## Production guard
Never `db push` / `apply_migration` / `deploy_edge_function` against `qcefkoxqkfwnlqfmwzmi`.

## FLAG — schema
CS schema stays on the isolated support project. Not applied to WMG OS production.

## Phase 2 (CS repo — maturation)
Notes, SLA, COs on this repo. Integrate stack is on `main` (PR #7). Remaining live WMG work is `handoffs/BACKEND-REQUESTS/WMG-CURRENT-STATE.md`. `email-intake` is still 404 on apx until deployed with `SUPABASE_ACCESS_TOKEN`.
