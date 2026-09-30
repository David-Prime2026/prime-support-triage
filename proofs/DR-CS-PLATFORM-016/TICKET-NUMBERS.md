# Ticket numbers — live on apx (`ticket_number`)

**Authority:** PRIME 2026-09-30 — numbering already on `apxbwdx`. Do **not** re-apply from this VM.  
**Live column:** `support.support_tickets.ticket_number`  
**Format:** `{prefix}-{YYYY}-{MM}-{NNN}` → **`WMG-2026-09-039`** (Jessica)  
**UUID `id` unchanged.**

Paste / token / port shape: [`handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md`](../../handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md)

## Live (do not redo)

| Fact | Value |
|---|---|
| Project | `apxbwdxszmdffbduhjen` only |
| Rows numbered | 50 / 50 |
| New inserts | auto-number |
| Leftover open mocks | closed (not deleted) |
| Jessica `a282b3e2` | **`WMG-2026-09-039`** resolved |
| This VM | git-only. No token for this apply |

CS job: **show `ticket_number` on the desk** and **keep the SQL in this repo**. Re-applying from this VM duplicates work.

Earlier CS mapping that named Jessica `WMG-2026-09-022` and planned a mock purge was **wrong**. Live numbered every row, including mocks, and closed leftover open mocks.

## Token

Keep this support/dev VM git-only. Do **not** drop a `SUPABASE_ACCESS_TOKEN` here unless it is scoped to `apxbwdx` only. Never put a WMG prod (`qcefkox`) token on this machine.

If later CLI apply is needed for *other* `apx` schema — an **apx-only** token then. Not before. Never a WMG token.

`proofs/DR-CS-PLATFORM-016/apply-ticket-codes.py` **refuses to run**. Do not point it at apx.

## Kernel SQL (repo copy only)

`supabase/migrations/20260930155607_ticket_codes_purge_mocks.sql`

That file is the **kernel copy** (`ticket_number`, prefix, insert trigger). Header says **DO NOT RE-APPLY** to apx. Never apply to `qcefkoxqkfwnlqfmwzmi`.

Tenant two needs its own prefix / `system_name`. See PORT-SHAPE. Do not stand a second Supabase project until tenant-two on current `apx` is proven isolated.

## Desk

Console UI on this branch reads `ticket_number` (list, Find, detail). UUID stays the PK and is shown as Id.

GitHub Pages still needs a rebuild to show numbers on https://david-prime2026.github.io/prime-support-triage/
