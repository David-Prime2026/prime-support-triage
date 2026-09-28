# WMG current state — remaining live bugs (one packet)

**DR-015 WMG packet.** PRIME 2026-09-28: work already done is approved. This lane stays. Drain CS graveyard separately. This file is the only WMG ask.

```
Surface: qcefkox | Wmsosv2 | both
Tickets: 5dc41a1a, 9f2ca521, 3297801d, 7b807646, af441aa2, 08a999c0
Already live on apxbwdx: diagnose v4 (pickup filled-box + ticket/email copy); intake-ticket v6; process-ticket-ai v1; split_load_and_allocate store-pickup stamp (noted on 5dc41a1a)
Exact change: six items below. Do not rediscover Omaha invites or Wichita New Portal prefill.
Proof of done: each ticket closed after the proof in that row
Out of scope: Gmail intake, CO PDFs, desk UI, email-intake deploy, qcefkox schema push from CS
```

Copy path if you need CS files: `prime-support-triage` `main` (PR #7). Nested `wmg-backend/support-triage` is a freeze.

Never `qcefkoxqkfwnlqfmwzmi` schema from this repo. Skip is only executor on pricing — do not mail Alisa on 3297801d / 7b807646.

---

## Already done — do not rebuild

| Item | Ticket | State |
|---|---|---|
| Omaha Portals invites (Julie roster) | `87b47aae` | **resolved** 2026-09-25 |
| Wichita New Portal pickup prefill | `a282b3e2` | **resolved** 2026-09-25; live `index-DLShFkGa.js` has `default_pickup_location` |
| Diagnose 200 + pickup copy v4 | `9f2ca521` (partial) | Function live on `apxbwdx`. Remaining is **embed**, not another diagnose deploy |
| Split-load **code** stamps store pickup | `5dc41a1a` (partial) | Function live. Remaining is **one real split proof** |

---

## 1. Widget canned fallback (blocks “Bricely is live”)

**Ticket:** `9f2ca521`  
**Surface:** Wmsosv2 embed (`BricelyChat` / `wCe`)

Live `index-DLShFkGa.js` still contains canned screenshot / clear-filter / “already with our specialist” (`F$`) and `triedSafeStep`. Diagnose is called, but **on throw the catch runs F$**.

**Exact change:**
1. Copy `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts` (this revision **does not throw** — failed diagnose returns escalate/ticket).
2. **Delete the `F$` catch** in BricelyChat so a failed fetch cannot revive the old loop.
3. Keep welcome-name `liveFix` wired (ticket `6ba47962` retired as that embed verb).

**Proof:** hard-refresh WMG; a diagnose failure or a real ask does **not** say screenshot / clear filters / specialist wall. Then close `9f2ca521`.

---

## 2. Split-load pickup — prove the live code

**Ticket:** `5dc41a1a`  
**Surface:** `qcefkox` function already shipped

Code path is live: `split_load_and_allocate` stamps store pickup (`seller_account_pickup_locations`, never chain-parent name). Optional per-row `pickup_location`. Prod had 0 existing split children.

**Exact change:** wait for Alisa’s example (seller / release / shown vs should-be) already mailed 2026-09-28 18:50Z. Split that load (or the next real split). Confirm each child memo shows the store pickup.

Click first if that parent pickup is simply the wrong store. Do not rewrite the function unless the proof fails.

**Proof:** one real split; child memos correct; close `5dc41a1a`.

---

## 3. Sales memo search + Lane County price period

**Ticket:** `3297801d` (Skip, owner)  
**Surface:** Wmsosv2 Sales Memos + `qcefkox` as needed

Skip 2026-09-25 15:36–15:44: change **GW Ind of Lane County** so September price runs through **10/3**. Search for **GW Eugene** finds nothing; there is **no dropdown** after typing a name. Bricely invented Edit/pencil/Price Period steps — ignore that.

**Exact change:**
1. Memo search must find Lane County / Eugene by alias, not only an exact display name.
2. Set September price period through 10/3 on that memo (ops click if the control exists; code if search/typeahead is missing).

Do not CC Alisa on pricing mail. Skip is the executor.

**Proof:** Skip can find the memo and the period is through 10/3. Close `3297801d`.

---

## 4. Release numbers follow pricing month (09 not 10 through 10/3)

**Ticket:** `7b807646`  
**Surface:** `qcefkox` / Portals release numbering  
**Same family as #3.**

Alisa: releases between **8/31/26 and October 3, 2026** should start with account name and **09**, not **10**, through October 3. Pricing month, not calendar month.

**Exact change:** release prefix uses the commodity pricing period, not the calendar month. Through 10/3 stay `…09…`.

**Proof:** one release in that window shows 09. Close `7b807646`.

---

## 5. Delete wrong Middle TN / Foundry stores

**Ticket:** `af441aa2` (already `sent_to_engineering`)  
**Surface:** `qcefkox` seller locations (ops delete; Alisa lacks permission)

Goodwill Industries of Middle Tennessee showing **9 stores including rescue missions like The Foundry**. Must be deleted. Alisa cannot.

**Exact change:** operator deletes the wrong location rows (The Foundry / rescue missions that are not GW stores). Do not wait on Bricely. No shared-password workaround.

**Proof:** location list is only the real GW stores. Close `af441aa2`.

---

## 6. Change buyer on a memo → Edge Function error

**Ticket:** `08a999c0`  
**Surface:** Wmsosv2 sales memo + the edge function that swaps buyer

Alisa: buyer did not want the load; changing buyer on the memo returned **“Edge Function..”** error.

**Exact change:** find that function, fix the failure, prove a buyer swap on a real (or staging) memo.

**Proof:** change buyer succeeds; close `08a999c0`.

---

## Not in this packet

- `email-intake` 404 on `apxbwdx` — CS deploy (`scripts/deploy-triage-functions.sh`). This VM has no `SUPABASE_ACCESS_TOKEN`.
- Jessica Gmail draft — approved; David sends from Bricely Gmail.
- Julie how-to draft — optional; Omaha invites already resolved.
- Sibling draft PRs #1–#6 — superseded by merged PR #7. Not a copy path.
