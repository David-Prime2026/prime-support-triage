# DR-CS-PLATFORM-008 — Bricely Gmail designated intake

Authority: PRIME 2026-09-24. Channel: `bricely@prime-timesystems.com`. Triage: `apxbwdxszmdffbduhjen`. Never `qcefkoxqkfwnlqfmwzmi`.

## SEND NOW — CO-015

| | |
|---|---|
| From | `bricely@prime-timesystems.com` |
| To | `skip@wilsonmarketing.com` |
| CC (first send — **wrong**) | `alisa@wilsonmarketing.com`, `david@prime-timesystems.com` |
| Subject | Change order waiting for your approval — CO-015 Portal dashboard (Quote 1002026-015) |
| Gmail message | `1a0d4ac2a483a47c` |
| Attachment (first send — **wrong**) | homemade `quotes/CO-015-portal-dashboard-multi-location.pdf` — **deleted**. Not the official 2026 PRIME-TIME Systems Quote/Proposal. |

PRIME correction 2026-09-24: that PDF was not the template; West/SecureShow leftover was stripped from `quotes/templates/2026-PRIME-TIME-Systems-Quote-Proposal.docx`. CO PDF is not sent until after execution, with customer acceptance timestamp + PRIME send-approval timestamp (David’s approval to send). Waiting mail is Your Support link only. Do not default-CC Alisa. Gmail cannot recall the first send.

Correction mailed (no Alisa, no PDF): Gmail `1a0d4b2fc89d4c5c` — To Skip, CC David only. Same thread.

Plain body + Bricely signature. No SLA/billable words. Link: `https://wmgos.primetimesystems.ai/?view=settings#your-support`

## Chat parity (live WMG embed)

Inspected `wmgos.primetimesystems.ai` `index-Bo-k3d31.js`:

```
VITE_BRICELY_INTAKE_URL = https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/intake-ticket
VITE_BRICELY_THREAD_URL = https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-thread
```

Not empty. Not WMG OS prod. Parent already. `bricely-diagnose` / `email-intake` / `process-ticket-ai` are **404** on this project until deploy.

## Mail → ticket (this run)

Gmail MCP is the Bricely seat. Unread support mail + two proof sends POSTed to live `intake-ticket` on `apxbwdxszmdffbduhjen`:

| Ticket | From | Subject | Status |
|---|---|---|---|
| `5f7b9cf2-8654-46b2-adde-645a116b0dd4` | david@prime-timesystems.com | Re: Bricely send test (BUG-014) — missing signature | awaiting_approval |
| `b6ef864b-43c5-423b-a44e-c92db43cd9a7` | alisa@wilsonmarketing.com | Received (same Gmail thread) | awaiting_approval |
| `6caf01e7-54b4-454f-b73b-066db69422c4` | alisa@wilsonmarketing.com | YES (same Gmail thread) | awaiting_approval |
| `fa4f4296-9976-4ead-8b37-a3db8a040903` | bricely@ (self) | how do I reset my portal password? | awaiting_approval — **Tier A candidate** (`login_help` / `password_reset`) |
| `c6dda146-018a-40fe-a62b-63c2e5f7da3b` | bricely@ (self) | custom revenue-by-store dashboard | awaiting_approval — **non-allowlist / new feature** |

Google Workspace marketing mail was skipped (not a support ticket).

`followup_ticket_id` is in this repo’s `intake-ticket` but **not on the live parent function yet**, so Alisa’s replies became new tickets instead of notes. Deploy `intake-ticket` to collapse threads.

`process-ticket-ai` is 404, so nothing auto-resolved and nothing auto-billed. Catch-net: all five sit `awaiting_approval`. After deploy: password ticket should auto-resolve if allowlist + ≥0.85; dashboard ticket must escalate, never auto-bill.

## Local proofs

`npm run proof:gmail-intake` — alias map, CO notify copy, kill-switch halt blocks Tier A.

## Deploy blocker (do not sit idle)

This VM has no `SUPABASE_ACCESS_TOKEN`. From `C:\Users\daves\wmg-backend-bricely`:

```bat
npx supabase functions deploy email-intake --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
npx supabase functions deploy intake-ticket --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
npx supabase functions deploy process-ticket-ai --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
npx supabase functions deploy bricely-thread --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
```

Or `scripts/deploy-triage-functions.sh apxbwdxszmdffbduhjen`.

Set function secret `AUTONOMY_HALT=false` (kill switch `halt:true` → `true` to stop mid-flight). HMAC: `INTAKE_HMAC_SECRET` if you want the Gmail pipe locked.

Going forward: WMG app POSTs `{ type: "CHANGE ORDER WAITING FOR APPROVAL", ... }` to `email-intake` → Bricely mails the customer with the Your Support link (`attach_pdf: false`; default CC David only). `{ type: "CHANGE ORDER APPROVED" }` → official Quote/Proposal PDF only when `customer_accepted_at` + `prime_send_approved_at` + `prime_send_approved_by` are set; otherwise 409 and no mail.
