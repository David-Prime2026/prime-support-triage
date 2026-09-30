# Backend request — Jessica Wichita pickup still empty

```
Surface: Wmsosv2 seller New Portal + get-seller-portal-context (not CS diagnose)
Ticket: a282b3e2 (reopened 2026-09-30). Duplicate catch-net 2e93c665 closed.
Already live: V$() writes default_pickup_location || last_pickup_location into the pickup box (index-ByANBu2q.js). catch{_t=F$} gone.
Exact change: Jessica Wallace / Goodwill KS Wichita (3636 N Oliver) must boot New Portal with that pickup filled. If context is blank, stamp CRM default onto portal context for her location.
Proof of done: Jessica (or a Wichita seller login) opens a new request after hard-refresh and the pickup box is filled. Then close `a282b3e2`.
Out of scope: Omaha, Lane County pricing, Foundry, Gmail intake, mailing Skip, qcefkox schema from CS, re-litigating V$ (it is live)
```

**Authority:** PRIME — inbound Bricely mail is the process test. She replied: the box is still empty.

Copy path: `prime-support-triage` `cursor/jessica-wichita-empty-ac30`

Never `qcefkoxqkfwnlqfmwzmi` schema from this repo. Do not email Skip.

---

## Request

Make Jessica’s New Portal pickup fill from the Wichita store default so she does not type `3636 N Oliver, Wichita, KS` on every load request.

Do not add another client prefill helper. `V$` / `K$` are already in the live bundle.

---

## Audit (2026-09-30)

| Check | Result |
|---|---|
| Customer | Jessica Wallace `jwallace@goodwillks.org`. Hard-refresh + new request. **Pickup still empty.** |
| Live JS `V$` | `return (default_pickup_location \|\| last_pickup_location \|\| "").trim()` then `ee(V$(le))` / `ee(V$(ga))` on seller bootstrap |
| Live JS `K$` | shipping hours from `default_shipping_hours` |
| `catch{_t=F$` | gone on `index-ByANBu2q.js` |
| Diagnose | CS will redeploy so “still empty” tickets instead of clear-filters. That does not fill the box. |

If `V$` is live and the box is empty, **portal context for her session is blank**. Either:

1. CRM `default_pickup_location` on the Wichita location/account is empty, or
2. `get-seller-portal-context` does not return it for her portal user / location, or
3. She is not booted as that Wichita seller (wrong account in session).

Alisa previously said the default was set. Customer proof says the form still opens blank.

---

## Recommendations for fix

1. On a Wichita seller login (Jessica), inspect `get-seller-portal-context`: `default_pickup_location`, `last_pickup_location`, `default_shipping_hours`.
2. If CRM has `3636 N Oliver…` / `8AM–2PM` and context omits them, map those fields onto the portal payload for that location.
3. If CRM is empty, set the store default on the seller/location record she actually uses (not chain parent only).
4. Hard-refresh prove: pickup filled, shipping hours filled if that field is on the form.
5. Reply on the Bricely thread only after that prove (CS holds a draft). Do not ask her to keep typing as the fix.

Do not rebuild Omaha, pricing, or Foundry. Do not mail Skip.
