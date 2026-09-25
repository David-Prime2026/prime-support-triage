# DR-CS-PLATFORM-008 — push Bricely diagnosis from wmg-backend

This isolated repo **is** the `support-triage/` tree. Live path:

`C:\Users\daves\wmg-backend\support-triage`

Live WMG embed already calls **`apxbwdxszmdffbduhjen`** for `intake-ticket` + `bricely-thread`.  
`bricely-diagnose` is **404** on that project until you deploy. **Never** `db push` to `qcefkoxqkfwnlqfmwzmi`.

Diagnosis source (already committed/pushed):  
https://github.com/David-Prime2026/prime-support-triage/pull/4  
Files include Omaha Portals how-to + Wichita pickup-defect answers (T9/T10/L10/L11).

## 1. Copy function files into wmg-backend

```
supabase/functions/_shared/bricelyDiagnose.ts
supabase/functions/_shared/bricelyDiagnoseLive.ts
supabase/functions/bricely-diagnose/index.ts
doctrine/SLA_RULES.md
config/resolution-tiers.json
```

## 2. Deploy to the live parent (not retired staging)

```bat
cd C:\Users\daves\wmg-backend\support-triage
npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
```

Do **not** point a new deploy at `rxhiydtqzmksaeegxyqo` (archive). Do **not** deploy to `qcefkoxqkfwnlqfmwzmi`.

Prove:

```bat
curl -s -X POST https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Please send and set a user. Full access and primary contacts.\"}"
```

Expect a Portals / `principal` / `seller` answer — **not** screenshot / “try that path again”.

Second prove:

```bat
curl -s -X POST https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Jessica has to type the pickup address every time. It is set and does not work.\"}"
```

Expect “New Portal does not read it” / form starts blank — **not** “I don’t see that feature”.

## 3. Wire the live widget

1. Replace live `wCe` with `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts`.
2. Vercel (Production / Preview / Development):

```
VITE_BRICELY_DIAGNOSE_URL=https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose
```

If unset, the drop-in derives it from `VITE_BRICELY_INTAKE_URL`.

3. Redeploy WMG. Hard-refresh. New chat between cases.

**Post-ticket wall:** skip `if (t.openTicketId) return { reply: "That's already with our specialist…" }`. After a ticket, keep chatting and POST `followup_ticket_id` to `intake-ticket`.

## Isolation

- Functions: `apxbwdxszmdffbduhjen` only  
- No schema change  
- No WMG OS prod database  
- Omaha invites + Wichita form prefill are **DR-014** (other lane) — not this deploy  
