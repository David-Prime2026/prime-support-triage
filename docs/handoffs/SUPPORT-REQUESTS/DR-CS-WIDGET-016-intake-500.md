# DR-CS-WIDGET-016 — widget intake 500

**Ticket:** `77fbac1d-307f-4fe8-b9fd-42b6e00364a0` / `WMG-2026-10-004`  
**Project:** `apxbwdxszmdffbduhjen` only. Never `qcefkoxqkfwnlqfmwzmi`.  
**Approval:** David approved A1+A2. Optional A3 New-chat copy is not required.  
**Copied from:** Main packet (wmg-backend `docs/handoffs/SUPPORT-REQUESTS/DR-CS-WIDGET-016-intake-500.md`, commit `0bbeee8`). Nested `wmg-backend/support-triage` stays frozen.

## Symptoms (proved 2026-10-01)

Live Support chat cannot land a widget ticket. `intake-ticket` POST returns 500 (some 400). Zero `source_channel=widget` rows today. Operators see LOCAL-TMP / Local demo + red intake banner. Last widget ticket was yesterday. Desk/email still work because those rows already have `ticket_number`.

## Root hypothesis (proved)

Trigger `trg_support_tickets_ticket_number` → `support.allocate_ticket_number` inserts `support.ticket_number_seq`. Function is not `SECURITY DEFINER` (invoker). Widget insert leaves `ticket_number` null so the trigger runs; the intake-ticket role lacks seq write → 500. Desk/email set the number and skip allocate.

Live proof before the fix: anon `INSERT` into `support.support_tickets` returned `42501 permission denied for table ticket_number_seq`. PostgREST names `support.allocate_ticket_number` (the git kernel `assign_ticket_number` is not what is live). `intake-ticket` uses the service role and returned HTTP 500 on the same create path.

## Ship A1 (widget insert must 200 + persist)

1. `SECURITY DEFINER` + locked `search_path` on the allocator, and `GRANT` seq write to `service_role` (the role intake-ticket uses). Do not `GRANT` the counter to `anon`.
2. Keep auto-number when `ticket_number` is null. Do not require the browser to send `WMG-YYYY-MM-NNN`.
3. Create path returns `{ ok: true, ticket: { id: <uuid>, ... } }` so the embed can store `openTicketId`.
4. Do not HMAC / `x-intake-secret` the browser widget (`source_channel=widget`). HMAC is server-to-server only.
5. Keep 400 for missing `client_id` / `message`. Do not 500 on an empty follow-up from diagnose.

## Ship A2 (openTicketId lock)

1. Clear `bricely_threads.open_ticket_id` and `diag_state.openTicketId` when ticket status is terminal (`resolved` / `closed` / `auto_resolved`).
2. Diagnose + intake: if the open ticket is terminal, do not append — treat as no open ticket and create.

## Out of scope

- Wmsosv2 embed (Main already shipped `34b1875`: one intro; parse `ticket.id` or `ticket_id`)
- Portal invite links
- `qcefkox` / OS prod
- Nested support-triage
- Optional A3 New-chat copy

## Prove

1. One POST matching the embed body (`client_id` = `a1000001-0001-4001-8001-000000000001`, `source_channel: widget`, non-empty message) returns HTTP 200 and inserts a `support_tickets` row with `source_channel=widget` and a `WMG-YYYY-MM-NNN` `ticket_number`.
2. Terminal-status path clears `open_ticket_id` / `openTicketId`; follow-up on a closed ticket creates new instead of append.
3. PR to `main` on `prime-support-triage`. Functions and this migration deploy to `apxbwdx` only.
