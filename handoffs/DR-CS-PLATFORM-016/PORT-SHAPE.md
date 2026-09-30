# Port shape — tenant two on the same CS project

**Authority:** PRIME 2026-09-30 — paste as-is to the support lane.  
**Do not wait on `email-intake`.** Bricely already owns mail. Parked.  
**Not required / must stay out:** anything on `qcefkox` / `Wmsosv2`. CS does not become a second WMG OS.

---

Numbering is already on `apxbwdx`. They do not need a token in that VM for this apply.

**Token**

Keep it git-only on the support/dev VM. Do **not** drop a `SUPABASE_ACCESS_TOKEN` there unless it is scoped to `apxbwdx` only. Never put a WMG prod (`qcefkox`) token on that machine.

`ticket_number` is live on `apx`: `WMG-YYYY-MM-NNN`, 50/50 rows numbered, new inserts auto-number, leftover open mocks closed. UUID `id` unchanged. Their job is to show `ticket_number` on the desk and keep the SQL in `prime-support-triage`. Re-applying from that VM would duplicate work.

If they later need CLI apply for *other* `apx` schema, then yes — an **apx-only** token in that environment. Not before, and never a WMG token.

**Port shape**

The kernel they named is right for **tenant two on the same CS project**: numbered tickets, desk, diagnose, intake, Bricely mail, isolated DB, `clients` row (WMG is tenant one: Wilson Marketing Group / `WMG OS`).

A second `clients` row is **not** enough to route a second product. Also required:

| Required | Why |
|---|---|
| `client_contracts` + SLA terms | Lane/billable/how-to vs CO |
| Intake bind | Widget token and/or mail alias → that `client_id` |
| `auto_resolve_allowlist` | Per-tenant or explicit inherit |
| Bricely embed env | Desk/widget keys point at **apx**, not WMG |
| Real tenant RLS | Staging still had open `anon` policies; session switcher is a stub (DR-012) |
| Operator/HITL scoped to that client | Or you leak WMG tickets |
| Number prefix | Today is `WMG-…`. Tenant two needs its own prefix/`system_name` |

A **second Supabase project** is a full copy of that kernel (schema, functions, vault, desk URL, mailbox), not another `clients` row. Do not do that until tenant-two on current `apx` is proven isolated.

Do **not** wait on `email-intake`. Bricely already owns mail. Parked.

**Not required / must stay out:** anything on `qcefkox` / `Wmsosv2`. CS does not become a second WMG OS.
