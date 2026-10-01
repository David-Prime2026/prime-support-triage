# DR-SUPPORT-DUAL-ENGINE-001 — Dual-engine CS support workflow

**Status:** Proposed / Pending David merge  
**ID:** DR-SUPPORT-DUAL-ENGINE-001  
**Date locked:** 2026-10-01  
**Authority:** David approval packet, 2026-10-01 (dual-engine CS). This file is the record. Merge by David ratifies it.  
**Owner (record):** Support lane (Bricely Escobar, Support Manager) + Main (`#wmg-main`)  
**SoR:** Supabase `apxbwdxszmdffbduhjen` — `support` tickets and `ticket_messages`  
**Relates:** `SUPPORT_SHIP_RULES.md` (DR-CS-PLATFORM-015), `doctrine/SLA_RULES.md`, `config/bug-change-classification.md`, `docs/DR-CS-PLATFORM-002-execution.md`, `STATUS.md`  
**This PR:** documentation only. No product code, schema, or deploy.

Granola has no 2026-10-01 meeting notes on record at the time of this write. The packet below is the approval text this DR locks.

---

## 1. Intent

Three engines, one system of record. No Zendesk on this lane.

| Engine | Who | Job |
|--------|-----|-----|
| Grok Bot | Bricely Escobar, Support Manager | Customer triage, diagnosis, desk, `bricely@prime-timesystems.com` |
| Cursor Cloud Agents | Main wakes them; code workers execute | One agent per ticket, on the right repo, only after the rules below |
| Custom CS panel | Support / dev | Desk on Supabase `apxbwdxszmdffbduhjen` |

`apxbwdxszmdffbduhjen` is the system of record for this lane. WMG production (`qcefkoxqkfwnlqfmwzmi`) is a client system, not the support database. Zendesk is out of this lane.

---

## 2. Non-bypassable diagnosis-first

Every customer ask — email or chat — gets a quick CS diagnosis before any route.

This is especially true for non-technical users: cannot log in, a field is not showing, an error on screen. CS is expected to resolve a good portion of those before anything is handed to engineering. Route only after that diagnosis exists.

Ticket numbers already live on `apx` as `WMG-YYYY-MM-NNN`. They track priority and what moved through support. Show them on the desk. Keep the SQL in this repo. Do not re-apply numbering.

Doctrine already requires diagnosis before routing (`doctrine/SLA_RULES.md`, diagnostic phase). This DR makes that gate non-bypassable for the dual-engine path: no wake, no packet, no cloud agent without a one-line CS diagnosis on the ticket.

---

## 3. Front-side PREWORK (automated Manager path)

Bricely runs this path before Main is asked to assess. Order is fixed.

1. **Diagnose** from code, contacts, and portal as needed.
2. **Enrich the ticket:** requester, role or seat when known, the real source channel, `ticket_number`, and a one-line CS diagnosis. When the source channel is known, the ticket records that channel. It does not stay `Unknown`.
3. **Classify:** `CO` / `bug` / `gap` / `ops`. Bug-vs-change evidence in `config/bug-change-classification.md` still governs whether a `bug` is a prod-eligible candidate. `gap` and `ops` are workflow classes in this DR; they do not widen that fence.
4. **Desk note** on `apx`.
5. **Wake `#wmg-main` for assessment only.** Channel mention. Do not `@Cursor`. Do not `@Bricely`.
6. **Summarize the work and seek HITL / PRIME A.** One email thread per ticket.

PREWORK ends at assessment and the ask for A. It does not start implementation.

---

## 4. Hard rules

1. **ENG does not start implementation before PRIME A.** Assess-only until A exists on the ticket or on that ticket’s email thread.
2. **State changes are explicit on the ticket.** A status move is a written ticket update, not an implied Slack read.
3. **SoR is `apx` support tickets and `ticket_messages` only.** The support project is `apxbwdxszmdffbduhjen`. WMG production `qcefkoxqkfwnlqfmwzmi` is not the SoR. Zendesk is not the SoR.
4. **Owners**
   - **Bricely** — customer triage and `bricely@prime-timesystems.com`.
   - **Support / dev** — CS panel and `apx`.
   - **Main** — `#wmg-main` doorbell after PREWORK, and again after A when execute is allowed.
5. **Customer mail**
   - CS prove and acknowledge mail goes out under the support charter.
   - PRIME lifts stay draft-card / HITL. They are not auto-sent.

Support sends. Operator does not. From address remains `bricely@prime-timesystems.com` only when the desk says send (`SUPPORT_SHIP_RULES.md`).

---

## 5. Business hours and prove SLA

**Business hours for this prove clock:** 7:00am–8:00pm `America/New_York`.

The waiting-prove customer nudge counts **business time inside that window**. Time outside the window does not count. A calendar overnight that falls outside hours does not consume the window.

| Trigger | When | What happens |
|---------|------|----------------|
| 1 | 8 hours of business time in `waiting-prove` | Auto customer nudge, plus a desk note that the ticket is **user-blocked** |
| 2 | 16 hours of business time | PRIME ping on the ticket’s email thread |
| 3 | Reporting | SLA reporting separates **user-blocked** from an **ENG miss** |

Exhibit A initial-response targets stay in `doctrine/SLA_RULES.md` (Mon–Fri 9:00am–5:00pm ET, US federal holidays excluded, severity table). This prove clock does not replace those targets.

**Open (not chosen here):** the 2026-10-01 packet does not say whether Saturday, Sunday, or US federal holidays count inside the 7:00am–8:00pm window. Until David says so, implementers do not invent that rule.

---

## 6. State vocabulary

These names are the workflow states this DR locks. Writing them on the ticket is required. Mapping them onto today’s `support.support_tickets.status` check (`new`, `ai_processing`, `auto_resolved`, `awaiting_approval`, `billable_review`, `approved`, `sent_to_engineering`, `in_progress`, `resolved`, `closed`, `reopened`) or onto `cursor_execution_status` is later implementation. This PR does not migrate schema.

| State | Meaning |
|-------|---------|
| `assessed` | PREWORK is done. Diagnosis is on the ticket. `#wmg-main` has been woken for assessment only. |
| `awaiting-A` | Assessment has returned. PRIME A is not on the ticket or the email thread yet. |
| `in-progress` | PRIME A exists. A cloud agent may implement. |
| `waiting-prove` | Agent outcome is on the ticket. Customer prove / ack is still open. |
| `user-blocked` | Desk note (and reporting class) when the 8-hour business prove window elapses without the customer. |

Legal moves Bricely writes:

- PREWORK complete → `assessed`
- Assessment returned, no A yet → `awaiting-A`
- A exists and work starts → `in-progress`
- Outcome posted, customer still has to prove → `waiting-prove`
- 8h business with no customer answer → desk note `user-blocked` (ticket stays in the prove path; reporting splits this from an ENG miss)

`in-progress` is illegal before A.

---

## 7. Cloud-agent Manager → Worker loop (after A)

After PRIME A is on the ticket or the email thread:

1. **Packet on `apx`.** Include `ticket_number`, class (`CO` / `bug` / `gap` / `ops`), repro, code pointers, acceptance tests, and an implement-only-after-A flag that is true only because A exists.
2. **One cloud agent per ticket**, on the right repo.
3. **Bricely monitors.** The result is written into `ticket_messages`. Status moves `assessed` → `awaiting-A`, or `in-progress` → `waiting-prove`, as the facts require.
4. **Customer draft** is produced from the agent outcome. Send follows §4 (CS prove/ack under charter; PRIME lifts stay draft-card / HITL).

---

## 8. Open decision — when a cloud agent is spawned

Both options stay open. This DR does not close them. Recommendation is recorded so the next build does not guess.

| Option | Spawn | What the agent is allowed to do |
|--------|--------|----------------------------------|
| **A** | After assessment returns, before PRIME A | Assess only. No implementation. |
| **B** | Only after PRIME A | Implement. |

**Recommendation:** **B** for any agent that implements. The assess wake stays Slack / Main (`#wmg-main`, channel mention, assess-only) until A exists. Option A remains available if David later wants a cloud agent to do the assessment write-up before A; that agent still must not implement.

---

## 9. Approved build items (process + small panel)

Locked as the build that follows this DR. Not built in this PR.

- Ownership gate, and no-ENG-before-A, written into the wake templates.
- Event webhook health.
- Standing send for CS customer mail (prove / ack under charter).
- Cloud-agent-per-A with ticket write-back (`ticket_messages` + explicit status).
- Show `ticket_number` on the desk (already the live format `WMG-YYYY-MM-NNN`; do not re-apply the numbering SQL).
- Enrichment (requester, role/seat when known, real source channel, one-line CS diagnosis).
- Full chat → `ticket_messages`.

**Deferred — next build:** telemetry / analytics. Named here so it is not pulled into the first implementation of this DR.

---

## 10. Ownership split for implementation

| Lane | Owns |
|------|------|
| **Support** (Bricely + CS panel / `apx`) | Diagnosis gate, enrichment, HITL email path, 8-hour prove routine, status machine, ticket write-back |
| **Main** | Wake contract (assess only until A), cloud-agent-per-A, no implement before A, PR → desk note hook |
| **Shared** | Webhook health, state vocabulary (§6) |

WMG schema, WMG edge functions, and the live Wmsosv2 embed stay off this split. If a later change needs those, it is a separate packet under `handoffs/BACKEND-REQUESTS/`, not an extension of this DR.

---

## 11. Slack channels

Repo search at the time of this write: no Slack channel IDs, and no `#wmg-main` or `#wmg-support` strings, in existing docs. This DR therefore uses the name only.

| Name | Role in this DR |
|------|-----------------|
| `#wmg-main` | Assess-only doorbell after PREWORK. Same doorbell after A when Main may execute. Channel mention. Not `@Cursor`. Not `@Bricely`. |

`#wmg-support` is not named anywhere in this repo. This DR does not assign it a job and does not invent an ID.

---

## 12. Out of scope

- Zendesk.
- WMG production schema changes (`qcefkoxqkfwnlqfmwzmi` / Wmsosv2).
- Telemetry / analytics (next build).
- Re-applying `ticket_number` SQL.
- `email-intake`. Bricely owns mail. Parked.
- A second Supabase project. Tenant-two isolation on current `apx` is a separate record (`handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md`).

---

## 13. What “done” means for the following build

Not acceptance for this documentation PR. Acceptance for the implementation that this DR authorizes, once David merges:

- A customer email or chat cannot reach `#wmg-main` or a cloud agent without a one-line CS diagnosis, enrichment, class, and desk note.
- Wake copy is assess-only, and implementation does not start without A on the ticket or the one email thread.
- Every state change in §6 is visible on the `apx` ticket.
- Prove nudges fire on business time (7:00am–8:00pm `America/New_York`), at 8h and 16h, and reporting splits user-blocked from ENG miss.
- One cloud agent per ticket writes the outcome back to `ticket_messages`.
