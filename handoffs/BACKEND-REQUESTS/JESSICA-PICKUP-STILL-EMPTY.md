# a282b3e2 — pickup is the location she is sending from

Do not mail this packet. Spec only. Ticket stays `a282b3e2`.

```
Surface: Wmsosv2 seller New Portal
Ticket: a282b3e2 (reopened). Duplicate 2e93c665 closed.
Wrong ship (2026-09-25): V$() = default_pickup_location || last_pickup_location. Ticket closed on that.
Customer (2026-09-30): sending from Wichita, which is 3636 N Oliver. Box still empty.
Exact change: pickup = send-from location address (list_seller_pickup_locations.location_text for the bound store). Not CRM default. Not last typed.
Proof of done: a new request from Wichita opens with 3636 N Oliver already filled because she is sending from Wichita. Then close a282b3e2.
Out of scope: Omaha, Skip, Gmail, mailing Jessica until desk says send, qcefkox schema from CS, auto-notify backend
```

Copy path: `handoffs/FIX-SELLER-DEFAULT-PICKUP/` (`pickupFromSendLocation` / `attachSendFromLocation`).

Internal create already recalls `location_text`. Seller portal does not. Wire that.

Jessica / Wichita: sending from that store → pickup is `3636 N Oliver Wichita KS`.
