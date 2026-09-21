# DR-010 Stage 2 GATE — ticket data restored on apx (env not flipped)

**At:** 2026-09-21  
**STOP for PRIME before Stage 3 (env / console cutover)**

## What ran
- Exported live `support.*` rows from **rxhiyd** via PostgREST (`Accept-Profile: support`) → `data-export/*.json`
- Generated identity-preserving `INSERT … ON CONFLICT (id) DO NOTHING` SQL → `restore/*.sql`
- Applied to **apxbwdxszmdffbduhjen** via MCP `execute_sql` / `apply_migration`
- **rxhiyd left intact** (still live catch-net)

## Counts (match baseline)

| Table | rxhiyd (live) | apx (restored) | Baseline |
|-------|--------------:|---------------:|---------:|
| support_tickets | 24 | **24** | 24 |
| ticket_messages | 40 | **40** | 40 |
| ticket_events | 22 | **22** | 22 |
| ticket_attachments | 1 | **1** | 1 |
| engineering_handoffs | 1 | **1** | 1 |
| bricely_threads | 6 | **6** | 6 |
| bricely_thread_messages | 10 | **10** | 10 |

## UUID verification
- Baseline ticket IDs checked: **24 / 24 matched**, **0 missing**
- Client id `a1000001-0001-4001-8001-000000000001` already present on apx (unchanged)
- Note: `client_contracts` / `auto_resolve_allowlist` seed UUIDs differ between projects (functional seeds already on apx); ticket graph UUIDs are the preservation target and are identical

## Explicitly NOT done
- **No** Vercel / console / `catch-net-posture` URL flip
- **No** rxhiyd retirement
- **No** qcefkox touch
- Production intake still points at **rxhiyd**

## Ask PRIME
Reply **GO Stage 3** to authorize env/console cutover to apx (smoke new intake; keep rxhiyd as rollback until Stage 4).
