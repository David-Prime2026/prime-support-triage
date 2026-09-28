# Backend request — Bricely 5-turn then email (still not the live channel)

**Superseded for the all-users blocker.** Execute [`WIDGET-F-CATCH.md`](./WIDGET-F-CATCH.md). Diagnose is already live on apx. Remaining Wmsosv2 work is the `F$` catch.

**Channel:** wmg-backend `support-triage` + WMG embed  
**Date:** 2026-09-28  
**Authority:** PRIME — “this is approved and I already expected this to be live”  
**Ticket:** `9f2ca521-bc6f-47a9-9279-c7be43e9f440`  
**Rule (internal):** comprehension-led diagnose; ~5 turns; then ticket + email so we are fixing the right thing; PRIME mailed if it needs approval. Customer copy never mentions coverage/timing labels.

---

## Request

Make live Bricely match the channel PRIME already approved:

1. Diagnose the actual ask (do not re-ask known facts).
2. About five turns, then **ticket + email** confirming what we are fixing.
3. If it is significant or needs PRIME, email **david@prime-timesystems.com**.
4. Stop falling back to the old canned screenshot / clear-filter / “already with our specialist” loop.

---

## Audit (2026-09-28 live)

PRIME expected diagnose live. **Part of that is live. The channel is not finished.**

| Check | Result |
|---|---|
| `POST …/bricely-diagnose` on parent `apxbwdxszmdffbduhjen` | **200** (no longer 404) |
| Retired staging `rxhiydtqzmksaeegxyqo` diagnose | still **404** (ignore; do not redeploy there) |
| Live widget `index-DLShFkGa.js` | Remote `wCe` **does** POST diagnose (URL derived from intake-ticket) |
| On diagnose throw | **catch uses canned `F$`** (screenshot / clear-filter / specialist wall) |
| Claude assist | skipped when diagnose URL exists (good) |
| Diagnose answer for Jessica pickup | **Live v4.** Filled-box copy; do not retype. This repo now matches. |
| 5-turn → email | Function can escalate + ticket/email copy. **Widget canned `F$` catch still live** until embed push. |
| Jessica / split-load | Never got the email exchange. That is why we are drafting mail by hand today. |

Do **not** spend this request on another “deploy the function” if it is already 200. Spend it on **behavior**.

---

## Recommendations for fix

1. **Update diagnose copy** for pickup-default: the location should already fill pickup; ask whether the box is filled; do not tell them to keep typing.
2. **Offramp:** at ~5 turns (existing `diagnostic_turn_cap`), open/append the ticket **and send Bricely email** (to the requester, CC David) stating what we think is wrong and what we will do. If Tier C / approval needed, that mail is to David.
3. **Live widget:** if remote diagnose fails, **do not** silently run canned `F$`. Fail loud and ticket. Delete the remaining `already with our specialist` wall when diagnose is in use.
4. **Parent `intake-ticket`:** honor `followup_ticket_id` so replies stay on one ticket (live previously spawned extras).
5. **Stand up `process-ticket-ai`** on `apxbwdxszmdffbduhjen` or drain `awaiting_approval` by operator — tickets cannot be a hole.
6. Prove with Jessica’s pickup thread and Alisa’s split-load thread: five turns max, then an email on the Bricely channel that matches the ticket.

Files already in this repo / PR #4:

- `supabase/functions/_shared/bricelyDiagnose.ts`
- `supabase/functions/_shared/bricelyDiagnoseLive.ts`
- `supabase/functions/bricely-diagnose/index.ts`
- `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts`
- Doctrine: `doctrine/SLA_RULES.md` § diagnostic phase (internal only)

**Never** `qcefkoxqkfwnlqfmwzmi` schema.
