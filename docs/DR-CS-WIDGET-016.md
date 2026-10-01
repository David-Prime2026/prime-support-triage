# DR-CS-WIDGET-016 — Widget intake 500 and duplicate intro

**Status:** READY FOR BRICELY — ship A1+A2 on `apxbwdx` / `prime-support-triage`. Main ships embed-only pieces on Wmsosv2.  
**Date:** 2026-10-01  
**Owner:** Support (Bricely) for CS functions + schema. Main (ENG) for the live embed.  
**Tickets:** `77fbac1d` (`WMG-2026-10-004`, widget lock) + today’s live fail (`LOCAL-TMP` / “intake did not accept”).  
**SoR:** CS desk ticket. Do not merge into `wmg-backend` main. Do not apply SQL or functions on `qcefkox`.

---

## Purpose

The live Support chat on wmgos.primetimesystems.ai can diagnose and escalate, but cannot land a widget ticket. Operators see a red banner and a Local demo card. The greeting also prints twice. This DR splits what Support must ship from what Main already owns on the embed.

## Proved 2026-10-01 (read-only)

| Check | Result |
|---|---|
| Widget POSTs to apxbwdx `intake-ticket` | Many POST \| 500, some 400. No 200 this afternoon. CS replay 2026-10-01 18:54Z: **500** `{"error":"[object Object]"}` |
| Widget-origin rows today | Zero. Last widget ticket: `be86fad1` 2026-09-30 17:14 UTC (resolved). |
| Today’s CS tickets | Email/manual only (`WMG-2026-10-001` … `005`). Desk path still works. |
| Client id in the embed | `a1000001-0001-4001-8001-000000000001` (WMG, active). |
| `ticket_number` column | Nullable. Trigger `trg_support_tickets_ticket_number` → `support.allocate_ticket_number` (not SECURITY DEFINER). |
| Live `intake-ticket` | v6. Insert does not set `ticket_number`. Desk/email rows that already have a number skip the trigger. |
| HMAC | 401 not seen; 500/400 are the function. Do not put `INTAKE_HMAC_SECRET` in front of the browser widget. |
| Embed parse | `postIntake` required `data.ticket.id`. Follow-up JSON uses `ticket_id` in some paths. |
| Intro twice | `hydrateThread` + `ensureIntro` + page restamp. Two Bricely greetings. Wmsosv2. |
| Portal invite links | Separate. Host `wmgos.primetimesystems.ai`. Several users signed in after the mail today. Not this incident. |

Screenshot (PRIME, Portals, 2:36pm ET): banner “Support intake did not accept this request”; card `LOCAL-TMP-****` / Local demo; intro then escalate.

## Decision

Two productions stay split (DR-CS-PLATFORM-015).

| Surface | Who | What |
|---|---|---|
| apxbwdx `intake-ticket` + trigger | Support | Widget create must return 200 + `{ ticket: { id } }` and persist `source_channel=widget`. |
| apxbwdx lock clear (`77fbac1d` A1+A2) | Support | Still required. Stale `open_ticket_id` is a second widget failure mode. |
| Wmsosv2 embed | Main | One intro. Accept `ticket.id` or `ticket_id`. Do not invent CS schema. |

Diagnose HTTP 200 on CS is not the live widget. Prove with a widget POST from the app (or curl matching the embed body) that inserts a ticket.

## Support A1 — widget insert 500 (ship first)

Hypothesis to prove, then fix: `tg_support_tickets_ticket_number` calls `allocate_ticket_number`, which INSERTs `support.ticket_number_seq`. Function is invoker. Widget insert leaves `ticket_number` null. Desk/email sets a number and skips allocate. After numbering went live 2026-09-30, widget creates 500; email/manual still insert.

Do (pick the smallest that proves green):

- GRANT execute + seq write to the role `intake-ticket` uses, or mark `allocate_ticket_number` + `tg_support_tickets_ticket_number` SECURITY DEFINER with a tight `search_path`.
- Keep auto-number on null `ticket_number` (do not require the widget to send `WMG-YYYY-MM-NNN`).
- Create path must return `{ ok: true, ticket: { id: <uuid>, ... } }` so the embed can store `openTicketId`.
- Follow-up path: if the open ticket is terminal (`resolved` / `closed` / `auto_resolved`), do not append — treat as no open ticket and create. That is `77fbac1d` A2.
- Do not require `x-intake-secret` on browser `source_channel=widget`. HMAC belongs on server-to-server (email intake), not the public embed.

Prove: one POST with the embed body (`client_id` WMG seed, `source_channel: widget`, non-empty message) returns 200, row exists with `source_channel=widget` and a `ticket_number`. Then a real Support tap on Portals lands a non-LOCAL card.

400s: `client_id` and `message` are required. Keep that. Do not 500 on empty follow-up from diagnose.

## Support A2 — lock (`77fbac1d`, already directed)

- Clear `bricely_threads.open_ticket_id` and `diag_state.openTicketId` when ticket status is terminal.
- Diagnose + intake: if ticket is terminal, do not `append_to_ticket_id`.

Optional A3: New-chat copy. Not required to restore intake.

## Main (this packet) — embed only

Shipped on Wmsosv2 with this DR:

- One intro. Strip leading duplicate Bricely greetings on hydrate; restamp a single page-aware intro.
- Parse intake. Accept `ticket.id` or `ticket_id`. Log reject reason to the console; customer banner stays the same until CS A1 is green.

Main does not deploy `intake-ticket`, does not GRANT on `apxbwdx`, does not send Bricely mail.

## Out of scope

- Portal invite / set-password links (those hosts work when clicked).
- Load-board October pricing (separate ENG ship).
- Nested `wmg-backend/support-triage` (frozen).

## Inform

After CS A1+A2: reply in `#wmg-support`

```
wake support | ticket:77fbac1d | shipped
```

with intake POST status + one widget ticket id (no extra PII).
