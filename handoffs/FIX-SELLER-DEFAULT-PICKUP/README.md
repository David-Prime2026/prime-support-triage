# GW Wichita — pickup typed on every request (defect)

Alisa already set the CRM default. Jessica still types `3636 N Oliver Wichita KS` and `SHIPPING HOURS 8AM-2PM` on every New Portal request. The form never reads the default.

| | |
|---|---|
| Seller | Goodwill KS · Jessica Wallace `<jwallace@goodwillks.org>` |
| Proof load | REL-WICH09-05MR0924266 · 3636 N OLIVE · 2026-09-23 seller portal |
| Tickets | `a282b3e2` (Alisa: “it is set and does not work”) · execute note `c283c80a` |
| Values | Pickup `3636 N Oliver Wichita KS` · hours `8AM-2PM` |

## Root cause (live `index-Bo-k3d31.js`)

- Seller form starts pickup + notes at `""`.
- `get-seller-portal-context` prefills **commodity** + **confirmation_email_events** only.
- After submit, reset clears pickup + notes again.
- `default_pickup_location` is shown on the seller **card / statements**, not on this form.
- Internal create *does* recall `list_seller_pickup_locations` — seller portal does not call it.

This is a defect. Not “I don’t see that feature.”

## Fix (copy into wmg-backend / Wmsosv2)

1. `get-seller-portal-context` — return `default_pickup_location`, `last_pickup_location`, `default_shipping_hours` / `last_notes`.
2. Seller request form bootstrap + post-submit reset — prefill pickup from those fields; put hours in notes as `SHIPPING HOURS 8AM-2PM` until a dedicated field exists.
3. Seed / confirm Goodwill KS default stays `3636 N Oliver Wichita KS`.

Drop-in: [`seller-portal-prefill.ts`](./seller-portal-prefill.ts).

Staging first. Never `qcefkoxqkfwnlqfmwzmi` schema push. Jessica can keep typing until this is on Vercel.
