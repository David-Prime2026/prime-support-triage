# CO-GWKS-DEFAULT-PICKUP-HOURS

**STOP — PRIME.** Diagnosis and quote package only. Do not implement in WMG OS from this isolated CS repo. Do not `db-push` / deploy to `qcefkoxqkfwnlqfmwzmi`.

| | |
|---|---|
| Requester | Jessica Wallace `<jwallace@goodwillks.org>` |
| Forwarded | Alisa Figueroa `<alisa@wilsonmarketing.com>` → PRIME 2026-09-23 15:37 |
| Seller | Goodwill KS (`goodwillks.org`) |
| Surface | New Portal seller load-request form (`GCe` in live WMG) |
| Lane | Change order · `new_feature` · M&S §19 |
| Severity | Sev 3 / P3 — she can still request loads; she is re-typing two fields |
| Ticket seed | `c1000001-0001-4001-8001-000000000001` (console) |
| Live intake | Not filed — this VM has no parent/staging service token |

## Jessica’s question (verbatim)

> Where I highlighted are you able to edit it on your end and able to save it to where I don't have to add our address and shipping hours every time I request a load?

Highlighted on her screenshot:

- **Pickup location:** `3636 N Oliver Wichita KS`
- **Additional requests / notes:** `SHIPPING HOURS 8AM-2PM`

## Answer for Alisa (plain)

**No — not from Alisa’s side today.** Those two New Portal fields are per-request. They start blank, they are cleared after submit, and nothing Alisa edits in CRM writes them back onto Jessica’s form.

What already persists (the checkboxes above the highlight): confirmation emails — “Defaults from your account settings.” Jessica does **not** have to re-check Buyer assigned / Pickup / Delivered.

What does **not** persist:

| Field | What it actually is | Saved on account? |
|---|---|---|
| Pickup location | Free-text “site name for **this order** — not the corporate parent account.” State `U` starts `""`. Reset after submit. | No. `get-seller-portal-context` never returns a pickup default to this form. |
| Shipping hours | Not a field. Jessica typed them into **notes** (`B`). Notes start `""`. | No `shipping_hours` column, RPC, or CRM control exists in live WMG. |

Customer-facing copy: [`ALISA-REPLY.md`](./ALISA-REPLY.md).

## Live code (inspected `wmgos.primetimesystems.ai` `index-Bo-k3d31.js`)

Seller form `GCe`:

- `[U, Z] = useState("")` — pickup
- `[B, W] = useState("")` — notes
- Bootstrap `get-seller-portal-context` prefills **commodity** (`last_commodity`) and **confirmation_email_events** only
- Reset `Vs()` after submit: `Z("")`, `W("")`
- Submit `submit-load-request` body includes `pickup_location` + `notes` for that request only

Internal WMG create **does** call `list_seller_pickup_locations` and, when rows exist, recalls `location_text` (sources: `load_history`, `billing`). That list is **not** wired to the seller portal. There is no `upsert_seller_pickup` / “Save account” path in the live bundle. `default_pickup_location` is used as a CRM/statement address display, not as Jessica’s form default.

## Workaround until the change order ships

Jessica keeps typing the two fields. Alisa cannot pre-save them onto the New Portal form.

If Alisa creates a load **internally** for this seller, pickup *may* recall from recent-load / billing history after loads exist. That does not help Jessica’s portal.

Defaults to remember for the build:

- Pickup: `3636 N Oliver Wichita KS`
- Shipping hours: `8AM–2PM`

## Build (wmg-backend / WMG embed — not this repo)

Land where Friday’s live state already is: `C:\Users\daves\wmg-backend`.

1. **Fast slice (mirrors `last_commodity`):** persist `last_pickup_location` + `last_notes` (or `last_shipping_hours`) on submit; return them from `get-seller-portal-context`; prefill `U` and `B` (or a dedicated hours field). Jessica stops re-typing after one successful request.
2. **Alisa slice (what she asked for):** editable account defaults — reuse `default_pickup_location` and add `default_shipping_hours` (or default notes). CRM control Alisa can set without waiting for a load. Portal prefers Alisa’s default, else last-used.
3. Optional later: dedicated Shipping hours field so hours leave free-text notes.

Acceptance:

- New Portal opens with 3636 N Oliver / 8AM–2PM already filled for Goodwill KS
- Alisa can change those defaults without Jessica editing the request form
- Confirmation-email defaults stay as they are
- Other sellers unchanged unless they have defaults
- Staging only — never `qcefkoxqkfwnlqfmwzmi`

Lift (internal, not a quote): ~10–14 h (context + prefill ~3, CRM edit ~4, last-used persist ~2, dedicated hours vs notes ~2, staging proof ~2). Package: [`handoff-a.json`](./handoff-a.json).
