# PRIME Support Triage (v1)

Standalone multi-tenant support triage for PRIME-TIME Systems.
**First client:** WMG OS. Reusable for other PRIME-hosted products later.

## Isolation (non-negotiable)

- This app lives under `wmg-backend/support-triage/` but is **not** part of WMG OS runtime.
- It uses its **own** Supabase project / local stack. Do **not** `db push` these migrations against the WMG OS production project (`qcefkoxqkfwnlqfmwzmi`).
- WMG OS remains a *client* (data row + knowledge base references), not the host database.

## Principles

1. Three lanes + AMBIGUOUS: `auto_resolve` | `needs_approval` | `billable` | `ambiguous`
2. Auto-resolve only for admin allowlist entries — model may propose, never invent “safe”
3. No unattended production code changes — Cursor handoff requires human approval
4. Billable judged per-client against `client_contracts`
5. Every AI classification is a proposal with confidence + human override (training signal)

## Local staging

```bash
cd support-triage
npm install
npx supabase start          # local Postgres + API (staging)
npx supabase db reset       # applies migrations + seed
npm run dev                 # operator dashboard
```

## Env

Copy `.env.example` → `.env.local`:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — local or staging project
- Edge secrets: `ANTHROPIC_API_KEY`, `CURSOR_DISPATCH_WEBHOOK_URL` (optional stub), `INTAKE_HMAC_SECRET`

## Build order status

See `STATUS.md`.
