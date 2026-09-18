# DR-CS-PLATFORM-004 — Hosting unblock (isolated)

## Blocker: host target + new project cost

Supabase org **WMGOS** currently has only **WMG OS** (`qcefkoxqkfwnlqfmwzmi`) — production, forbidden for triage schema.

Creating an isolated project **`prime-support-triage`** in the same org costs **$10/month** (Supabase MCP `get_cost`).

**PRIME: reply CONFIRM to create that project** (or provide another host target). Until then intake cannot be public.

## After confirm, Cursor will
1. Create project `prime-support-triage` (us-east-1 or us-west-1)
2. `supabase link` + push migrations 001–004 + FIX-C + thread persistence
3. Deploy edge functions `intake-ticket`, `bricely-thread`, `process-ticket-ai`, `approve-handoff`
4. Expose `db.schemas` including `support`
5. Deploy console to Vercel (`support-triage/`) with `VITE_SUPABASE_URL` / anon key
6. Set on WMG app (Vercel):
   - `VITE_BRICELY_INTAKE_URL=https://<ref>.supabase.co/functions/v1/intake-ticket`
   - `VITE_BRICELY_THREAD_URL=https://<ref>.supabase.co/functions/v1/bricely-thread`
   - `VITE_BRICELY_MOCK_EMAILS=<prime-named>`
7. Prove intake lands tickets from each surface → STOP for PRIME A–D re-test

## Local apply (dev)
```bash
cd support-triage
npx supabase db reset   # or migration up
```

## Straight-to-prod
Remains OFF (`config/autonomy-killswitch.json` halt:true).
