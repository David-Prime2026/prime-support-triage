# Support Triage / CS Platform — status

| Area | State | Notes |
|------|-------|-------|
| DR-016 | **IN FORCE** | Grok connect. Live `ticket_number` on apx (`WMG-YYYY-MM-NNN`, 50/50). Desk shows it. Do not re-apply. Port shape: tenant two on same apx. `handoffs/DR-CS-PLATFORM-016/GROK-CONNECT.md` |
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
| Console | **LIVE** | Desk + Cursor outbox module |
| HITL | **Assess + Approve** | Approver session gated |
| Full auto-dispatch / qcefkox | **HELD** | Never autonomous |

## Production guard
Never `db push` / `apply_migration` / `deploy_edge_function` against `qcefkoxqkfwnlqfmwzmi`.

## FLAG — schema
CS schema stays on the isolated support project. Not applied to WMG OS production.

## Phase 2 (CS repo — maturation)
Notes, SLA, COs on this repo. Integrate stack is on `main` (PR #7). Remaining live WMG work is `handoffs/BACKEND-REQUESTS/WMG-CURRENT-STATE.md`. `email-intake` is **parked** — Bricely owns mail. Do not wait on it. Numbering is live on apx; this VM stays git-only (no token unless later apx-only for other schema).
