# Ticket numbers — purge mocks, number real only

**Authority:** PRIME 2026-09-30 — number real tickets; purge mocks.  
**Format:** `{client}-{YYYY}-{MM}-{seq}` → **`WMG-2026-09-022`**  
**Seq:** per client, per UTC month, 3 digits, never reused. UUID stays PK.

## Rules

- Number **real** tickets only (`is_mock` is false).
- **Purge** mock tickets and mock Bricely threads.
- Prefix from `clients.ticket_prefix` (WMG). Year and month from `created_at` UTC.
- New real inserts get the next seq in that month via trigger.
- Do not apply to `qcefkoxqkfwnlqfmwzmi`.

## Apply (apx)

```bash
SUPABASE_ACCESS_TOKEN=sbp_… python3 proofs/DR-CS-PLATFORM-016/apply-ticket-codes.py
```

Migration: `supabase/migrations/20260930155607_ticket_codes_purge_mocks.sql`

After apply, Jessica (`a282b3e2`) is **`WMG-2026-09-022`**. Desk shows the code; Find box searches it.

## Expected backfill (30 real, all 2026-09 UTC)

Mocks to delete: **19**. Next October ticket will be `WMG-2026-10-001`.

| Code | UUID | Status |
|---|---|---|
| WMG-2026-09-001 | `64d2b883` | resolved |
| WMG-2026-09-011 | `08a999c0` | sent_to_engineering |
| WMG-2026-09-014 | `5dc41a1a` | in_progress |
| WMG-2026-09-022 | `a282b3e2` | in_progress (Jessica / Wichita) |
| WMG-2026-09-024 | `87b47aae` | resolved (Omaha) |
| WMG-2026-09-028 | `9f2ca521` | sent_to_engineering |
| WMG-2026-09-030 | `2e93c665` | resolved (duplicate Jessica catch-net) |

Full 001–030 assigned in created order among `is_mock = false`.

Console UI is on this branch; GitHub Pages still needs a rebuild to show numbers on https://david-prime2026.github.io/prime-support-triage/
