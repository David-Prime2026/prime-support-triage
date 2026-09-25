# DR-CS-PLATFORM-008 — CS diagnose on apxbwdx (not WMG)

**DR-015:** Nested `wmg-backend/support-triage` is a freeze. Do not develop there. Do not tell operator to pull WMG main for diagnose.

Copy path for operator (if they need files): this repo’s `cursor/integrate-cs-1-6-ac30` (or successor), then `main` after merge.

Live WMG embed already calls **`apxbwdxszmdffbduhjen`** for `intake-ticket` + `bricely-thread`.  
Functions and CS schema: **`apxbwdxszmdffbduhjen` only**. Never `db push` / `apply_migration` / `deploy_edge_function` against `qcefkoxqkfwnlqfmwzmi`. Never point diagnose / intake / email-intake at WMG inbound-email or WMG SendGrid.

**Diagnose 200 is not a live widget.** Prove HTTP on the support project, then record the version. Remaining CS work: 5-turn then email, no canned fallback, stale pickup copy — `handoffs/BACKEND-REQUESTS/BRICELY-FIVE-TURN-EMAIL.md`.

## 1. Files in this repo

```
supabase/functions/_shared/bricelyDiagnose.ts
supabase/functions/_shared/bricelyDiagnoseLive.ts
supabase/functions/_shared/bricelyMail.ts
supabase/functions/bricely-diagnose/index.ts
supabase/functions/email-intake/index.ts
supabase/functions/intake-ticket/index.ts
supabase/functions/process-ticket-ai/index.ts
doctrine/SLA_RULES.md
config/resolution-tiers.json
config/email-aliases.json
```

## 2. Deploy on the support project only

```bat
npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
```

Do **not** deploy to `rxhiydtqzmksaeegxyqo` (archive) or `qcefkoxqkfwnlqfmwzmi`.

Prove:

```bat
curl -s -X POST https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Please send and set a user. Full access and primary contacts.\"}"
```

Expect a Portals / `principal` / `seller` answer — **not** screenshot / “try that path again”.

Pickup prove (location should already fill; do not tell them to keep typing):

```bat
curl -s -X POST https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Jessica has to type the pickup address every time. It is set and does not work.\"}"
```

## 3. Live widget (operator Wmsosv2 only)

Only if the embed still uses canned fallback: `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts` and `VITE_BRICELY_DIAGNOSE_URL` on Wmsosv2. That is a WMG packet (`handoffs/BACKEND-REQUESTS/`), not a CS merge into wmg-backend.

## Isolation

- Functions: `apxbwdxszmdffbduhjen` only
- Omaha / Wichita / release-09: operator ops or already-shipped schema — not new WMG rediscovery packets
- Split-load pickup: `handoffs/BACKEND-REQUESTS/SPLIT-LOAD-PICKUP.md`
