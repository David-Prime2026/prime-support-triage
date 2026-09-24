# DR-CS-PLATFORM-008 — push from wmg-backend (live state)

This isolated repo **is** the `support-triage/` tree. Friday’s live path was:

`C:\Users\daves\wmg-backend\support-triage`

Live widget already calls staging **`rxhiydtqzmksaeegxyqo`** (`intake-ticket` + `bricely-thread`).  
`bricely-diagnose` is **not** deployed yet (404). Deploy it from wmg-backend. **Never** `db push` to WMG OS prod `qcefkoxqkfwnlqfmwzmi`.

## 1. Copy function files into wmg-backend

From this PR, copy onto `wmg-backend/support-triage/`:

```
supabase/functions/_shared/bricelyDiagnose.ts
supabase/functions/_shared/bricelyDiagnoseLive.ts
supabase/functions/bricely-diagnose/index.ts
doctrine/SLA_RULES.md
config/resolution-tiers.json
```

## 2. Deploy function only (staging live state)

```bat
cd C:\Users\daves\wmg-backend\support-triage
npx supabase link --project-ref rxhiydtqzmksaeegxyqo
npx supabase functions deploy bricely-diagnose --project-ref rxhiydtqzmksaeegxyqo --no-verify-jwt
```

Prove:

```bat
curl -s -X POST https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/bricely-diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"The load board still shows yesterday's loads even after I cleared the filters.\"}"
```

Expect `terminal: "escalate"` and **no** screenshot / clear-filters speech.

## 3. Wire the live widget (not wmg-backend)

Live canned loop is client `wCe` in `feat/bricely-embed` / `src/bricely/` (baked on https://wmgos.primetimesystems.ai).

1. Replace `wCe` with `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts` (same `{ text, state, newAttachments }` → `{ reply, next, terminal }`).
2. On WMG Vercel (Production / Preview / Development):

```
VITE_BRICELY_DIAGNOSE_URL=https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/bricely-diagnose
```

If unset, the drop-in derives it from `VITE_BRICELY_INTAKE_URL` (same replace as thread).

3. Redeploy WMG. Hard-refresh. Re-run tester cases + A–D. Use New chat between scenarios.

**Post-ticket wall (live `wCe`):** delete or skip the `if (t.openTicketId) return { reply: "That's already with our specialist…" }` branch. After a ticket, keep chatting and POST `followup_ticket_id` to `intake-ticket` (see `embed/wCe.remote.ts`).

## Isolation

- Functions: `rxhiydtqzmksaeegxyqo` only
- No schema change required
- No WMG OS prod database
- Kill switch / Tier 1 fence unchanged
