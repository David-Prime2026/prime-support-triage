# Backend request — split-load pickup address is wrong

**DR-015 WMG packet** (needs WMG edge function and/or operator click)

```
Surface: qcefkox | Wmsosv2 | both
Tickets: 5dc41a1a-6810-4f03-a040-2972852345f2
Already live on apxbwdx: none (split-load is WMG)
Exact change (RPC / function / file + behavior): split-load children copy location default_pickup_location, not parent/chain address. Click first if that parent pickup is simply wrong.
Proof of done: one real split; each child memo shows the store pickup; close 5dc41a1a
Out of scope: Gmail intake, CO PDFs, desk UI, Omaha/Wichita rediscovery, diagnose deploy
```

**Channel:** operator wmg-backend / Wmsosv2  
**Date:** 2026-09-28  
**Authority:** PRIME — treat as a bug, not a change order  
**Desk handoff:** `9b26ae07-8230-4529-a5d6-9bad830ad872` (pending)  
**Customer fact still missing:** which load / seller / correct vs shown pickup (Alisa draft asks for one example)

---

## Request

When ops splits a load across buyers, the **pickup on the child loads / memos is wrong**. Fix it so each child carries the **store location pickup**, not the parent/chain address.

This is covered defect work. Do not open a change order.

---

## Click vs code (plain)

**Both can be true. Do the click check first; write code if the click is not enough.**

### Click (ops, no deploy)

1. Open the parent load that was split.
2. Read **Pickup**.
3. If that field is already the wrong store (for example chain/parent Goodwill instead of the location), **edit pickup on that load** to the store address, then split again (or edit each child).
4. That fixes **that load**. It does not fix the next split.

Use this path if Alisa’s example is one bad parent row.

### Code (`split-load` function — this is the backend job)

Live UI **Split load across buyers** calls:

```
pt.functions.invoke("split-load", { body: { load_id, splits: [{ buyer_account_id, quantity, quantity_unit }] } })
```

Pickup is **not** on that payload. Children inherit the parent load’s pickup.

If the parent is bound to a **chain/parent seller** (Julie’s Omaha seat had been Eastern NE) while the work is a **location store**, every child memo is wrong even when ops picked the right store on screen.

**Fix:** when creating children, set pickup from the **location** row (`default_pickup_location` / the store on the parent load’s seller location), not from the chain parent. Allow ops to override per child if they already typed a pickup.

No schema push to `qcefkoxqkfwnlqfmwzmi`. Function + prove on one real split.

---

## Audit

| Fact | Evidence |
|---|---|
| Ticket opened, never worked | `5dc41a1a` was `awaiting_approval` with null notes. **2026-09-28:** code path live (`split_load_and_allocate` stamps store pickup). Still open until one real split is proved. |
| Capture is one sentence | “Send ticket to support to change pickup addrses for split loads it is wrong” |
| Screen | Seller Accounts |
| Live product | Button **Split load across multiple buyers**; success copy “Split into N loads — review and send each sales memo.” |
| Payload | `load_id` + buyer + qty only. No pickup field. |
| Related bind | Omaha Julie was moved from parent Eastern NE seat to GW Omaha location `776a3cbf` (ticket `87b47aae` resolution). Wrong inherited pickup is consistent with that class of bug. |
| Out of DR-014 on purpose | Execute card listed `5dc41a1a` as out of scope while Omaha invites + Wichita prefill ran. |
| Not Jessica’s form | Jessica is “type pickup on every **new request**.” Split-load is ops splitting an **existing** load across buyers. |

---

## Recommendations for fix

1. **Wait for Alisa’s example** (release + shown vs should-be pickup) if it arrives before you start. Do not guess the load.
2. **Click path on that example** — correct the parent pickup if it is simply wrong data. Note it on `5dc41a1a`.
3. **Code path** — in `split-load` (wmg-backend, live functions on the WMG project you already use for allocate/split; **not** a CS-repo deploy from this VM):
   - Copy location `default_pickup_location` (fallback: parent load pickup if it already matches that location).
   - Do not copy chain-parent address onto children.
   - Keep buyer/qty behavior as-is.
4. **Prove:** split the example load (or a staging copy). Each child memo shows the store pickup. Then close `5dc41a1a`.
5. Stop. Do not invent a per-stop multi-pickup product. If Alisa needed different pickups **per buyer row**, that is a new-feature question — send back to PRIME before building it.

**This CS VM cannot click WMG and cannot deploy `split-load`.** Backend lane has the session.
