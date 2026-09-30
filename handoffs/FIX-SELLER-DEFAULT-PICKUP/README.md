# a282b3e2 — pickup is the location she is sending from

Jessica Wallace, Goodwill KS Wichita. She sends from that store. Pickup is that store. She should not type `3636 N Oliver`.

## Continued error (log)

We treated this as “save a CRM default and prefill.” That is the wrong request.

- 2026-09-25: shipped `V$` = `default_pickup_location || last_pickup_location`. Closed the ticket on that ship.
- Jessica is sending **from** Wichita. The location **is** the pickup. A stored default/last-typed field is a rabbit hole.
- 2026-09-30: she said the box is still empty. Of course — we filled from fields that are not “the location I am sending from.”

Do not ask her to type it once so last pickup sticks. She has been typing it every load.

## Correct fix

On seller New Portal:

1. Pickup = address of the **location she is sending from** (her bound store / selected send-from). Same text as `list_seller_pickup_locations.location_text` for that store.
2. If she has one location, that is pickup. If she changes location, pickup follows.
3. After submit, reset pickup from that location again — not `""`.

Drop-in: [`seller-portal-prefill.ts`](./seller-portal-prefill.ts) (`pickupFromSendLocation` / `attachSendFromLocation`).

Wmsosv2 / `get-seller-portal-context` + seller request form. Never qcefkox schema from CS.

Done when a new request from Wichita opens with 3636 N Oliver already in pickup because she is sending from Wichita.
