# DR-CS-WIDGET-016 prove

Project checked: `apxbwdxszmdffbduhjen`. `qcefkox` was not queried or deployed.

## Root cause (2026-10-01)

Anon `POST /rest/v1/support_tickets` (`Accept-Profile: support`, `source_channel=widget`, no `ticket_number`):

`42501 permission denied for table ticket_number_seq`

PostgREST names `support.allocate_ticket_number`. Live `support_tickets` has `ticket_number` and does not have `ticket_seq`. Live `clients` does not have `ticket_prefix`. The git kernel `assign_ticket_number` is not the function that is running.

`intake-ticket` uses the service role. Same create body:

| Request | HTTP |
|---|---|
| Missing `message` | **400** `client_id and message are required` |
| Widget create, non-empty message, no `x-intake-secret` | **500** (function stringifies the PostgREST error as `[object Object]`) |

Last widget row before this work: `be86fad1-ccb2-4cd6-8ee7-56f923fda3c2` / `WMG-2026-09-050` / resolved / created 2026-09-30. No `source_channel=widget` row on 2026-10-01 before the fix.

## Fix chosen

`SECURITY DEFINER` and `search_path = support, pg_catalog, pg_temp` on `support.allocate_ticket_number` (and `assign_ticket_number` if that name exists). `GRANT SELECT, INSERT, UPDATE` on `support.ticket_number_seq` to `service_role` only. The error hint said to grant the counter to `anon`; that was not done, because `support` is exposed on the API.

Terminal statuses `resolved`, `closed`, `auto_resolved` clear `open_ticket_id` and `diag_state.openTicketId`. A follow-up on a terminal ticket creates a new row.

## Deploy

`SUPABASE_ACCESS_TOKEN` is unset on this VM. `proofs/DR-CS-WIDGET-016/apply.py` refuses to run without an apx-only token and refuses a token that can see `qcefkox`. SQL and function deploy are not applied yet. The widget POST is still the 500 above until that script runs.
