# DR-CS-PLATFORM-008 — push from wmg-backend (live state)

This isolated repo **is** the `support-triage/` tree. Live path:

`C:\Users\daves\wmg-backend\support-triage`

Live widget calls parent **`apxbwdxszmdffbduhjen`** (`intake-ticket` + `bricely-thread`).  
`bricely-diagnose` on that parent is **200** as of 2026-09-28; live `wCe` POSTs it (URL derived from intake). Retired staging `rxhiydtqzmksaeegxyqo` diagnose is still 404 — do not redeploy there.

**Remaining backend work is not “deploy the function.”** See `handoffs/BACKEND-REQUESTS/BRICELY-FIVE-TURN-EMAIL.md`: stale pickup answer, ~5-turn then email, stop canned `F$` fallback. **Never** `db push` to WMG OS prod `qcefkoxqkfwnlqfmwzmi`.

## 1. Copy updated function files into wmg-backend

```
supabase/functions/_shared/bricelyDiagnose.ts
supabase/functions/_shared/bricelyDiagnoseLive.ts
supabase/functions/bricely-diagnose/index.ts
doctrine/SLA_RULES.md
config/resolution-tiers.json
```

## 2. Redeploy only if you changed diagnose copy / offramp

```bat
cd C:\Users\daves\wmg-backend\support-triage
npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
```

Prove pickup answer is **not** “keep typing”:

```bat
curl -s -X POST https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Jessica has to type the pickup address every time. It is set and does not work.\"}"
```

Expect: location should already fill pickup; ask if the box is filled. Not “keep entering the usual address.”

## 3. Live widget

Already derives diagnose from intake on `apxbwdxszmdffbduhjen`. Remaining:

1. If remote diagnose throws, **do not** run canned `F$` (screenshot / clear-filter / specialist wall). Ticket instead.
2. Skip `if (t.openTicketId) specialist wall` when diagnose is in use. POST `followup_ticket_id` to `intake-ticket`.
3. Hard-refresh after embed change.

## Isolation

- Functions: `apxbwdxszmdffbduhjen` only
- No schema change
- No WMG OS prod database
- Split-load pickup is `handoffs/BACKEND-REQUESTS/SPLIT-LOAD-PICKUP.md` — not this deploy
