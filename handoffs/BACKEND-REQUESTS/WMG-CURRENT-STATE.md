# WMG current state — remaining live bugs (one packet)

**DR-015 WMG packet.** PRIME 2026-09-28: work already done is approved. This lane stays. Drain CS graveyard separately. This file is the only WMG ask.

```
Surface: qcefkox | Wmsosv2 | both
Tickets: 9f2ca521, 08a999c0, 5dc41a1a
Already live on apxbwdx: diagnose v4; intake-ticket v6; process-ticket-ai v1
Closed on 2026-09-28 code check: 3297801d, 7b807646, af441aa2 (see assessment)
Exact change: three items below. Do not rediscover Omaha, Wichita, Lane County pricing, or Foundry.
Proof of done: each ticket closed after the proof in that row
Out of scope: Gmail intake, CO PDFs, desk UI, email-intake deploy, qcefkox schema push from CS, mailing Skip
```

Copy path if you need CS files: `prime-support-triage` `main` (PR #7). Nested `wmg-backend/support-triage` is a freeze.

Never `qcefkoxqkfwnlqfmwzmi` schema from this repo. Do not email Skip on pricing.

---

## Already done — do not rebuild

| Item | Ticket | State |
|---|---|---|
| Omaha Portals invites (Julie roster) | `87b47aae` | **resolved** 2026-09-25 |
| Wichita New Portal pickup prefill | `a282b3e2` | **resolved** 2026-09-25 |
| Lane County price period + memo/seller search | `3297801d` | **resolved** 2026-09-28 code check — `user-pricing-period`, location-aware seller search |
| Release numbers follow pricing month | `7b807646` | **resolved** 2026-09-28 — `save-commodity-monthly-pricing` / `memos_applied` |
| Middle TN / Foundry rows | `af441aa2` | **resolved** 2026-09-28 — ops data, not a Wmsosv2 function |
| Diagnose 200 + pickup copy v4 + Skip five-line | `9f2ca521` (partial) | **A live.** Remaining is **embed `F$` catch** |
| Split-load **code** stamps store pickup | `5dc41a1a` (partial) | Function live. Remaining is **one real split proof** |

---

## 1. Widget canned fallback (blocks “Bricely is live”)

**Ticket:** `9f2ca521`  
**Surface:** Wmsosv2 embed (`BricelyChat` / `wCe`)

Live `index-DLShFkGa.js` still contains canned screenshot / clear-filter / “already with our specialist” (`F$`) and `triedSafeStep`. Diagnose is called, but **on throw the catch runs F$**.

**Exact change:** execute `handoffs/BACKEND-REQUESTS/WIDGET-F-CATCH.md`. Copy `wCe.remote.ts`. Delete live `catch{_t=F$}`. Do not redeploy diagnose (already PASS on apx).

**Proof:** hard-refresh WMG; a diagnose failure or a real ask does **not** say screenshot / clear filters / specialist wall. Then close `9f2ca521`.

---

## 2. Split-load pickup — prove the live code

**Ticket:** `5dc41a1a`  
**Surface:** `qcefkox` function already shipped

Code path is live: `split_load_and_allocate` stamps store pickup (`seller_account_pickup_locations`, never chain-parent name). Optional per-row `pickup_location`. Prod had 0 existing split children.

**Exact change:** wait for Alisa’s example. First mail SENT 2026-09-28 18:50Z. Follow-up **DRAFT** (unsent) `r722570217650437097`: code is live; we are waiting on seller / release / shown vs should-be, or confirmation the next split already shows the store address. Split that load (or the next real split). Confirm each child memo shows the store pickup.

Click first if that parent pickup is simply the wrong store. Do not rewrite the function unless the proof fails.

**Proof:** one real split; child memos correct; close `5dc41a1a`.

---

## 3. Change buyer on a memo → Edge Function error

**Ticket:** `08a999c0`  
**Surface:** Wmsosv2 `reassign-buyer`

Alisa: buyer did not want the load; changing buyer returned **“Edge Function..”**.

**Code check:** UI is complete — search replacement, reason required, invoke `reassign-buyer`, apply new memo, success toast. Live caller does not use `pu()`, so a non-2xx becomes **“Edge Function..”**.

**Exact change:** copy `handoffs/BACKEND-REQUESTS/reassign-buyer/` onto wmg-backend `supabase/functions/reassign-buyer`, deploy on the same project as `allocate-load` / `deallocate-buyer` (not apx, never CS→qcefkox). Then one successful replace on a real (or staging) load.

**Proof:** toast is `Buyer replaced — new memo …` or a **specific** `{ error }` (not “Edge Function”). Then close `08a999c0`.

---

## Not in this packet

- `3297801d` / `7b807646` / `af441aa2` — closed 2026-09-28 code check. Do not rebuild. Do not email Skip.
- `email-intake` 404 on `apxbwdx` — CS deploy token.
- Jessica Gmail draft — approved; David sends.
- Sibling draft PRs #1–#6 — superseded by merged PR #7.
