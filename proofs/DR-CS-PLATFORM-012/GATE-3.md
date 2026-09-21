# DR-012 Stage 3 GATE — Approver identity + newest-first desk + Resolve→notify

**At:** 2026-09-21  
**STOP for PRIME bake** before Stage 4 (richer DEV/ENG assign).

## Bake fixes (from Stage 2 feedback)
| Item | Change |
|------|--------|
| Approver identity | Sidebar **Signed in** card: name, email, `approver · can approve` (or operator · no approve). Session switcher for future non-approvers. |
| Approve / Resolve gated | Buttons disabled without Approver; soft error if invoked |
| Desk order | Newest messages **first** (real-time postbox) |

## Stage 3 shipped
| Item | Behavior |
|------|----------|
| Resolve → notify | Approver only. Marks ticket resolved · `cursor_execution_status=done` |
| Bricely | **Appends** one `bricely` message on matching thread (`surface` + `requester_email`) — does **not** wipe thread |
| No thread | Still resolves; desk notes notify skipped |
| Desk audit | Approver note + optional system copy of notify text |

## Explicitly not in Stage 3
- Email outbound
- AuthN/AuthZ against real IdP (session switcher is console posture stub)
- Auto-promote / qcefkox

## Bake checklist
1. Hard-refresh console — see **Signed in · Approver**
2. Desk shows newest Cursor/HITL line at top after a post
3. Switch to “Console operator (no approve)” → Approve/Resolve disabled
4. As Approver, Resolve a test ticket with known Bricely thread → message appears in thread (hydrate Bricely)
